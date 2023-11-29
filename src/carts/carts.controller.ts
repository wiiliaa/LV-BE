import { Controller, Post, Param, Get, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
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

  @Get('myCart')
  @UseGuards(AuthGuard('jwt'))
  async getCartByUserId(@GetUser() user: User) {
    try {
      const userCart = await this.cartsService.getCartByUserId(user);
      return { userCart };
    } catch (error) {
      return { error: error.message };
    }
  }
}
