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
import { ProductSize } from 'src/product_size/entities/product_size.entity';
import { Image } from 'src/image/entities/image.entity';
import { ImageService } from 'src/image/image.service';
import { ProductVersion } from 'src/product-version/entities/product-version.entity';

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
    @InjectRepository(ProductSize)
    private readonly sizeRepository: Repository<ProductSize>,
    private image: ImageService,
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
  async order(user: User, createOrderDtos: CreateOrderDto) {
    for (const currentShopItem of createOrderDtos.cartItems) {
      const orderEntity = this.orderRepository.create({
        user: { id: user.id },
        total: currentShopItem.totalPrice,
        shopId: currentShopItem.shopId,
      });

      const createdOrder = await this.orderRepository.save(orderEntity);

      for (const versionItem of currentShopItem.Versions) {
        const orderItemEntity = this.orderItemRepository.create({
          quantity: versionItem.quantity,
          version_id: versionItem.versionId,
          order_id: createdOrder.id,
          discountedPrice: versionItem.sellingPrice,
          sizeId: versionItem.sizeId,
        });
        await this.orderItemRepository.save(orderItemEntity);

        // Giảm số lượng của kích thước sản phẩm sau khi tạo đơn hàng
        await this.decreaseProductSizeQuantity(
          versionItem.sizeId,
          versionItem.quantity,
        );
      }
    }

    return { message: 'success' };
  }

  async decreaseProductSizeQuantity(
    sizeId: number,
    quantity: number,
  ): Promise<void> {
    const productSize = await this.sizeRepository.findOne({
      where: { id: sizeId },
    });

    if (!productSize) {
      throw new NotFoundException(`Product size with ID ${sizeId} not found.`);
    }

    // Kiểm tra xem có đủ số lượng để giảm không
    if (productSize.quantity < quantity) {
      throw new NotFoundException(
        `Not enough quantity available for size with ID ${sizeId}.`,
      );
    }

    // Giảm số lượng
    productSize.quantity -= quantity;

    // Lưu lại vào cơ sở dữ liệu
    await this.sizeRepository.save(productSize);
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
  async findUserNameByOrderId(orderId: number): Promise<string> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }

    const user = order.user;

    if (!user) {
      throw new NotFoundException(
        `User not found for order with ID ${orderId}.`,
      );
    }

    return user.name;
  }
  async findOrdersByShop(shopId: number): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: {
        shopId: shopId,
      },
      relations: ['user', 'order_items', 'order_items.version'],
    });

    if (!orders.length) {
      throw new NotFoundException(
        `No orders found for shop with ID ${shopId}.`,
      );
    }

    // Map over the orders and modify each order to include userName
    const ordersWithUserName = orders.map((order) => {
      order.username = order.user.name;
      return order;
    });

    return ordersWithUserName;
  }

  async myOrder(user: User): Promise<
    {
      orderId: number;
      total: number;
      status: string;
      createdAt: string;
      updatedAt: string;
      shop: string;
    }[]
  > {
    if (!user) {
      throw new NotFoundException('User not provided.');
    }

    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.shop', 'shop')
      .where('order.user_id = :userId', { userId: user.id })
      .getMany();

    if (!orders || orders.length === 0) {
      throw new NotFoundException(
        `No orders found for user with ID ${user.id}.`,
      );
    }

    const result = orders.map((order) => ({
      orderId: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.created_at.toISOString(),
      updatedAt: order.updated_at.toISOString(),
      shop: order.shop.name,
    }));

    return result;
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
    try {
      // Tìm đơn hàng theo id và load các mối quan hệ liên quan
      const order = await this.orderRepository.findOne({
        where: { id: orderId, user_id: user.id },
        relations: [
          'shop',
          'order_items',
          'order_items.version',
          'order_items.version.product', // Thêm mối quan hệ đến sản phẩm của version
        ],
      });

      // Nếu không tìm thấy đơn hàng, ném một NotFoundException
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found.`);
      }

      // Load hình cho các version trong đơn hàng
      const versionsWithImages = await Promise.all(
        order.order_items.map(async (orderItem) => {
          const version = orderItem.version;
          const versionImage = await this.image.getImage(version.product.image);
          return { ...version, image: versionImage };
        }),
      );

      // Cập nhật order với các version có hình
      order.order_items.forEach((orderItem, index) => {
        orderItem.version = new ProductVersion();
        Object.assign(orderItem.version, versionsWithImages[index]);
      });

      return order;
    } catch (error) {
      // Xử lý lỗi nếu cần thiết
      throw new Error(`Error retrieving order details: ${error.message}`);
    }
  }

  async orderDetailForShop(user: User, orderId: number): Promise<Order> {
    // Tìm đơn hàng theo id và load các mối quan hệ liên quan
    const order = await this.orderRepository.findOne({
      where: { id: orderId, shopId: user.shop_id },
      relations: [
        'order_items',
        'order_items.version',
        'order_items.version.product',
        'order_items.version.product.discounts',
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

  async findOrdersByShopAndStatus(user: User, status: string) {
    const orders = await this.orderRepository.find({
      where: {
        shopId: user.shop_id,
        status: status,
      },
      relations: ['user'],
    });

    if (!orders.length) {
      throw new NotFoundException(
        `No orders found for shop with status '${status}'.`,
      );
    }

    const ordersWithUserName = orders.map((order) => ({
      order: {
        id: order.id,
        total: order.total,
        username: order.user.name,
        // Include other fields here as needed
        created_at: order.created_at,
        updated_at: order.updated_at,
        // Add other fields above as needed
      },
    }));

    return ordersWithUserName;
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

  async findAllOrdersForUser(userId: number): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: { user_id: userId },
      relations: [
        'order_items',
        'order_items.version',
        'order_items.version.product',
      ],
    });

    return orders;
  }

  async findShopByOrderId(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['shop'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }

    const shop = order.shop;

    if (!shop) {
      throw new NotFoundException(
        `Shop not found for order with ID ${orderId}.`,
      );
    }

    return shop;
  }
}
