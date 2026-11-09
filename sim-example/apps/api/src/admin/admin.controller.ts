import { BadRequestException, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CRON_JOB_NAMES, CRON_QUEUE, CronJobName, FAST_LANE_QUEUE } from '@sim/shared';

// The dashboard calls these. It never talks to Redis directly.
@Controller('admin')
export class AdminController {
  constructor(
    @InjectQueue(FAST_LANE_QUEUE) private readonly fastLane: Queue,
    @InjectQueue(CRON_QUEUE) private readonly cron: Queue,
  ) {}

  @Get('queues')
  async queues() {
    const [fastLane, cron] = await Promise.all([this.fastLane.getJobCounts(), this.cron.getJobCounts()]);
    return { fastLane, cron };
  }

  // Manual run of a cron job = add the same job to the cron queue right now.
  @Post('cron/:name/trigger')
  async trigger(@Param('name') name: string) {
    if (!CRON_JOB_NAMES.includes(name as CronJobName)) {
      throw new BadRequestException(`Unknown cron job: ${name}`);
    }
    const job = await this.cron.add(
      name,
      { triggeredBy: 'manual' },
      { removeOnComplete: { count: 100 }, removeOnFail: { count: 100 } },
    );
    return { jobId: job.id };
  }

  // Retry a failed fast-lane job (only works while it is still in Redis).
  @Post('fast-lane/jobs/:id/retry')
  async retry(@Param('id') id: string) {
    const job = await this.fastLane.getJob(id);
    if (!job) throw new NotFoundException('Job not found (expired from Redis?)');
    await job.retry();
    return { retried: id };
  }
}
