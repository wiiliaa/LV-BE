import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart_item.entity';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CartItemService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async findAll(): Promise<CartItem[]> {
    return await this.cartItemRepository.find();
  }

  async findOne(id: number) {
    return await this.cartItemRepository.findOne({ where: { id } });
  }

  async create(user: User, createCartItemDto: CreateCartItemDto) {
    const { cartId, productId, quantity } = createCartItemDto;
    const cartItem = new CartItem();
    cartItem.cart_id = cartId;
    cartItem.product_id = productId;
    cartItem.quantity = quantity;

    await cartItem.save();

    return cartItem;
  }

  async update(id: number, updateCartItemDto: UpdateCartItemDto) {
    const cart_item = await this.cartItemRepository
      .createQueryBuilder('cart_item')
      .update()
      .set(updateCartItemDto)
      .where('id = :id', { id })
      .execute();
    return cart_item;
  }

  async delete(id: number) {
    let status = true;
    const target = await this.cartItemRepository.delete(id);
    if (!target) {
      status = false;
    }
    return { status };
  }
}
