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
  // @Get('/shop/:id/all')
  // @UseGuards(AuthGuard('jwt'))
  // async find(@GetUser() user: User, @Param('id') shopId: number) {
  //   return this.discountsService.findAll();
  // }

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

  @Post('activate/:discountId/:productId')
  async activateDiscount(
    @Param('discountId') discountId: number,
    @Param('productId') productId: number,
  ) {
    await this.discountsService.activateDiscount(discountId, productId);
    return { success: true };
  }

  @Get('getAllProductByDiscount/:discountId')
  async findAllProductsByDiscountId(@Param('discountId') discountId: number) {
    return this.discountsService.findAllProductsByDiscountId(discountId);
  }
}
