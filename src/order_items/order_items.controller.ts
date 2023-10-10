import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { OrderItemsService } from './order_items.service';
import { CreateOrderItemDto } from './dto/create-order_item.dto';
import { UpdateOrderItemDto } from './dto/update-order_item.dto';
import { ApiTags } from '@nestjs/swagger';
import { OrderItem } from './entities/order_item.entity';
@ApiTags('Order_item')
@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemService: OrderItemsService) {}

  @Post()
  async create(@Body() orderItemData: Partial<OrderItem>): Promise<OrderItem> {
    return this.orderItemService.createOrderItem(orderItemData);
  }

  @Get(':id')
  async findOne(@Param('id') orderItemId: number): Promise<OrderItem> {
    return this.orderItemService.findOrderItemById(orderItemId);
  }
  @Put(':id')
  async update(
    @Param('id') orderItemId: number,
    @Body() orderItemData: Partial<OrderItem>,
  ): Promise<OrderItem> {
    return this.orderItemService.updateOrderItem(orderItemId, orderItemData);
  }

  @Delete(':id')
  async remove(@Param('id') orderItemId: number): Promise<void> {
    return this.orderItemService.deleteOrderItem(orderItemId);
  }
}
