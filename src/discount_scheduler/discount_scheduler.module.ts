import { Module } from '@nestjs/common';
import { DiscountSchedulerService } from './discount_scheduler.service';
import { DiscountSchedulerController } from './discount_scheduler.controller';
import { DiscountsModule } from 'src/discounts/discounts.module';

@Module({
  controllers: [DiscountSchedulerController],
  providers: [DiscountSchedulerService],
  imports: [DiscountsModule],
})
export class DiscountSchedulerModule {}
