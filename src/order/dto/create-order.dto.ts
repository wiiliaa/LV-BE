export class CreateOrderDto {
  total: number;

  user_id: number;

  cartItems: CartItemDto[];
}

export class CartItemDto {
  version_id: number;

  size_quantity: number;

  shop_id: number;
}
