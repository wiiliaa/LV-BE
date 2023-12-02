export class CreateOrderDto {
  user_id: number;

  cartItems: CartItemDto[];
}

export class CartItemDto {
  price: number;

  discountPrice: number;

  versionId: number;

  quantity: number;

  sizes: SizeItemDto[];

  shopId: number;
}

export class SizeItemDto {
  sizeName: string;
  quantity: number;
}
