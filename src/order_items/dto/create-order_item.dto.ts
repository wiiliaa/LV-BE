import { IsInt, IsPositive } from 'class-validator';

export class CreateOrderItemDto {
  order_id: number;

  version_id: number;

  quantity: number;

  discountedPrice: number;
}
