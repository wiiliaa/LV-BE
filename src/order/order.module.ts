import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from 'src/order_items/entities/order_item.entity';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [TypeOrmModule.forFeature([Order, OrderItem, CartItem])],
  exports: [OrderService],
})
export class OrderModule {}
