import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  name: string;

  @IsOptional()
  brand: string;

  @IsOptional()
  @IsNumber()
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
  discountedPrice: number;
  constructor() {
    // Thiết lập mặc định cho discountedPrice bằng giá price
    this.discountedPrice = this.price;
  }
}
