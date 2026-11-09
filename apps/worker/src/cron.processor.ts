import { Logger } from '@nestjs/common';
import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '@sim/db';
import {
  CRON_QUEUE,
  FAST_LANE_JOB_OPTS,
  FAST_LANE_QUEUE,
  JOBS,
  MAX_TOTAL_ATTEMPTS,
  ProcessIngestData,
  ingestJobId,
} from '@sim/shared';
import { recordJobRun } from './job-run.recorder';

// CRON LANE: concurrency 1, so two sweeps can never overlap.
@Processor(CRON_QUEUE, { concurrency: 1 })
export class CronProcessor extends WorkerHost {
  private readonly logger = new Logger(CronProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(FAST_LANE_QUEUE) private readonly fastLane: Queue,
  ) {
    super();
  }

  async process(job: Job) {
    const log = `jobId=${job.id ?? '?'} jobName=${job.name}`;
    switch (job.name) {
      case JOBS.SWEEP_PENDING: {
        const result = await this.sweepPending();
        this.logger.log(`${log} enqueued=${result.enqueued}`);
        return result;
      }
      case JOBS.AGGREGATE_STATS: {
        const result = await this.aggregateStats();
        this.logger.log(`${log} customers=${result.customers}`);
        return result;
      }
      default:
        throw new Error(`Unknown cron job: ${job.name}`);
    }
  }

  // Safety net: anything the fast lane did not finish gets pushed back into it.
  private async sweepPending() {
    const now = Date.now();
    const rows = await this.prisma.customerIngest.findMany({
      where: {
        OR: [
          { status: 'PENDING', createdAt: { lt: new Date(now - 60_000) } }, // never enqueued / lost
          { status: 'FAILED', attempts: { lt: MAX_TOTAL_ATTEMPTS } }, // retries exhausted
          { status: 'PROCESSING', updatedAt: { lt: new Date(now - 10 * 60_000) } }, // worker died
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 5_000,
      select: { id: true, attempts: true },
    });
    if (rows.length === 0) return { enqueued: 0 };

    await this.fastLane.addBulk(
      rows.map((r) => ({
        name: JOBS.PROCESS_INGEST,
        data: { ingestId: r.id } satisfies ProcessIngestData,
        opts: { ...FAST_LANE_JOB_OPTS, jobId: ingestJobId(r.id, r.attempts) },
      })),
    );
    this.logger.log(`sweeper re-enqueued ${rows.length} ingest rows`);
    return { enqueued: rows.length };
  }

  private async aggregateStats() {
    const [customers, byStatus] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customerIngest.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    // Retention: history older than 30 days is deleted by the nightly cron.
    const pruned = await this.prisma.jobRun
      .deleteMany({ where: { finishedAt: { lt: new Date(Date.now() - 30 * 24 * 3600_000) } } })
      .catch(() => ({ count: 0 }));
    return {
      customers,
      ingest: Object.fromEntries(byStatus.map((r) => [r.status, r._count._all])),
      prunedJobRuns: pruned.count,
    };
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    if (!job) return;
    await recordJobRun(this.prisma, CRON_QUEUE, job, 'COMPLETED');
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job | undefined, err: Error) {
    if (!job) return;
    this.logger.warn(`jobId=${job.id ?? '?'} jobName=${job.name} failed error=${err.message}`);
    await recordJobRun(this.prisma, CRON_QUEUE, job, 'FAILED', err);
  }
}
