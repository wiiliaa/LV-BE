import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  name: string;

  @IsOptional()
  brand: string;

  @IsOptional()
  price: number;

  @IsOptional()
  description: string;

  @IsOptional()
  image: string;

  @IsOptional()
  gender: string;

  @IsOptional()
  type: string;

  @IsOptional()
  origin: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds?: number | number[];
}
