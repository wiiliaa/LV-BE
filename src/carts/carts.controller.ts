import { Controller, Post, Param, Get } from '@nestjs/common';
import { CartsService } from './carts.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async findAll() {
    return this.cartsService.findALl();
  }
  @Get(':cartId')
  async getUserIdByCartId(@Param('cartId') cartId: number) {
    const userId = await this.cartsService.getUserIdByCartId(cartId);
    return { userId };
  }

  @Post(':userId')
  async create(@Param('userId') userId: number) {
    try {
      const cart = await this.cartsService.create(userId);
      return cart;
    } catch (error) {}
  }
}
