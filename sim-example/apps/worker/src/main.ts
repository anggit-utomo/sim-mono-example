import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  // No HTTP server: this process only consumes jobs.
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks(); // lets in-flight jobs finish on SIGTERM
}
bootstrap();
