import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  total?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  userId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  discountId?: number;
}
