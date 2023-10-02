import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductSizeDto {
  @IsNumber()
  productId: number;

  sizeName: string;

  @IsNumber()
  quantity: number;
}
