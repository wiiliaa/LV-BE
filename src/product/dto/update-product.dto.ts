import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  brand: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  image: string;

  @IsOptional()
  gender: string;

  @IsOptional()
  type: string;

  @IsOptional()
  origin: string;
}
