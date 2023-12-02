export class CreateOrderDto {
  user_id: number;

  cartItems: CartItemDto[];
}

export class CartItemDto {
  price: number;

  discountPrice: number;

  versionId: number;

  quantity: number;

  sizeId: number;

  shopId: number;
}
