import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class UpdateProductSizeDto {
  @IsOptional()
  quantity: number;

  @IsOptional()
  sizeName: string;
}
