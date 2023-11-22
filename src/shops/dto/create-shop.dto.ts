import { IsNotEmpty } from 'class-validator';

export class CreateShopDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  user_id: number;
}
