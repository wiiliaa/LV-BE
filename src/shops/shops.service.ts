import {
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
    if (!user.seller) {
      throw new UnauthorizedException('Only sellers can create shops.');
    }
    createShopDto.user_id = user.id;
    const shop = this.shopRepository.create(createShopDto);
    await this.shopRepository.save(shop);
    user.shop = shop;
    await user.save();
    return shop;
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
