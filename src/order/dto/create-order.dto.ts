export class CreateOrderDto {
  user_id: number;

  cartItems: CartItemDto[];
}

export class CartItemDto {
  versionId: number;

  discountedPrice: number;

  quantity: number;

  sizes: SizeItemDto[];

  shopId: number;
}

export class SizeItemDto {
  quantity: number;
  sizeId: number;
}
