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
@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(
    @GetUser() user: User,
    @Body() orderData: { shopId: number },
  ): Promise<Order> {
    return this.orderService.createOrder(user, orderData.shopId);
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
