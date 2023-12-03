export class CreateOrderDto {
  user_id: number;
  total: number;
  cartItems: CartItemDto[];
}

export class CartItemDto {
  shopId: number;
  totalPrice: number;
  Versions: VersionsDto[];
}

export class VersionsDto {
  quantity: number;
  sizeId: number;
  sellingPrice: number;
  versionId: number;
}
