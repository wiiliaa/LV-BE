export class CreateProductDto {
  name: string;

  brand: string;

  price: number;

  description: string;

  image: string;

  gender: string;

  type: string;

  origin: string;

  discountedPrice: number;

  dconstructor() {
    // Thiết lập mặc định cho discountedPrice bằng giá price
    this.discountedPrice = this.price;
  }
}
