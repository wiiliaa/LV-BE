import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
@ApiTags('Discounts')
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

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createDiscount(
    @GetUser() user: User,
    @Body() createDiscountDto: CreateDiscountDto,
  ) {
    return this.discountsService.createDiscount(user, createDiscountDto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    return this.discountsService.delete(id);
  }
}
