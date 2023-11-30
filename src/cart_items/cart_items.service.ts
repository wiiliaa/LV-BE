import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart_item.entity';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { User } from 'src/user/entities/user.entity';
import { ProductVersionService } from 'src/product-version/product-version.service';

@Injectable()
export class CartItemService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private productVersion: ProductVersionService,
  ) {}

  async findAll(): Promise<CartItem[]> {
    return await this.cartItemRepository.find();
  }

  async findOne(id: number) {
    return await this.cartItemRepository.findOne({ where: { id } });
  }

  async create(user: User, createCartItemDto: CreateCartItemDto) {
    const { cart_id, versionId, size_id, size_quatity, size_name } =
      createCartItemDto;

    const shopId = await this.productVersion.findShopByVersionId(versionId);

    const cartItem = new CartItem();
    cartItem.cart_id = user.cart_id;
    cartItem.version_id = versionId;
    cartItem.size_id = size_id;
    cartItem.size_quantity = size_quatity;
    cartItem.size_name = size_name;
    cartItem.shop_id = shopId;

    await cartItem.save();

    return cartItem;
  }

  async update(
    user: User,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const { cartItemId, size_quantity } = updateCartItemDto;

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cart_id: user.cart_id },
    });

    if (!cartItem) {
      throw new NotFoundException(
        `CartItem with ID ${cartItemId} not found in user's cart`,
      );
    }

    // Assuming you want to update the size_quantity property
    cartItem.size_quantity = size_quantity;

    await this.cartItemRepository.save(cartItem);

    return cartItem;
  }

  async delete(id: number) {
    let status = true;
    const target = await this.cartItemRepository.delete(id);
    if (!target) {
      status = false;
    }
    return { status };
  }

  async getAllCartItemsForShop(shop_id: number): Promise<CartItem[]> {
    const cartitem = await this.cartItemRepository.find({
      where: { id: shop_id },
    });
    return cartitem;
  }
}
