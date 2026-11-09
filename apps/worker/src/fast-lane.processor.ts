import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '@sim/db';
import { CustomerPayload, FAST_LANE_QUEUE, ProcessIngestData } from '@sim/shared';
import { recordJobRun } from './job-run.recorder';

// Magic name prefix that forces a throw. Training-only fault injection for
// test scenario 6 (3 attempts, then FAILED). Remove before real migration.
export const INJECTED_FAULT_PREFIX = '__FAIL__';

// FAST LANE: high concurrency, starts as soon as the API adds a job (no polling interval).
@Processor(FAST_LANE_QUEUE, { concurrency: Number(process.env.FAST_LANE_CONCURRENCY ?? 20) })
export class FastLaneProcessor extends WorkerHost {
  private readonly logger = new Logger(FastLaneProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private prefix(job: Job<ProcessIngestData>) {
    return `jobId=${job.id ?? '?'} ingestId=${job.data.ingestId}`;
  }

  async process(job: Job<ProcessIngestData>) {
    const log = `${this.prefix(job)}`;
    const ingest = await this.prisma.customerIngest.findUnique({ where: { id: job.data.ingestId } });
    if (!ingest) {
      this.logger.log(`${log} skipped ingest-not-found`);
      return { skipped: 'ingest-not-found' };
    }
    if (ingest.status === 'DONE') {
      this.logger.log(`${log} skipped already-done`);
      return { skipped: 'already-done' }; // idempotent
    }

    await this.prisma.customerIngest.update({
      where: { id: ingest.id },
      data: { status: 'PROCESSING', attempts: { increment: 1 } },
    });

    const data = ingest.payload as unknown as CustomerPayload;
    if (data.name.startsWith(INJECTED_FAULT_PREFIX)) {
      throw new Error(`injected fault for ${ingest.id}`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.customer.findUnique({
        where: { externalId: ingest.externalId },
        select: { lastIngestAt: true },
      });
      // A newer request for this customer was already applied: don't overwrite it.
      if (existing && existing.lastIngestAt > ingest.createdAt) {
        this.logger.log(`${log} stale, keeping newer customer state`);
        return 'stale' as const;
      }

      await tx.customer.upsert({
        where: { externalId: ingest.externalId },
        create: {
          externalId: data.externalId,
          name: data.name,
          email: data.email,
          lastIngestAt: ingest.createdAt,
        },
        update: { name: data.name, email: data.email, lastIngestAt: ingest.createdAt },
      });
      return 'applied' as const;
    });

    await this.prisma.customerIngest.update({
      where: { id: ingest.id },
      data: { status: 'DONE', processedAt: new Date(), lastError: null },
    });

    this.logger.log(`${log} done result=${result}`);
    return { ingestId: ingest.id, result };
  }

  // After the LAST retry fails, mark the row FAILED so the sweeper / dashboard can see it.
  @OnWorkerEvent('failed')
  async onFailed(job: Job<ProcessIngestData> | undefined, err: Error) {
    if (!job) return;
    const log = this.prefix(job);
    this.logger.warn(`${log} failed attempt=${job.attemptsMade} error=${err.message}`);
    await recordJobRun(this.prisma, FAST_LANE_QUEUE, job, 'FAILED', err);
    const exhausted = job.attemptsMade >= (job.opts.attempts ?? 1);
    if (!exhausted) return;
    await this.prisma.customerIngest
      .update({
        where: { id: job.data.ingestId },
        data: { status: 'FAILED', lastError: err.message.slice(0, 1000) },
      })
      .catch(() => undefined);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<ProcessIngestData>) {
    if (!job) return;
    await recordJobRun(this.prisma, FAST_LANE_QUEUE, job, 'COMPLETED');
  }
}
