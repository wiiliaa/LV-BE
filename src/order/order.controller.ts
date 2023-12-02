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
  constructor(private readonly orderService: OrderService) { }

  @Post('createOrder')
  @UseGuards(AuthGuard('jwt')) // Sử dụng Guard nếu cần xác thực người dùng
  async createOrder(
    @GetUser() user: User,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const order = await this.orderService.Order(user, createOrderDto);

    return order;
  }
  @Put('status/:id')
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

  @Get('myOrder')
  @UseGuards(AuthGuard('jwt'))
  findOrdersByUser(@GetUser() user: User): Promise<Order[]> {
    return this.orderService.myOrder(user);
  }

  @Get('myOrder/:status')
  @UseGuards(AuthGuard('jwt'))
  findOrdersByUserAndStatus(
    @GetUser()
    user: User,
    @Param('status') status: string,
  ): Promise<Order[]> {
    return this.orderService.findOrdersByUserAndStatus(user, status);
  }

  @Get('myOrderDetail/:id')
  @UseGuards(AuthGuard('jwt'))
  async getOrderDetail(
    @GetUser() user: User,
    @Param('orderId') orderId: number,
  ): Promise<Order> {
    return this.orderService.orderDetail(user, orderId);
  }

  @Get('detailOrder/:id')
  @UseGuards(AuthGuard('jwt'))
  async getOrderDetailOfShop(
    @GetUser() user: User,
    @Param('orderId') orderId: number,
  ): Promise<Order> {
    return this.orderService.orderDetailForShop(user, orderId);
  }

  @Get('orderOfShopByStatus/:status')
  @UseGuards(AuthGuard('jwt'))
  async findOrdersByShopAndStatus(
    @GetUser() user: User, // Sử dụng decorator để lấy thông tin người dùng từ token
    @Param('status') status: string,
  ): Promise<Order[]> {
    return this.orderService.findOrdersByShopAndStatus(user, status);
  }

  @Get(':id')
  async test(@Param('id') id: number) {
    return this.orderService.findId(id);
  }

  @Post('buy-now')
  @UseGuards(AuthGuard('jwt'))
  async buyNow(@GetUser() user: User, @Body() createOrderDto: CreateOrderDto) {
    console.log("---------- CreateOrderDto", createOrderDto);
    console.log("---------- CreateOrderDto", JSON.stringify(createOrderDto, null, 2));
    const order = await this.orderService.buyNow(user, createOrderDto);
    return order;
  }
  // @Post('buy-now')
  // @UseGuards(AuthGuard('jwt'))
  // async buyNow(@GetUser() user: User, @Body() createOrderDto: CreateOrderDto) {
  //   const order = await this.orderService.buyNow(user, createOrderDto);
  //   return order;
  // }
}
