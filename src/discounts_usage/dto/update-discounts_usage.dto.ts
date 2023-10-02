import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscountsUsageDto } from './create-discounts_usage.dto';

export class UpdateDiscountsUsageDto extends PartialType(CreateDiscountsUsageDto) {}
