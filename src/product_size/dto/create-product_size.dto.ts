import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProductSizeDto {
  sizeName: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  product_id?: number;

  @IsOptional()
  @IsNumber()
  version_id?: number;
}
