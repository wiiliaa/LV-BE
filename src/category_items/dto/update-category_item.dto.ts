import { PartialType } from '@nestjs/swagger';
import { CreateCategoryItemDto } from './create-category_item.dto';

export class UpdateCategoryItemDto extends PartialType(CreateCategoryItemDto) {}
