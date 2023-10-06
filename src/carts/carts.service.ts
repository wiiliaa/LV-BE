import { Injectable, NotFoundException } from '@nestjs/common';

import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
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

  async addToCart(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<CartItem> {
    const cart = await this.cartRepository.findOne({
      where: { user_id: userId },
    });
    if (!cart) throw new NotFoundException('Cart not found');

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Product not found');

    let cartItem = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: product.id } },
    });

    if (!cartItem) {
      cartItem = new CartItem();
      cartItem.cart = cart;
      cartItem.product = product;
    }

    cartItem.quantity = quantity;
    return await this.cartItemRepository.save(cartItem);
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    const cart = await this.cartRepository.findOne({ where: { id: userId } });
    if (!cart) throw new NotFoundException('Cart not found');
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Product not found');

    const cartItem = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: product.id } },
    });

    if (!cartItem) throw new NotFoundException('CartItem not found');

    await this.cartItemRepository.remove(cartItem);
  }
}
