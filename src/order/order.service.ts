import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { OrderItem } from 'src/order_items/entities/order_item.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Cart } from 'src/carts/entities/cart.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}
  // async Order(user: User, createOrderDto: CreateOrderDto): Promise<Order> {
  //   const shop = await createOrderDto.cartItems[0].shopId;
  //   const order = this.orderRepository.create({
  //     user_id: user.id,
  //     status: 'pending',
  //     total: createOrderDto.total,
  //     shopId: shop,
  //   });
  //   const createdOrder = await this.orderRepository.save(order);

  //   // Bước 2: Tạo OrderItem từ CartItem và liên kết với Đơn Hàng
  //   for (const cartItemDto of createOrderDto.cartItems) {
  //     const orderItem = this.orderItemRepository.create({
  //       quantity: cartItemDto.quantity,
  //       version_id: cartItemDto.versionId,
  //       order_id: createdOrder.id,
  //     });
  //     await this.orderItemRepository.save(orderItem);
  //   }

  //   const cart = await this.cartRepository.findOne({
  //     where: { user_id: user.id },
  //     relations: ['cart_items'],
  //   });
  //   if (cart) {
  //     await this.cartItemRepository.remove(cart.cart_items);
  //   }

  //   return createdOrder;
  // }
  async Order(user: User, createOrderDto: CreateOrderDto): Promise<Order[]> {
    const uniqueShopIds = Array.from(
      new Set(createOrderDto.cartItems.map((item) => item.shopId)),
    );

    const orders: Order[] = [];

    for (const shopId of uniqueShopIds) {
      const itemsForShop = createOrderDto.cartItems.filter(
        (item) => item.shopId === shopId,
      );

      const order = this.orderRepository.create({
        user_id: user.id,
        status: 'pending',
        shopId: shopId,
      });

      const createdOrder = await this.orderRepository.save(order);

      for (const cartItemDto of itemsForShop) {
        const orderItem = this.orderItemRepository.create({
          quantity: cartItemDto.quantity,
          version_id: cartItemDto.versionId,
          order_id: createdOrder.id,
          price: cartItemDto.price,
          discountPrice: cartItemDto.discountPrice,
        } as DeepPartial<OrderItem>);

        await this.orderItemRepository.save(orderItem);
      }

      orders.push(createdOrder);
    }

    // Xóa các mục giỏ hàng sau khi đã tạo đơn hàng
    // const cart = await this.cartRepository.findOne({
    //   where: { user_id: user.id },
    //   relations: ['cart_items'],
    // });

    // if (cart) {
    //   await this.cartItemRepository.remove(cart.cart_items);
    // }

    return orders;
  }

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
        shopId: shopId,
      },
    });

    if (!orders.length) {
      throw new NotFoundException(
        `No orders found for shop with ID ${shopId}.`,
      );
    }

    return orders;
  }

  async myOrder(user: User): Promise<Order[]> {
    if (!user) {
      throw new NotFoundException('User not provided.');
    }

    const orders = await this.orderRepository.find({
      where: {
        user_id: user.id,
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
    user: User,
    status: string,
  ): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: {
        user_id: user.id,
        status: status,
      },
      relations: [
        'shop',
        'order_items',
        'order_items.version',
        'order_items.version.product',
      ],
    });

    if (!orders.length) {
      throw new NotFoundException(
        `No orders found for user with ID ${user.id} and status '${status}'.`,
      );
    }

    return orders;
  }

  async orderDetail(user: User, orderId: number): Promise<Order> {
    // Tìm đơn hàng theo id và load các mối quan hệ liên quan
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user_id: user.id },
      relations: ['shop', 'order_items', 'order_items.version'],
    });

    // Nếu không tìm thấy đơn hàng, ném một NotFoundException
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }

    return order;
  }

  async orderDetailForShop(user: User, orderId: number): Promise<Order> {
    // Tìm đơn hàng theo id và load các mối quan hệ liên quan
    const order = await this.orderRepository.findOne({
      where: { id: orderId, shopId: user.shop_id },
      relations: [
        'order_items',
        'order_items.version',
        'order_items.version.product',
      ],
    });

    // Nếu không tìm thấy đơn hàng, ném một NotFoundException
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }

    // Kiểm tra xem đơn hàng có thuộc về cửa hàng của người dùng không
    if (order.shopId !== user.shop_id) {
      throw new UnauthorizedException(
        `You don't have permission to view this order.`,
      );
    }

    return order;
  }

  async findOrdersByShopAndStatus(
    user: User,
    status: string,
  ): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: {
        shopId: user.shop_id,
        status: status,
      },
      relations: [
        'user',
        'order_items',
        'order_items.version',
        'order_items.version.product',
      ],
    });

    // Nếu không có đơn hàng nào thỏa mãn, ném một NotFoundException
    if (!orders.length) {
      throw new NotFoundException(
        `No orders found for shop with status '${status}'.`,
      );
    }

    return orders;
  }
  async findId(id: number) {
    const result = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'order_items',
        'order_items.version',
        'order_items.version.product',
      ],
    });

    return result;
  }

  async buyNow(user: User, createOrderDto: CreateOrderDto): Promise<Order> {
    const shop = createOrderDto.cartItems[0].shopId;

    const order = this.orderRepository.create({
      user_id: user.id,
      status: 'pending',
      shopId: shop,
    });

    const createdOrder = await this.orderRepository.save(order);

    // Tạo OrderItem từ thông tin đặt hàng và liên kết với Đơn Hàng
    for (const itemDto of createOrderDto.cartItems) {
      const orderItem = this.orderItemRepository.create({
        quantity: itemDto.quantity,
        version_id: itemDto.versionId,
        order_id: createdOrder.id,
      });

      await this.orderItemRepository.save(orderItem);
    }

    return createdOrder;
  }
}
