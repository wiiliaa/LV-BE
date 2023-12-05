import { Module } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity';
import { ProductModule } from 'src/product/product.module';
import { ImageModule } from 'src/image/image.module';

@Module({
  controllers: [DiscountsController],
  providers: [DiscountsService],
  imports: [TypeOrmModule.forFeature([Discount]), ProductModule, ImageModule],
  exports: [DiscountsService],
})
export class DiscountsModule {}
