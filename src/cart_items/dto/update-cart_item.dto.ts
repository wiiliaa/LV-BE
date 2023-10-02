import { IsOptional } from 'class-validator';

export class UpdateCartItemDto {
  @IsOptional()
  cartId?: number;

  @IsOptional()
  productId?: number;

  @IsOptional()
  quantity?: number;
}
