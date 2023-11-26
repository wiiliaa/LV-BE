export class CreateProductDto {
  name: string;

  brand: string;

  price: number;

  description: string;

  image: string;

  gender: string;

  type: string;

  origin: string;

  ProductSizes: sizeDto[];
}

interface sizeDto {
  sizeName: string;
  productId: number;
  quantity: number;
}
