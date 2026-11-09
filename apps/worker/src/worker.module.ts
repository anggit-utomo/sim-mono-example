import { Injectable, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CRON_QUEUE, FAST_LANE_QUEUE, redisConnection } from '@sim/shared';
import { PrismaService } from '@sim/db';
import { CronProcessor } from './cron.processor';
import { FastLaneProcessor } from './fast-lane.processor';
import { SchedulerService } from './scheduler.service';

@Injectable()
export class WorkerService {
  lanes(): string {
    return process.env.WORKER_LANES ?? 'fast,cron';
  }
}

// WORKER_LANES=fast,cron (default) | fast | cron
// Same code, so the lanes can later deploy as two separate processes.
const lanes = (process.env.WORKER_LANES ?? 'fast,cron').split(',').map((s) => s.trim());

// No HTTP server: this process only consumes jobs.
@Module({
  imports: [
    BullModule.forRoot({ connection: redisConnection() }),
    BullModule.registerQueue({ name: FAST_LANE_QUEUE }, { name: CRON_QUEUE }),
  ],
  providers: [
    PrismaService,
    WorkerService,
    ...(lanes.includes('fast') ? [FastLaneProcessor] : []),
    ...(lanes.includes('cron') ? [CronProcessor, SchedulerService] : []),
  ],
})
export class WorkerModule {}
