import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { CreateProductSizeDto } from 'src/product_size/dto/create-product_size.dto';

export class CreateProductVersionDto {
  @IsNotEmpty()
  @IsString()
  color: string;

  @IsNotEmpty()
  @IsString()
  price: number;

  @IsOptional()
  @IsString()
  image?: string;
}
