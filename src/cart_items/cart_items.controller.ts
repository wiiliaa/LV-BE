import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { CartItemService } from './cart_items.service';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { ApiTags } from '@nestjs/swagger';
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

  @Post()
  async create(@Body() createCartItemDto: CreateCartItemDto) {
    return await this.cartItemService.create(createCartItemDto);
  }

  @Put('/update/:id')
  async update(
    @Param('id') id: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return await this.cartItemService.update(id, updateCartItemDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.cartItemService.delete(id);
  }
}
