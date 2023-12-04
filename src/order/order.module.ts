import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from 'src/order_items/entities/order_item.entity';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { ProductSize } from 'src/product_size/entities/product_size.entity';
import { Image } from 'src/image/entities/image.entity';
import { ImageModule } from 'src/image/image.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, CartItem, Cart, ProductSize]),
    ImageModule,
  ],
  exports: [OrderService],
})
export class OrderModule {}
