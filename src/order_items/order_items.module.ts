import { Module } from '@nestjs/common';
import { OrderItemsService } from './order_items.service';
import { OrderItemsController } from './order_items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderItem } from './entities/order_item.entity';

@Module({
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
  imports: [TypeOrmModule.forFeature([OrderItem])],
})
export class OrderItemsModule {}
