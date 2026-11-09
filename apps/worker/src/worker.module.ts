import { Injectable, Module } from '@nestjs/common';

@Injectable()
export class WorkerService {
  lanes(): string {
    return process.env.WORKER_LANES ?? 'fast,cron';
  }
}

@Module({
  providers: [WorkerService],
})
export class WorkerModule {}
