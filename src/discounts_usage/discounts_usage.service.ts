import { Injectable } from '@nestjs/common';
import { CreateDiscountsUsageDto } from './dto/create-discounts_usage.dto';
import { UpdateDiscountsUsageDto } from './dto/update-discounts_usage.dto';

@Injectable()
export class DiscountsUsageService {
  create(createDiscountsUsageDto: CreateDiscountsUsageDto) {
    return 'This action adds a new discountsUsage';
  }

  findAll() {
    return `This action returns all discountsUsage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} discountsUsage`;
  }

  update(id: number, updateDiscountsUsageDto: UpdateDiscountsUsageDto) {
    return `This action updates a #${id} discountsUsage`;
  }

  remove(id: number) {
    return `This action removes a #${id} discountsUsage`;
  }
}
