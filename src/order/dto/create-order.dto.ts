import { IsInt, IsPositive } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @IsPositive()
  total: number;

  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  discountId: number;
}
