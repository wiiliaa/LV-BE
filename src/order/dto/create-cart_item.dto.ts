import { IsInt, IsPositive } from 'class-validator';

export class CartItemDto {
  cart_id: number;
  versionId: number;

  quantity: number;

  shop_id: number;
}
