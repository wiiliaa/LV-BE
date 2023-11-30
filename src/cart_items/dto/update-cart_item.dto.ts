import { IsOptional } from 'class-validator';

export class UpdateCartItemDto {
  cartItemId: number;

  @IsOptional()
  size_quantity?: number;
}
