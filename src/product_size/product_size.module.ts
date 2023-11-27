import { Module } from '@nestjs/common';
import { ProductSizeService } from './product_size.service';
import { ProductSizeController } from './product_size.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSize } from './entities/product_size.entity';
import { ProductVersionModule } from 'src/product-version/product-version.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  controllers: [ProductSizeController],
  providers: [ProductSizeService],
  imports: [TypeOrmModule.forFeature([ProductSize]), ProductVersionModule],
  exports: [ProductSizeService],
})
export class ProductSizeModule {}
