// update-user-address.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserAddressDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  detail_address?: string;
}
