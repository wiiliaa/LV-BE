// update-product-category.dto.ts
import { IsString } from 'class-validator';

export class UpdateProductCategoryDto {
  @IsString()
  name?: string;
}
