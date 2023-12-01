import { Injectable, NotFoundException } from '@nestjs/common';

import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) { }

  async findALl() {
    return this.cartRepository.find();
  }

  async findByIdUser(userId: number) {
    return this.cartRepository.findOne({ where: { user_id: userId } });
  }

  async create(userId: number): Promise<Cart> {
    const cart = new Cart();
    cart.user_id = userId;
    return this.cartRepository.save(cart);
  }

  async getCartItemsByUser(user: User) {
    try {
      const userCartItems = await this.cartRepository
        .createQueryBuilder('cart')
        .leftJoinAndSelect('cart.cart_items', 'cart_items')
        .leftJoinAndSelect('cart_items.version', 'version') // Join with the 'version' table
        .leftJoinAndSelect('version.product', 'product') // Join with the 'product' table
        .leftJoinAndSelect('product.shop', 'shop') // Join with the 'shop' table
        .where('cart.user = :userId', { userId: user.id })
        .getOne();

      if (!userCartItems) {
        throw new NotFoundException(
          `Cart items not found for user with ID ${user.id}`,
        );
      }

      // Group cart items by shopId
      const cartItemsGroupedByShop = userCartItems.cart_items.reduce(
        (groupedCartItems, ShopItems) => {
          const { version, ...restCartItem } = ShopItems;
          const shopId = version.product.shop_id;

          if (!groupedCartItems[shopId]) {
            groupedCartItems[shopId] = {
              shopId: shopId,
              ShopItems: [],
            };
          }

          groupedCartItems[shopId].ShopItems.push({
            ...restCartItem,
            image: version.image,
          });

          return groupedCartItems;
        },
        {},
      );

      return Object.values(cartItemsGroupedByShop);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
