import { Injectable, NotFoundException } from '@nestjs/common';

import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private imageService: ImageService,
  ) {}

  async findALl() {
    return this.cartRepository.find();
  }

  async findByIdUser(userId: number) {
    return this.cartRepository.findOne({ where: { user_id: userId } });
  }

  async create(userId: number): Promise<Cart> {
    try {
      const cart = new Cart();
      cart.user_id = userId;

      // Lưu đối tượng Cart vào cơ sở dữ liệu
      const createdCart = await this.cartRepository.save(cart);

      // Trả về đối tượng Cart sau khi đã được lưu
      return createdCart;
    } catch (error) {
      console.error('Lỗi khi tạo giỏ hàng:', error);
      throw error;
    }
  }

  async getCartItemsByUser(user: User) {
    try {
      const userCartItems = await this.cartRepository
        .createQueryBuilder('cart')
        .leftJoinAndSelect('cart.cart_items', 'cart_items')
        .leftJoinAndSelect('cart_items.version', 'version')
        .leftJoinAndSelect('version.product', 'product')
        .leftJoinAndSelect('product.shop', 'shop')
        .leftJoinAndSelect('version.sizes', 'sizes')
        .where('cart.user = :userId', { userId: user.id })
        .getOne();

      if (!userCartItems) {
        throw new NotFoundException(
          `Cart items not found for user with ID ${user.id}`,
        );
      }

      // Group cart items by shopId
      const cartItemsGroupedByShop = await Promise.all(
        userCartItems.cart_items.map(async (shopCartItem) => {
          const { version, ...restCartItem } = shopCartItem;
          const shopId = version.product.shop_id;

          // Lấy tên kích thước từ size_id
          const sizeNames = version.sizes
            .map((size) => {
              // Chỉ lấy sizeName nếu size.id giống với sizeId
              if (size.id === shopCartItem.sizeId) {
                return size.sizeName;
              }
              return null;
            })
            .filter(Boolean);
          const sizeName = sizeNames.length > 0 ? sizeNames[0] : null;
          return {
            shopId: shopId,
            shopName: version.product.shop.name,
            shopImage: await this.imageService.getImage(
              version.product.shop.avatar,
            ),
            ShopItems: [
              {
                ...restCartItem,
                image: await this.imageService.getImage(version.product.image),
                color: version.color,
                productName: version.product.name,
                sizeName: sizeName,
                price: version.product.price, // Thêm price vào đây
                discountPrice: version.product.discountedPrice,
              },
            ],
          };
        }),
      );

      // Merge items with the same shopId
      const groupedCartItems = cartItemsGroupedByShop.reduce(
        (accumulator, currentItem) => {
          const existingShop = accumulator.find(
            (item) => item.shopId === currentItem.shopId,
          );

          if (existingShop) {
            existingShop.ShopItems.push(...currentItem.ShopItems);
          } else {
            accumulator.push(currentItem);
          }

          return accumulator;
        },
        [],
      );

      return groupedCartItems;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
