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
  ) {}

  async findALl() {
    return this.cartRepository.find();
  }

  async create(userId: number): Promise<Cart> {
    const cart = new Cart();
    cart.user_id = userId;
    return this.cartRepository.save(cart);
  }

  async getUserIdByCartId(cartId: number): Promise<number | null> {
    const cart = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.user', 'user')
      .where('cart.id = :cartId', { cartId })
      .getOne();

    return cart?.user?.id || null;
  }
  async getCartItemsByUser(user: User) {
    try {
      // Sử dụng `createQueryBuilder` để thực hiện truy vấn liên kết
      const userCartItems = await this.cartRepository
        .createQueryBuilder('cart')
        .leftJoinAndSelect('cart.cart_items', 'cart_items')
        .leftJoin('cart.user', 'user')
        .where('user.id = :userId', { userId: user.id })
        .getOne();

      if (!userCartItems) {
        throw new NotFoundException(
          `Cart items not found for user with ID ${user.id}`,
        );
      }

      return userCartItems.cart_items;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
