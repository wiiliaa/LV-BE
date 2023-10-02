export class CreateProductDto {
  name: string;

  brand: string;

  price: number;

  description: string;

  ProductSizes: sizeDto[];
}

interface sizeDto {
  sizeName: string;
  productId: number;
  quantity: number;
}
