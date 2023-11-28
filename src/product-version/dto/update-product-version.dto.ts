import { IsString, IsOptional, IsArray } from 'class-validator';
import { UpdateProductSizeDto } from 'src/product_size/dto/update-product_size.dto';

export class UpdateProductVersionDto {
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  price: number;
}
