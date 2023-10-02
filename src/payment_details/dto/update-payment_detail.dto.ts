import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDetailDto } from './create-payment_detail.dto';

export class UpdatePaymentDetailDto extends PartialType(CreatePaymentDetailDto) {}
