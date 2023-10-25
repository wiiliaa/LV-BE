import { Module } from '@nestjs/common';
import { ProductCategoriesService } from './product_categories.service';

import { ProductCategory } from './entities/product_category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoryController } from './product_categories.controller';

@Module({
  controllers: [ProductCategoryController],
  providers: [ProductCategoriesService],
  imports: [TypeOrmModule.forFeature([ProductCategory])],
})
export class ProductCategoriesModule {}
