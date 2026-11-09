import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '@sim/db';
import { CustomerPayload, FAST_LANE_QUEUE, ProcessIngestData } from '@sim/shared';

// FAST LANE: high concurrency, starts as soon as the API adds a job (no polling interval).
@Processor(FAST_LANE_QUEUE, { concurrency: Number(process.env.FAST_LANE_CONCURRENCY ?? 20) })
export class FastLaneProcessor extends WorkerHost {
  private readonly logger = new Logger(FastLaneProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<ProcessIngestData>) {
    const ingest = await this.prisma.customerIngest.findUnique({ where: { id: job.data.ingestId } });
    if (!ingest) return { skipped: 'ingest-not-found' };
    if (ingest.status === 'DONE') return { skipped: 'already-done' }; // idempotent

    await this.prisma.customerIngest.update({
      where: { id: ingest.id },
      data: { status: 'PROCESSING', attempts: { increment: 1 } },
    });

    const data = ingest.payload as unknown as CustomerPayload;

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.customer.findUnique({
        where: { externalId: ingest.externalId },
        select: { lastIngestAt: true },
      });
      // A newer request for this customer was already applied: don't overwrite it.
      if (existing && existing.lastIngestAt > ingest.createdAt) return 'stale' as const;

      await tx.customer.upsert({
        where: { externalId: ingest.externalId },
        create: { externalId: data.externalId, name: data.name, email: data.email, lastIngestAt: ingest.createdAt },
        update: { name: data.name, email: data.email, lastIngestAt: ingest.createdAt },
      });
      return 'applied' as const;
    });

    await this.prisma.customerIngest.update({
      where: { id: ingest.id },
      data: { status: 'DONE', processedAt: new Date(), lastError: null },
    });

    return { ingestId: ingest.id, result };
  }

  // After the LAST retry fails, mark the row FAILED so the sweeper / dashboard can see it.
  @OnWorkerEvent('failed')
  async onFailed(job: Job<ProcessIngestData> | undefined, err: Error) {
    if (!job) return;
    this.logger.warn(`Job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`);
    const exhausted = job.attemptsMade >= (job.opts.attempts ?? 1);
    if (!exhausted) return;
    await this.prisma.customerIngest
      .update({ where: { id: job.data.ingestId }, data: { status: 'FAILED', lastError: err.message.slice(0, 1000) } })
      .catch(() => undefined);
  }
}
