// user-payment.dto.ts

import { IsString, IsNumber } from 'class-validator';

export class CreateUserPaymentDto {
  @IsNumber()
  user_id: number;

  @IsString()
  payment_type: string;

  @IsNumber()
  account_no: number;
}
