import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CartItemService } from './cart_items.service';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
@ApiTags('Cart_items')
@Controller('cart-items')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  @Get('/all')
  async findAll() {
    return await this.cartItemService.findAll();
  }

  @Get('/id/:id')
  async findOne(@Param('id') id: number) {
    return await this.cartItemService.findOne(id);
  }

  @Post('/addCartItem')
  @UseGuards(AuthGuard('jwt'))
  async create(
    @GetUser() user: User,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    return await this.cartItemService.create(user, createCartItemDto);
  }

  @Put('/update')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @GetUser() user: User,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return await this.cartItemService.update(user, updateCartItemDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.cartItemService.delete(id);
  }
}
