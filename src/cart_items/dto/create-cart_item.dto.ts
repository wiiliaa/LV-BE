import { IsInt, IsPositive } from 'class-validator';

export class CreateCartItemDto {
  cart_id: number;
  shop_id: number;
  address: string;
  versionId: number;
  sizeId: number;
  quantity: number;
}
