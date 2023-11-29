import { Injectable } from '@nestjs/common';
import { CreateCategoryItemDto } from './dto/create-category_item.dto';
import { UpdateCategoryItemDto } from './dto/update-category_item.dto';

@Injectable()
export class CategoryItemsService {
  create(createCategoryItemDto: CreateCategoryItemDto) {
    return 'This action adds a new categoryItem';
  }

  findAll() {
    return `This action returns all categoryItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoryItem`;
  }

  update(id: number, updateCategoryItemDto: UpdateCategoryItemDto) {
    return `This action updates a #${id} categoryItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoryItem`;
  }
}
