import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiscountsUsageService } from './discounts_usage.service';
import { CreateDiscountsUsageDto } from './dto/create-discounts_usage.dto';
import { UpdateDiscountsUsageDto } from './dto/update-discounts_usage.dto';

@Controller('discounts-usage')
export class DiscountsUsageController {
  constructor(private readonly discountsUsageService: DiscountsUsageService) {}

  @Post()
  create(@Body() createDiscountsUsageDto: CreateDiscountsUsageDto) {
    return this.discountsUsageService.create(createDiscountsUsageDto);
  }

  @Get()
  findAll() {
    return this.discountsUsageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discountsUsageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiscountsUsageDto: UpdateDiscountsUsageDto) {
    return this.discountsUsageService.update(+id, updateDiscountsUsageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountsUsageService.remove(+id);
  }
}
