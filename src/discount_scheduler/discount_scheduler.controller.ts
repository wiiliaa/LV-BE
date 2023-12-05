import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DiscountSchedulerService } from './discount_scheduler.service';
import { CreateDiscountSchedulerDto } from './dto/create-discount_scheduler.dto';
import { UpdateDiscountSchedulerDto } from './dto/update-discount_scheduler.dto';

@Controller('discount-scheduler')
export class DiscountSchedulerController {
  constructor(
    private readonly discountSchedulerService: DiscountSchedulerService,
  ) {}
}
