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
  @Get('/shop/:id/all')
  @UseGuards(AuthGuard('jwt'))
  async find(@GetUser() user: User, @Param('id') shopId: number) {
    return this.discountsService.findAllByShop(user, shopId);
  }

  @Get('/detail/:id')
  async findOne(@Param('id') id: number) {
    return this.discountsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('createDiscount')
  async createDiscount(
    @GetUser() user: User,
    @Body() createDiscountDto: CreateDiscountDto,
  ) {
    return this.discountsService.createDiscount(user, createDiscountDto);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: number) {
    return this.discountsService.delete(id);
  }

  @Post('/checkDiscount/:id')
  async getdis(@Param('id') id: number) {
    return this.discountsService.hasDiscount(id);
  }

  @Post('activateDiscount/:discountId/:productId')
  async activateWithDiscountReplacement(
    @Param('discountId') discountId: number,
    @Param('productId') productId: number,
  ) {
    try {
      await this.discountsService.activateDiscount(discountId, productId);
      return { success: true, message: 'Discount activated success' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
