import { PartialType } from '@nestjs/swagger';
import { CreateDiscountSchedulerDto } from './create-discount_scheduler.dto';

export class UpdateDiscountSchedulerDto extends PartialType(CreateDiscountSchedulerDto) {}
