import { IsInt, IsPositive } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  quantity: number;

  @IsInt()
  orderId: number;

  @IsInt()
  productId: number;
}
