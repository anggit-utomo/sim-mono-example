import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CRON_QUEUE, FAST_LANE_QUEUE, redisConnection } from '@sim/shared';
import { PrismaService } from '@sim/db';
import { CustomersController } from './customers/customers.controller';
import { CustomersService } from './customers/customers.service';
import { AdminController } from './admin/admin.controller';

@Module({
  imports: [
    BullModule.forRoot({ connection: redisConnection() }),
    BullModule.registerQueue({ name: FAST_LANE_QUEUE }, { name: CRON_QUEUE }),
  ],
  controllers: [CustomersController, AdminController],
  providers: [PrismaService, CustomersService],
})
export class AppModule {}
// main.ts: remember app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
