import { IsInt, IsPositive } from 'class-validator';

export class CreateCartItemDto {
  cartId: number;

  productId: number;

  quantity: number;
}
