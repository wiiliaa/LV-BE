import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateShopDto {
  @IsOptional()
  name?: string;
}
