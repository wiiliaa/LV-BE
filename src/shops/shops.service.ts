import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  async create(user: User, createShopDto: CreateShopDto): Promise<Shop> {
    if (user.shop) {
      throw new ConflictException('User already has a shop.');
    }

    createShopDto.user_id = user.id;
    const shop = this.shopRepository.create(createShopDto);
    await this.shopRepository.save(shop);
    user.shop = shop;
    await user.save();
    return shop;
  }

  async processShopRequest(
    shopId: number,
    status: 'accept' | 'reject',
  ): Promise<Shop> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      relations: ['user'],
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (status === 'accept') {
      // Update shop status to 'accept'
      shop.status = 'accept';

      // Update user role to 'seller'
      shop.user.role = 'seller';

      // Save changes
      await this.shopRepository.save(shop);
      await shop.user.save();

      return shop;
    } else if (status === 'reject') {
      // Update shop status to 'reject'
      shop.status = 'reject';

      // Save changes
      await this.shopRepository.save(shop);

      return shop;
    } else {
      throw new BadRequestException('Invalid status');
    }
  }

  async update(id: number, updateShopDto: UpdateShopDto): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException(`Shop with id ${id} not found.`);
    }
    this.shopRepository.merge(shop, updateShopDto);

    return await this.shopRepository.save(shop);
  }

  async findOne(id: number): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException(`Shop with id ${id} not found.`);
    }
    return shop;
  }

  async remove(id: number): Promise<void> {
    const shop = await this.shopRepository.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException(`Shop with id ${id} not found.`);
    }
    await this.shopRepository.remove(shop);
  }
}
