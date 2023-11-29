import { Module } from '@nestjs/common';
import { CartItemService } from './cart_items.service';
import { CartItemController } from './cart_items.controller';
import { CartItem } from './entities/cart_item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';
import { ProductVersion } from 'src/product-version/entities/product-version.entity';

@Module({
  controllers: [CartItemController],
  providers: [CartItemService],
  imports: [TypeOrmModule.forFeature([CartItem]), ProductVersion],
  exports: [CartItemService],
})
export class CartItemsModule {}
