import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CRON_QUEUE, FAST_LANE_QUEUE, redisConnection } from '@sim/shared';
import { PrismaService } from '@sim/db';
import { FastLaneProcessor } from './fast-lane.processor';
import { CronProcessor } from './cron.processor';
import { SchedulerService } from './scheduler.service';

// WORKER_LANES=fast,cron (default) | fast | cron
// Same code, so you can later deploy the lanes as two separate processes.
const lanes = (process.env.WORKER_LANES ?? 'fast,cron').split(',').map((s) => s.trim());

@Module({
  imports: [
    BullModule.forRoot({ connection: redisConnection() }),
    BullModule.registerQueue({ name: FAST_LANE_QUEUE }, { name: CRON_QUEUE }),
  ],
  providers: [
    PrismaService,
    ...(lanes.includes('fast') ? [FastLaneProcessor] : []),
    ...(lanes.includes('cron') ? [CronProcessor, SchedulerService] : []),
  ],
})
export class WorkerModule {}
