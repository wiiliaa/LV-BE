import { IsNumber, IsString } from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  name: string;

  @IsNumber()
  endDate: Date;

  @IsNumber()
  percent: number;

  @IsString()
  description: string;

  image: string;
}
