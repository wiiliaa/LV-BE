import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchKeywordModule } from 'src/search_keyword/search_keyword.module';
import { ImageModule } from 'src/image/image.module';
import { ProductCategoriesModule } from 'src/product_categories/product_categories.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [
    TypeOrmModule.forFeature([Product]),

    SearchKeywordModule,
    ImageModule,
    ProductCategoriesModule,
  ],
  exports: [ProductService],
})
export class ProductModule {}
