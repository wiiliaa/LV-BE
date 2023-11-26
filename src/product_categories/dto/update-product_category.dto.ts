// update-product-category.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateProductCategoryDto {
  @IsString()
  name?: string;

  @IsOptional()
  image: string;
}
