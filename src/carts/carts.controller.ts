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

  @Post(':userId')
  async create(@Param('userId') userId: number) {
    try {
      const cart = await this.cartsService.create(userId);
      return cart;
    } catch (error) {}
  }

  // Cập nhật decorator để sử dụng đường dẫn chính xác
  @Get('myCart')
  @UseGuards(AuthGuard('jwt'))
  async getCartByUserId(@GetUser() user: User) {
    return await this.cartsService.getCartItemsByUser(user);
  }
}
