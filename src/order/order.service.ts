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
import { MailerService } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { UserService } from 'src/user/user.service';

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
    private readonly mailerService: MailerService,
    private userService: UserService,
  ) {}

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
          shopId: currentShopItem.shopId,
        });

        try {
          const size = await this.sizeRepository.findOne({
            where: { id: versionItem.sizeId },
          });

          // Include the sizeName in the order item entity
          orderItemEntity.sizeName = size.sizeName;
        } catch (error) {
          console.error(
            `Error fetching size for ID ${versionItem.sizeId}: ${error.message}`,
          );
          orderItemEntity.sizeName = 'Unknown Size';
        }

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

    // Check if orders is null or undefined, and return an empty array if true
    if (!orders) {
      return [];
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
      .orderBy('order.created_at', 'DESC') // Sắp xếp theo thời gian đã tạo giảm dần
      .getMany();

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
      order: {
        created_at: 'DESC', // Sắp xếp theo thời gian đã tạo giảm dần (mới nhất trên cùng)
      },
    });

    if (!orders.length) {
      return [];
    }

    return orders;
  }

  async orderDetail(user: User, orderId: number): Promise<Order> {
    try {
      console.log(orderId);
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: [
          'order_items',
          'order_items.version',
          'order_items.version.product',
        ],
      });

      // Nếu không tìm thấy đơn hàng, ném một NotFoundException
      if (!order) {
        return null;
      }

      // Load hình cho các version trong đơn hàng và cập nhật order_items
      order.order_items = await Promise.all(
        order.order_items.map(async (orderItem) => {
          const version = orderItem.version;

          // Lấy size entity từ sizeId
          const size = await this.sizeRepository.findOne({
            where: { id: orderItem.sizeId },
          });
          const shop = await this.orderRepository.findOne({
            where: { id: orderItem.shopId },
          });

          // Lấy sizeName từ size entity hoặc đặt giá trị mặc định nếu không tìm thấy
          const sizeName = size ? size.sizeName : 'Unknown Size';

          // Load hình và cập nhật orderItem
          const versionImage = await this.image.getImage(version.product.image);

          return Object.assign(orderItem, {
            sizeName: sizeName,
            shopName: shop.shop.name,
            version: {
              ...version,
              image: versionImage,
            },
          });
        }),
      );

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
      relations: ['user', 'order_items', 'order_items.version'],
      order: {
        created_at: 'DESC', // Sắp xếp theo thời gian đã tạo giảm dần
      },
    });

    const ordersWithUserName = orders.map((order) => {
      order.username = order.user.name;
      return order;
    });

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

  async cancelOrder(orderId: number): Promise<{ message: string }> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['order_items', 'order_items.version'],
    });

    if (!order) {
      return { message: `Order with ID ${orderId} not found.` };
    }

    if (order.status !== 'pending') {
      return { message: `Order with ID ${orderId} cannot be canceled.` };
    }

    // Rollback product size quantities
    for (const orderItem of order.order_items) {
      await this.rollbackProductSizeQuantity(
        orderItem.sizeId,
        orderItem.quantity,
      );
    }

    // Update order status to 'cancel'
    order.status = 'fail';
    await this.orderRepository.save(order);

    return { message: 'Order canceled successfully.' };
  }

  async rollbackProductSizeQuantity(
    sizeId: number,
    quantity: number,
  ): Promise<void> {
    const productSize = await this.sizeRepository.findOne({
      where: { id: sizeId },
    });

    if (!productSize) {
      // Handle this case as needed
      console.error(`Product size with ID ${sizeId} not found.`);
      return;
    }

    // Increase the quantity
    productSize.quantity += quantity;

    // Save back to the database
    await this.sizeRepository.save(productSize);
  }

  async markOrderAsDone(orderId: number): Promise<{ message: string }> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      return { message: `Order with ID ${orderId} not found.` };
    }

    if (order.status !== 'pending') {
      return { message: `Order with ID ${orderId} cannot be marked as done.` };
    }

    // Update order status to 'done'
    order.status = 'done';
    await this.orderRepository.save(order);

    return { message: 'Order marked as done successfully.' };
  }

  async sendOrderConfirmationEmail(orderId: number) {
    try {
      // Lấy thông tin đơn hàng từ cơ sở dữ liệu
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        console.error(`Order with ID ${orderId} not found.`);
        return;
      }

      // Mark the order as done (assuming you have this function)
      await this.markOrderAsDone(orderId);

      // Get the user's email (assuming this returns a Promise<string>)
      const userEmail: string = await this.userService.findMail(order.user_id);

      // Extract order details
      const { id: order_id, total, status } = order;

      // Send order confirmation email
      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'Order Confirmation',
        template: 'order-confirmation',
        context: {
          total,
          status,
        },
      });

      console.log(`Order confirmation email sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }
  }
}
