import 'reflect-metadata';
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
