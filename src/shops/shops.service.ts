import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { User } from 'src/user/entities/user.entity';
import { ImageService } from 'src/image/image.service';
import { promisify } from 'util';
import * as fs from 'fs';
@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private imageService: ImageService,
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
      shop.user.role = 'customer';
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

  async findOne(id: number) {
    const shop = await this.shopRepository.findOne({ where: { id } });
    const image1 = await this.imageService.getImage(shop.avatar);
    return { ...shop, avatar: image1 };
  }

  async remove(id: number): Promise<void> {
    const shop = await this.shopRepository.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException(`Shop with id ${id} not found.`);
    }
    await this.shopRepository.remove(shop);
  }
}
