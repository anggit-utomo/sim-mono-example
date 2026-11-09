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

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(FAST_LANE_QUEUE) private readonly fastLane: Queue,
  ) {}

  async accept(operation: IngestOperation, payload: CustomerPayload) {
    // 1) Store first (inbox). If anything below fails, the row stays PENDING.
    const ingest = await this.prisma.customerIngest.create({
      data: { externalId: payload.externalId, operation, payload: { ...payload } },
    });

    // 2) Fast lane: enqueue immediately so a worker picks it up right away.
    try {
      const data: ProcessIngestData = { ingestId: ingest.id };
      await this.fastLane.add(JOBS.PROCESS_INGEST, data, {
        ...FAST_LANE_JOB_OPTS,
        jobId: ingestJobId(ingest.id, 0),
      });
    } catch (err) {
      // Redis down? Still accept: the cron sweeper will enqueue this row later.
      this.logger.error(`Enqueue failed for ${ingest.id}: ${(err as Error).message}`);
    }

    return { ingestId: ingest.id, status: 'ACCEPTED' };
  }
}
