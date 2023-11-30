import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Order } from './entities/order.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartItemDto } from './dto/create-cart_item.dto';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createOrder(
    @GetUser() user: User,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<any> {
    const cartItemsDto: CartItemDto[] = createOrderDto.cartItems;

    // Map CartItemDto instances to CartItem instances
    const cartItems = cartItemsDto.map((dto) => {
      const cartItem = new CartItem(); // Assuming you have a CartItem entity
      cartItem.quantity = dto.quantity;
      cartItem.shop_id = dto.shop_id;
      // Map other properties as needed
      return cartItem;
    });

    try {
      const order = await this.orderService.createOrder(user, cartItems);
      return { success: true, order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  @Put(':id/status')
  updateOrderStatus(
    @Param('id') orderId: number,
    @Body() statusData: { status: string },
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(orderId, statusData.status);
  }

  @Get('shop/:shopId')
  findOrdersByShop(@Param('shopId') shopId: number): Promise<Order[]> {
    return this.orderService.findOrdersByShop(shopId);
  }

  @Get('shop/:shopId/status/:status')
  findOrdersByShopAndStatus(
    @Param('shopId') shopId: number,
    @Param('status') status: string,
  ): Promise<Order[]> {
    return this.orderService.findOrdersByShopAndStatus(shopId, status);
  }

  @Get('myOrder')
  @UseGuards(AuthGuard('jwt'))
  findOrdersByUser(@GetUser() user: User): Promise<Order[]> {
    return this.orderService.findOrdersByUser(user);
  }

  @Get('user/:userId/status/:status')
  findOrdersByUserAndStatus(
    @Param('userId') userId: number,
    @Param('status') status: string,
  ): Promise<Order[]> {
    return this.orderService.findOrdersByUserAndStatus(userId, status);
  }
}
