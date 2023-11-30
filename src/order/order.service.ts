import { Injectable, NotFoundException } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { OrderItem } from 'src/order_items/entities/order_item.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  // async createOrder(user: User, cartItems: CartItem[]): Promise<Order> {
  //   if (!cartItems.length) {
  //     throw new NotFoundException('No items in the cart to create an order.');
  //   }

  //   // Use the shop_id from the first cart item
  //   const shopId = cartItems[0].shop_id;

  //   // Create an order
  //   const order = this.orderRepository.create({
  //     user_id: user.id,
  //     shop_id: shopId,
  //     status: 'pending',
  //   });

  //   // Save order
  //   await this.orderRepository.save(order);

  //   // Create and save order items, and delete cart items
  //   for (const cartItem of cartItems) {
  //     const orderItem = this.orderItemRepository.create({
  //       quantity: cartItem.quantity,
  //       version_id: cartItem.version_id,
  //       order_id: order.id,
  //     });

  //     await this.orderItemRepository.save(orderItem);
  //     await this.cartItemRepository.remove(cartItem);
  //   }

  //   return order;
  // }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }

    if (order.status !== 'pending') {
      throw new NotFoundException(
        `Order with ID ${orderId} cannot be updated.`,
      );
    }
    order.status = status;
    await this.orderRepository.save(order);

    return order;
  }

  async findOrdersByShop(shopId: number): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: {
        shop_id: shopId,
      },
    });

    if (!orders.length) {
      throw new NotFoundException(
        `No orders found for shop with ID ${shopId}.`,
      );
    }

    return orders;
  }

  async findOrdersByShopAndStatus(
    shopId: number,
    status: string,
  ): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: {
        shop_id: shopId,
        status: status,
      },
    });

    if (!orders.length) {
      throw new NotFoundException(
        `No orders found for shop with ID ${shopId} and status '${status}'.`,
      );
    }

    return orders;
  }

  async findOrdersByUser(user: User): Promise<Order[]> {
    if (!user) {
      throw new NotFoundException('User not provided.');
    }

    const orders = await this.orderRepository.find({
      where: {
        id: user.id,
      },
    });

    if (!orders.length) {
      throw new NotFoundException(
        `No orders found for user with ID ${user.id}.`,
      );
    }

    return orders;
  }

  async findOrdersByUserAndStatus(
    userId: number,
    status: string,
  ): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: {
        user_id: userId,
        status: status,
      },
    });

    if (!orders.length) {
      throw new NotFoundException(
        `No orders found for user with ID ${userId} and status '${status}'.`,
      );
    }

    return orders;
  }
}
