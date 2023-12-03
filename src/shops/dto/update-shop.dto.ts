import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateShopDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  shop_payment: string;

  @IsOptional()
  description: string;

  @IsOptional()
  address: string;
}
