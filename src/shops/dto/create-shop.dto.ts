import { IsNotEmpty } from 'class-validator';

export class CreateShopDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  shop_payment: string;

  @IsNotEmpty()
  user_id: number;

  avatar: string;
}
