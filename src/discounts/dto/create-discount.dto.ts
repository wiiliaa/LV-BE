import { IsNumber, IsString } from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  name: string;

  @IsNumber()
  limit: number;

  @IsNumber()
  percent: number;

  @IsString()
  description: string;

  image: string;
}
