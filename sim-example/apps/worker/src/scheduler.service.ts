import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CRON_QUEUE, JOBS } from '@sim/shared';

// Registers the cron schedules. upsertJobScheduler is idempotent, so restarts don't duplicate them.
@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(@InjectQueue(CRON_QUEUE) private readonly cron: Queue) {}

  async onModuleInit() {
    const opts = { removeOnComplete: { count: 100 }, removeOnFail: { count: 100 } };

    await this.cron.upsertJobScheduler('sweep-pending', { pattern: '*/2 * * * *' }, { name: JOBS.SWEEP_PENDING, data: {}, opts });

    await this.cron.upsertJobScheduler(
      'aggregate-stats',
      { pattern: '0 2 * * *', tz: process.env.CRON_TZ ?? 'UTC' },
      { name: JOBS.AGGREGATE_STATS, data: {}, opts },
    );
  }
}
