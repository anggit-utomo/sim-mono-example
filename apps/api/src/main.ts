import 'reflect-metadata';
import path from 'path';
import { config } from 'dotenv';
// Load repo-root .env (turbo runs each app with its own cwd, so env
// must be loaded explicitly, not inherited from the shell). Tries dist-,
// src-, and cwd-relative locations; dotenv skips missing files and never
// overrides already-set vars.
for (const p of [
  path.resolve(__dirname, '..', '..', '..', '.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '..', '.env'),
]) {
  config({ path: p });
}
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`api listening on ${port}`);
}
bootstrap();
