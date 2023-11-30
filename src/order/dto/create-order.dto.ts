import { IsInt, IsPositive } from 'class-validator';
import { CartItemDto } from './create-cart_item.dto';

export class CreateOrderDto {
  total: number;

  user_id: number;

  cartItems: CartItemDto[];
}
