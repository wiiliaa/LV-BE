export class CreateOrderDto {
  user_id: number;

  cartItems: CartItemDto[];
}

export class CartItemDto {
  versionId: number;

  quantity: number;

  sizes: SizeItemDto[];

  shopId: number;
}

export class SizeItemDto {
  sizeName: string;
  quantity: number;
}
