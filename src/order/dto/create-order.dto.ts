export class CreateOrderDto {
  user_id: number;

  cartItems: CartItemDto[];
}

export class CartItemDto {
  versionId: number;

  quantity: number;

  sizeId: number;

  shopId: number;
}
