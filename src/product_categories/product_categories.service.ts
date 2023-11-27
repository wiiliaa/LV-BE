// product-category.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product_category.entity';
import { CreateProductCategoryDto } from './dto/create-product_category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private productCategoryRepository: Repository<ProductCategory>,
  ) {}

  async findAll(): Promise<ProductCategory[]> {
    return this.productCategoryRepository.find();
  }

  async findOne(id: number): Promise<ProductCategory> {
    return this.productCategoryRepository.findOne({ where: { id } });
  }

  async create(categoryData: CreateProductCategoryDto) {
    const category = this.productCategoryRepository.create(categoryData);
    return this.productCategoryRepository.save(category);
  }

  async update(
    id: number,
    categoryData: Partial<ProductCategory>,
  ): Promise<ProductCategory> {
    await this.productCategoryRepository.update(id, categoryData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.productCategoryRepository.delete(id);
  }
}
