import { Module } from '@nestjs/common';
import { ProductVersionService } from './product-version.service';
import { ProductVersionController } from './product-version.controller';
import { ProductVersion } from './entities/product-version.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSizeModule } from 'src/product_size/product_size.module';
import { Product } from 'src/product/entities/product.entity';
import { ProductModule } from 'src/product/product.module';

@Module({
  controllers: [ProductVersionController],
  providers: [ProductVersionService],
  imports: [
    TypeOrmModule.forFeature([ProductVersion]),
    ProductSizeModule,
    ProductModule,
  ],
  exports: [ProductVersionService],
})
export class ProductVersionModule {}
