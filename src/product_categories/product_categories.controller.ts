// product-categories.controller.ts
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';

import { ProductCategory } from './entities/product_category.entity';
import { CreateProductCategoryDto } from './dto/create-product_category.dto';
import { UpdateProductCategoryDto } from './dto/update-product_category.dto';
import { ProductCategoriesService } from './product_categories.service';

@Controller('categories')
export class ProductCategoryController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) { }

  @Get('getAll')
  findAll(): Promise<ProductCategory[]> {
    return this.productCategoriesService.findAll();
  }

  @Get('detail/:id')
  findOne(@Param('id') id: number) {
    return this.productCategoriesService.findOne(id);
  }

  @Post('createCategory')
  create(
    @Body() createProductCategoryDto: CreateProductCategoryDto,
  ): Promise<ProductCategory> {
    return this.productCategoriesService.create(createProductCategoryDto);
  }

  @Put('updateCategory/:id')
  update(
    @Param('id') id: number,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ): Promise<{ success: boolean }> {
    return this.productCategoriesService.update(id, updateProductCategoryDto);
  }

  @Delete('delete/:id')
  deleteCategory(@Param('id') id: number): Promise<{ success: boolean }> {
    return this.productCategoriesService.deleteCategory(id);
  }
}
