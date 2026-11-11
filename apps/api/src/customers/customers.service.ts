import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IngestOperation, PrismaService } from '@sim/db';
import {
  CustomerPayload,
  FAST_LANE_JOB_OPTS,
  FAST_LANE_QUEUE,
  JOBS,
  ProcessIngestData,
  ingestJobId,
} from '@sim/shared';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  // Upper bound on waiting for Redis. Past this we accept anyway and let the
  // sweeper enqueue the PENDING row once Redis is back.
  private readonly enqueueTimeoutMs = 3_000;

  // Training/demo knob: hold accepted rows in PENDING this long before the
  // fast-lane worker may pick them up (job sits in the delayed set, visible
  // under Queues -> delayed). Default 0 = deliver immediately.
  private readonly fastLaneDelayMs = Number(process.env.FAST_LANE_DELAY_MS ?? 0);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(FAST_LANE_QUEUE) private readonly fastLane: Queue,
  ) {}

  async acceptMany(operation: IngestOperation, payloads: CustomerPayload[]) {
    // 1) Store first (inbox), one row per item. If anything below fails, rows stay PENDING.
    const rows = await this.prisma.customerIngest.createManyAndReturn({
      data: payloads.map((p) => ({ externalId: p.externalId, operation, payload: { ...p } })),
      select: { id: true, externalId: true },
    });

    // 2) Fast lane: one Redis round-trip for the whole batch. The add is raced
    // against a timeout: when Redis is down BullMQ buffers instead of throwing,
    // and we must not hold the request open.
    try {
      const bulk = this.fastLane.addBulk(
        rows.map((r) => ({
          name: JOBS.PROCESS_INGEST,
          data: { ingestId: r.id } satisfies ProcessIngestData,
          opts: {
            ...FAST_LANE_JOB_OPTS,
            jobId: ingestJobId(r.id, 0),
            ...(this.fastLaneDelayMs > 0 ? { delay: this.fastLaneDelayMs } : {}),
          },
        })),
      );
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('enqueue timed out')), this.enqueueTimeoutMs),
      );
      await Promise.race([bulk, timeout]);
    } catch (err) {
      // Redis down? Still accept: the cron sweeper will enqueue these rows later.
      this.logger.error(`Enqueue failed for ${rows.length} rows: ${(err as Error).message}`);
    }
    this.logger.log(`accepted ${rows.length} rows delay=${this.fastLaneDelayMs / 1000}s`);

    return {
      status: 'ACCEPTED',
      delayMs: this.fastLaneDelayMs,
      count: rows.length,
      items: rows.map((r) => ({ ingestId: r.id, externalId: r.externalId })),
    };
  }
}
