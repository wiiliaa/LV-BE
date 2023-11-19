import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DiscountsUsageService } from './discounts_usage.service';
import { CreateDiscountsUsageDto } from './dto/create-discounts_usage.dto';
import { UpdateDiscountsUsageDto } from './dto/update-discounts_usage.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Discount_Usage')
@Controller('discounts-usage')
export class DiscountsUsageController {
  constructor(private readonly discountsUsageService: DiscountsUsageService) {}
}
