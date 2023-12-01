import { Module } from '@nestjs/common';
import { CartItemService } from './cart_items.service';
import { CartItemController } from './cart_items.controller';
import { CartItem } from './entities/cart_item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductVersionModule } from 'src/product-version/product-version.module';
import { Cart } from 'src/carts/entities/cart.entity';
import { CartsModule } from 'src/carts/carts.module';

@Module({
  controllers: [CartItemController],
  providers: [CartItemService],
  imports: [
    TypeOrmModule.forFeature([CartItem]),
    ProductVersionModule,
    CartsModule,
  ],
  exports: [CartItemService],
})
export class CartItemsModule {}
