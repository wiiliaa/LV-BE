export class CreateOrderDto {
  total: number;

  user_id: number;

  cartItems: CartItemDto[];
}

export class CartItemDto {
  versionId: number;

  quantity: number;

  shopId: number;
}
