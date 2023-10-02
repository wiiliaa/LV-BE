import { Body, Controller, Get, Param, Post, Delete } from '@nestjs/common';

import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}
  @Get('/')
  async find() {
    return this.discountsService.find();
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return this.discountsService.findOne(id);
  }

  @Post('/')
  async create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountsService.create(createDiscountDto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    return this.discountsService.delete(id);
  }
}
