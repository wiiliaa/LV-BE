import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';

import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { Discount } from './entities/discount.entity';
@ApiTags('Discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}
  @Get('/shop/:id/all')
  @UseGuards(AuthGuard('jwt'))
  async find(@GetUser() user: User, @Param('id') shopId: number) {
    return this.discountsService.findAll();
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

  @Get('byShop/:shopId')
  getDiscountsByShop(@Param('shopId') shopId: number) {
    return this.discountsService.findDiscountsByShop(shopId);
  }

  @Get('timeless/:id')
  async getRemainingDays(
    @Param('id') id: number,
  ): Promise<{ remainingDays: number }> {
    try {
      const discountEntity = await this.discountsService.findOne(id);
      const discount: Discount = discountEntity as Discount;

      if (!discount) {
        throw new InternalServerErrorException('Discount not found');
      }

      // Sử dụng 'discount' trực tiếp như một đối tượng Discount
      const expirationDate = new Date(discount.endDate);

      // Chuyển đổi thời gian sang mili giây và tính số ngày còn lại
      const remainingMilliseconds = expirationDate.getTime() - Date.now();
      const remainingDays = Math.ceil(
        remainingMilliseconds / (1000 * 60 * 60 * 24),
      );

      return { remainingDays };
    } catch (error) {
      // Xử lý lỗi và trả về phản hồi
      console.error('Error getting remaining days:', error);
      throw new InternalServerErrorException('Error getting remaining days');
    }
  }
}
