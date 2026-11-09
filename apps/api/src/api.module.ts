import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CRON_QUEUE, FAST_LANE_QUEUE, redisConnection } from '@sim/shared';
import { PrismaService } from '@sim/db';
import { CustomersController } from './customers/customers.controller';
import { CustomersService } from './customers/customers.service';
import { HealthController } from './app.module';

// API produces jobs only. It never registers processors; the worker consumes.
@Module({
  imports: [
    BullModule.forRoot({ connection: redisConnection() }),
    BullModule.registerQueue({ name: FAST_LANE_QUEUE }, { name: CRON_QUEUE }),
  ],
  controllers: [HealthController, CustomersController],
  providers: [PrismaService, CustomersService],
})
export class ApiModule {}
