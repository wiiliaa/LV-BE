import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDate,
  IsOptional,
} from 'class-validator';

export class UpdateDiscountDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  endDate?: Date;

  @IsOptional()
  percent?: number;

  @IsOptional()
  description?: string;

  @IsOptional()
  image: string;

  @IsOptional()
  active?: Date;
}
