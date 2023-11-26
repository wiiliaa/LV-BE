import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { CreateProductSizeDto } from 'src/product_size/dto/create-product_size.dto';

export class CreateProductVersionDto {
  @IsNotEmpty()
  @IsString()
  versionName: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  sizes?: CreateProductSizeDto[];
}
