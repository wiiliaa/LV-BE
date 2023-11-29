import { IsOptional } from 'class-validator';

export class UpdateCartItemDto {
  @IsOptional()
  cart_id?: number;

  @IsOptional()
  versionId?: number;

  @IsOptional()
  quantity?: number;
}
