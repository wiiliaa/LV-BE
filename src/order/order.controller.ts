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
@ApiTags('Order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('createOrder')
  @UseGuards(AuthGuard('jwt')) // Sử dụng Guard nếu cần xác thực người dùng
  async createOrder(
    @GetUser() user: User,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const order = await this.orderService.Order(user, createOrderDto);

    return order;
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
