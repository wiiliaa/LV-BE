import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductSizeModule } from 'src/product_size/product_size.module';
import { SearchKeywordModule } from 'src/search_keyword/search_keyword.module';
import { ImageModule } from 'src/image/image.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [
    TypeOrmModule.forFeature([Product]),
    ProductSizeModule,
    SearchKeywordModule,
    ImageModule,
  ],
  exports: [ProductService],
})
export class ProductModule {}
