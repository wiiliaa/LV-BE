import { Module } from '@nestjs/common';
import { DiscountsUsageService } from './discounts_usage.service';
import { DiscountsUsageController } from './discounts_usage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountUsage } from './entities/discounts_usage.entity';

@Module({
  controllers: [DiscountsUsageController],
  providers: [DiscountsUsageService],
  imports: [TypeOrmModule.forFeature([DiscountUsage])],
})
export class DiscountsUsageModule {}
