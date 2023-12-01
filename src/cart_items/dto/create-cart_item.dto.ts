import { IsInt, IsPositive } from 'class-validator';

export class CreateCartItemDto {
  cart_id: number;
  shop_id: number;

  versionId: number;
  size_id: number;
  sizeName: string;
  quantity: number;
}
