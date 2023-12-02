export class CreateOrderDto {
  user_id: number;
  shopId: number;
  total: number;
  cartItems: CartItemDto[];
}

export class CartItemDto {
  versionId: number;
  discountedPrice: number;

  quantity: number;

  sizes: SizeItemDto[];
}

export class SizeItemDto {
  quantity: number;
  sizeId: number;
  sizeName: string;
}
