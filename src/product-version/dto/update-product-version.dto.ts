import { IsString, IsOptional, IsArray } from 'class-validator';
import { UpdateProductSizeDto } from 'src/product_size/dto/update-product_size.dto';

export class UpdateProductVersionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
