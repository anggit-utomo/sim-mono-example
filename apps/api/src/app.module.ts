import { Controller, Get, Module } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { ok: true };
  }
}

@Module({
  controllers: [HealthController],
})
export class AppModule {}
