import { IsInt, IsPositive } from 'class-validator';

export class CreateOrderItemDto {
  quantity: number;

  orderId: number;

  versionId: number;
}
