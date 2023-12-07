import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { User } from 'src/user/entities/user.entity';
import { ImageService } from 'src/image/image.service';
import { promisify } from 'util';
import * as fs from 'fs';
import { join } from 'path';
import { NotifiyService } from 'src/notifiy/notifiy.service';
import { OrderService } from 'src/order/order.service';
import { Order } from 'src/order/entities/order.entity';
import { ProductService } from 'src/product/product.service';
@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private imageService: ImageService,
    private noti: NotifiyService,
    private orderService: OrderService,
    private productService: ProductService,
  ) {}

  async create(user: User, createShopDto: CreateShopDto): Promise<Shop> {
    if (user.shop) {
      throw new ConflictException('User already has a shop.');
    }

    // Your existing code to handle the image
    const writeFileAsync = promisify(fs.writeFile);
    createShopDto.user_id = user.id;
    const shop = this.shopRepository.create(createShopDto);

    // Handle avatar image
    if (createShopDto.avatar) {
      try {
        const randomSuffix = Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, '0');
        const fileName = `${randomSuffix}-avatar.txt`;
        const filePath = `public/uploads/${fileName}`;
        await writeFileAsync(filePath, createShopDto.avatar);
        shop.avatar = fileName;
      } catch (error) {
        throw new InternalServerErrorException('Error saving base64 to file');
      }
    }

    await this.shopRepository.save(shop);

    // Update user role to 'pending'
    user.role = 'pending';
    await user.save();

    user.shop = shop;
    await user.save();

    return shop;
  }
  async processShopRequest(
    shopId: number,
    status: 'accept' | 'reject',
  ): Promise<{ shop: Shop; message: string }> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      relations: ['user'],
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    let message = '';

    if (status === 'accept') {
      // Update shop status to 'accept'
      shop.status = 'accept';

      // Update user role to 'seller'
      shop.user.role = 'seller';

      await this.noti.createNotification(
        shop.user_id,
        'Shop request accepted successfully',
      );
      await this.shopRepository.save(shop);
      await shop.user.save();

      message = 'Shop request accepted successfully.';
    } else if (status === 'reject') {
      shop.user.role = 'customer';
      await this.deleteShop(shop);
      await this.noti.createNotification(
        shop.user_id,
        'Shop request accepted successfully',
      );
      message = 'Shop request rejected.';
    } else {
      throw new BadRequestException('Invalid status');
    }

    return { shop, message };
  }

  // New method to delete a shop and associated resources
  async deleteShop(shop: Shop): Promise<void> {
    const existsSync = fs.existsSync;
    const unlinkAsync = promisify(fs.unlink);
    if (shop.avatar) {
      const imagePath = join('public/uploads/', shop.avatar);
      if (existsSync(imagePath)) {
        await unlinkAsync(imagePath);
      }
    }

    // Remove the shop from the database
    await this.shopRepository.remove(shop);
  }

  async update(
    id: number,
    updateShopDto: UpdateShopDto,
  ): Promise<{ success: boolean }> {
    const existsSync = fs.existsSync;
    const unlinkAsync = promisify(fs.unlink);
    const writeFileAsync = promisify(fs.writeFile);

    try {
      const shopToUpdate = await this.shopRepository.findOne({
        where: { id: id },
      });

      if (!shopToUpdate) {
        throw new NotFoundException('Shop not found');
      }

      // If a new avatar is provided in the DTO, perform the update
      if (updateShopDto.avatar) {
        // Check if there is an old avatar
        if (shopToUpdate.avatar) {
          const oldImagePath = join('public/uploads/', shopToUpdate.avatar);

          // If the old file exists, delete it
          if (existsSync(oldImagePath)) {
            await unlinkAsync(oldImagePath);
          }
        }

        // Use the shop name as part of the file name (adjust as needed)
        const fileName = `${shopToUpdate.name}-avatar.txt`;
        const filePath = join('public/uploads/', fileName);

        // Save the new avatar to the text file
        await writeFileAsync(filePath, updateShopDto.avatar);
        updateShopDto.avatar = fileName;
      }

      const updateResult = await this.shopRepository
        .createQueryBuilder('shop')
        .update(Shop)
        .set(updateShopDto)
        .where('id = :id', { id: id })
        .execute();

      if (updateResult.affected && updateResult.affected > 0) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      throw new InternalServerErrorException('Error updating shop');
    }
  }

  async findOne(id: number) {
    const shop = await this.shopRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!shop) {
      return null;
    }

    // Calculate the total quantity of products for the shop
    let totalProducts = 0;

    if (shop.products && shop.products.length > 0) {
      totalProducts = shop.products.reduce(
        (sum, product) => sum + product.total,
        0,
      );
    }

    // Get the total sale for the shop by iterating over products
    let totalSale = '0'; // Initialize totalSale as a string
    if (shop.products && shop.products.length > 0) {
      for (const product of shop.products) {
        const productSale = await this.productService.getTotalSoldQuantity(
          product.id,
        );
        totalSale = (BigInt(totalSale) + BigInt(productSale)).toString();
      }
    }
    const image1 = await this.imageService.getImage(shop.avatar);
    delete shop.products;

    // Return the result with total products and total sale
    return { ...shop, totalProducts, totalSale, avatar: image1 };
  }

  async remove(id: number): Promise<void> {
    const shop = await this.shopRepository.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException(`Shop with id ${id} not found.`);
    }
    await this.shopRepository.remove(shop);
  }

  async getTotalProductsForShop(shopId: number): Promise<number> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      relations: ['products'],
    });

    if (!shop) {
      // Handle the case where the shop with the provided ID is not found
      return 0;
    }

    const totalProductsForShop = shop.products.reduce(
      (sum, product) => sum + product.total,
      0,
    );

    return totalProductsForShop;
  }
  async dashboard(
    shopId: number,
  ): Promise<
    { week: number; totalUsers: number; totalSoldProducts: number }[]
  > {
    // Get the shop's creation date
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    const shopCreationDate = shop.created_at;

    // Get all orders for the shop using OrderService
    const orders: Order[] = await this.orderService.findCompletedOrdersByShop(
      shopId,
    );

    // Initialize the result array
    const result: {
      week: number;
      totalUsers: number;
      totalSoldProducts: number;
    }[] = [];

    // Extract user information and calculate total sold products
    const users: Set<number> = new Set();
    let totalSoldProducts: number = 0;

    for (const order of orders) {
      users.add(order.user.id);

      for (const orderItem of order.order_items) {
        totalSoldProducts += orderItem.quantity;
      }

      // Calculate the ISO week for the order
      const week = this.getISOWeek(shopCreationDate, order.created_at);

      // Find existing entry for the week or create a new one
      const entry = result.find((entry) => entry.week === week);

      if (entry) {
        entry.totalUsers += users.size;
        entry.totalSoldProducts += totalSoldProducts;
      } else {
        result.push({
          week,
          totalUsers: users.size,
          totalSoldProducts,
        });
      }
    }

    return result;
  }
  private getISOWeek(shopCreationDate: Date, orderDate: Date): number {
    const millisecondsInDay: number = 86400000;

    // Calculate the difference in days between the order date and the shop's creation date
    const daysDifference = Math.ceil(
      (orderDate.getTime() - shopCreationDate.getTime()) / millisecondsInDay +
        1, // Add 1 to handle the day of the shop creation itself
    );

    // Calculate the ISO week number
    const weekNumber = Math.ceil(daysDifference / 7);

    return weekNumber;
  }
}
