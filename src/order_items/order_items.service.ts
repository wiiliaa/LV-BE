import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order_item.dto';
import { UpdateOrderItemDto } from './dto/update-order_item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './entities/order_item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}
  async create(createOrderItemsDto: CreateOrderItemDto): Promise<OrderItem> {
    const orderItem = this.orderItemRepository.create(createOrderItemsDto);
    return await this.orderItemRepository.save(orderItem);
  }

  async findOrderItemById(orderItemId: number): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id: orderItemId },
    });
    if (!orderItem) {
      throw new NotFoundException(
        `OrderItem with ID ${orderItemId} not found.`,
      );
    }
    return orderItem;
  }

  async updateOrderItem(
    orderItemId: number,
    orderItemData: Partial<OrderItem>,
  ): Promise<OrderItem> {
    await this.findOrderItemById(orderItemId);
    await this.orderItemRepository.update(orderItemId, orderItemData);
    return await this.findOrderItemById(orderItemId);
  }

  async deleteOrderItem(orderItemId: number): Promise<void> {
    await this.findOrderItemById(orderItemId);
    await this.orderItemRepository.delete(orderItemId);
  }
}
