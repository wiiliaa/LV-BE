import { IsString, IsOptional, IsArray } from 'class-validator';
import { UpdateProductSizeDto } from 'src/product_size/dto/update-product_size.dto';

export class UpdateProductVersionDto {
  @IsOptional()
  @IsString()
  versionName?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  sizes?: UpdateProductSizeDto[];
}
