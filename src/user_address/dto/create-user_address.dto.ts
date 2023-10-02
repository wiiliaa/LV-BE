// create-user-address.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserAddressDto {
  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  detail_address: string;

  @IsNotEmpty()
  user_id: number;
}
