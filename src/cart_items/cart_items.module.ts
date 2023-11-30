import { Module } from '@nestjs/common';
import { CartItemService } from './cart_items.service';
import { CartItemController } from './cart_items.controller';
import { CartItem } from './entities/cart_item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductVersionModule } from 'src/product-version/product-version.module';

@Module({
  controllers: [CartItemController],
  providers: [CartItemService],
  imports: [TypeOrmModule.forFeature([CartItem]), ProductVersionModule],
  exports: [CartItemService],
})
export class CartItemsModule {}
