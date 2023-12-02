import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { Cart } from './entities/cart.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageModule } from 'src/image/image.module';
import { ProductSizeModule } from 'src/product_size/product_size.module';

@Module({
  controllers: [CartsController],
  providers: [CartsService],
  imports: [TypeOrmModule.forFeature([Cart]), ImageModule, ProductSizeModule],
  exports: [CartsService],
})
export class CartsModule {}
