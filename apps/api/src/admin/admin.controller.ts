import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobType, Queue } from 'bullmq';
import { IngestStatus, JobRunStatus, PrismaService } from '@sim/db';
import {
  CRON_JOB_NAMES,
  CRON_QUEUE,
  CronJobName,
  FAST_LANE_JOB_OPTS,
  FAST_LANE_QUEUE,
  JOBS,
  MAX_TOTAL_ATTEMPTS,
  ProcessIngestData,
  ingestJobId,
} from '@sim/shared';
import { AdminGuard } from '../auth/admin.guard';
import { withQueue } from './with-queue';

const PAGE_SIZE = 50;
const JOB_STATES = ['waiting', 'active', 'delayed', 'completed', 'failed'] as const;
type JobState = (typeof JOB_STATES)[number];

function pageOf(raw: string | undefined): number {
  const n = Number(raw ?? 1);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

function laneQueue(lane: string, fastLane: Queue, cron: Queue): Queue {
  if (lane === 'fast-lane') return fastLane;
  if (lane === 'cron') return cron;
  throw new BadRequestException(`Unknown lane: ${lane}`);
}

// The dashboard calls these. It never talks to Redis directly.
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(FAST_LANE_QUEUE) private readonly fastLane: Queue,
    @InjectQueue(CRON_QUEUE) private readonly cron: Queue,
  ) {}

  @Get('queues')
  async queues() {
    const [fastLane, cron] = await withQueue(
      Promise.all([this.fastLane.getJobCounts(), this.cron.getJobCounts()]),
    );
    return { fastLane, cron };
  }

  @Get('queues/:lane/jobs')
  async jobs(
    @Param('lane') lane: string,
    @Query('state') state: string = 'waiting',
    @Query('page') pageRaw: string = '1',
  ) {
    if (!(JOB_STATES as readonly string[]).includes(state)) {
      throw new BadRequestException(`Unknown state: ${state}`);
    }
    const queue = laneQueue(lane, this.fastLane, this.cron);
    const page = pageOf(pageRaw);
    const start = (page - 1) * PAGE_SIZE;
    const jobs = await withQueue(queue.getJobs([state as JobType], start, start + PAGE_SIZE - 1));
    return {
      page,
      pageSize: PAGE_SIZE,
      items: jobs.map((j) => ({
        id: j.id,
        name: j.name,
        attemptsMade: j.attemptsMade,
        failedReason: j.failedReason ?? null,
        timestamp: j.timestamp,
        processedOn: j.processedOn ?? null,
        finishedOn: j.finishedOn ?? null,
      })),
    };
  }

  // Retry a failed fast-lane job (only works while it is still in Redis).
  @Post('fast-lane/jobs/:id/retry')
  async retry(@Param('id') id: string) {
    const job = await withQueue(this.fastLane.getJob(id));
    if (!job) throw new NotFoundException('Job not found (expired from Redis?)');
    await withQueue(job.retry());
    return { retried: id };
  }

  @Get('cron')
  async cronJobs(): Promise<unknown> {
    const schedulers = await withQueue(this.cron.getJobSchedulers());
    return Promise.all(
      schedulers.map(async (s) => {
        const last = await this.prisma.jobRun.findFirst({
          where: { queue: CRON_QUEUE, jobName: s.name ?? '' },
          orderBy: { finishedAt: 'desc' },
          select: { status: true, finishedAt: true, result: true, error: true },
        });
        return {
          name: s.name,
          pattern: (s as { pattern?: string }).pattern ?? null,
          tz: (s as { tz?: string }).tz ?? null,
          lastResult: last,
        };
      }),
    );
  }

  // Manual run of a cron job = add the same job to the cron queue right now.
  @Post('cron/:name/trigger')
  async trigger(@Param('name') name: string) {
    if (!CRON_JOB_NAMES.includes(name as CronJobName)) {
      throw new BadRequestException(`Unknown cron job: ${name}`);
    }
    const job = await withQueue(
      this.cron.add(
        name,
        { triggeredBy: 'manual' },
        { removeOnComplete: { count: 100 }, removeOnFail: { count: 100 } },
      ),
    );
    return { jobId: job.id };
  }

  @Get('ingests')
  async ingests(@Query('status') status?: string, @Query('page') pageRaw: string = '1'): Promise<unknown> {
    if (status !== undefined && !(Object.keys(IngestStatus) as string[]).includes(status)) {
      throw new BadRequestException(`Unknown status: ${status}`);
    }
    const page = pageOf(pageRaw);
    const where = status ? { status: status as IngestStatus } : {};
    const [total, items] = await Promise.all([
      this.prisma.customerIngest.count({ where }),
      this.prisma.customerIngest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);
    return { page, pageSize: PAGE_SIZE, total, items };
  }

  @Post('ingests/:id/requeue')
  async requeueOne(@Param('id') id: string) {
    const row = await this.prisma.customerIngest.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Ingest not found');
    const data: ProcessIngestData = { ingestId: row.id };
    const job = await withQueue(
      this.fastLane.add(JOBS.PROCESS_INGEST, data, {
        ...FAST_LANE_JOB_OPTS,
        jobId: ingestJobId(row.id, row.attempts),
      }),
    );
    return { jobId: job.id };
  }

  @Post('ingests/requeue-failed')
  async requeueFailed() {
    const rows = await this.prisma.customerIngest.findMany({
      where: { status: 'FAILED', attempts: { lt: MAX_TOTAL_ATTEMPTS } },
      orderBy: { createdAt: 'asc' },
      take: 5_000,
      select: { id: true, attempts: true },
    });
    if (rows.length === 0) return { enqueued: 0 };
    await withQueue(
      this.fastLane.addBulk(
        rows.map((r) => ({
          name: JOBS.PROCESS_INGEST,
          data: { ingestId: r.id } satisfies ProcessIngestData,
          opts: { ...FAST_LANE_JOB_OPTS, jobId: ingestJobId(r.id, r.attempts) },
        })),
      ),
    );
    return { enqueued: rows.length };
  }

  @Get('customers')
  async customers(@Query('page') pageRaw: string = '1', @Query('q') q?: string): Promise<unknown> {
    const page = pageOf(pageRaw);
    const where = q
      ? { OR: [{ externalId: q }, { email: { startsWith: q } }] }
      : {};
    const [total, items] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        orderBy: { externalId: 'asc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);
    return { page, pageSize: PAGE_SIZE, total, items };
  }

  @Get('job-runs')
  async jobRuns(
    @Query('queue') queue?: string,
    @Query('status') status?: string,
    @Query('page') pageRaw: string = '1',
  ): Promise<unknown> {
    if (status !== undefined && !(Object.keys(JobRunStatus) as string[]).includes(status)) {
      throw new BadRequestException(`Unknown status: ${status}`);
    }
    const page = pageOf(pageRaw);
    const where = {
      ...(queue ? { queue } : {}),
      ...(status ? { status: status as JobRunStatus } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.jobRun.count({ where }),
      this.prisma.jobRun.findMany({
        where,
        orderBy: { finishedAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);
    return { page, pageSize: PAGE_SIZE, total, items };
  }
}
