import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
    // Tìm giỏ hàng dựa trên cart_id và load mối quan hệ user
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['user'],
    });

    if (cart && cart.user) {
      return cart.user.id; // Trả về user_id
    }

    // Trả về null nếu không tìm thấy giỏ hàng hoặc user
    return null;
  }
}
