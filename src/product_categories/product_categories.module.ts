import { Module } from '@nestjs/common';
import { ProductCategoriesService } from './product_categories.service';

import { ProductCategory } from './entities/product_category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoryController } from './product_categories.controller';
import { ImageModule } from 'src/image/image.module';

@Module({
  controllers: [ProductCategoryController],
  providers: [ProductCategoriesService],
  imports: [TypeOrmModule.forFeature([ProductCategory]), ImageModule],
})
export class ProductCategoriesModule {}
