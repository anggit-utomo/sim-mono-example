import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { WorkerModule, WorkerService } from './worker.module';

async function bootstrap() {
  // No HTTP server: this process only consumes jobs (Phase 3+).
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  const svc = app.get(WorkerService);
  // eslint-disable-next-line no-console
  console.log(`worker started lanes=${svc.lanes()}`);
  // Keep the loop alive while connections are open; unref'd so SIGTERM can exit.
  setInterval(() => undefined, 1 << 30).unref();
}
bootstrap();
