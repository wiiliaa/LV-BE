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
import { join } from 'path';
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

  async update(
    id: number,
    updateShopDto: UpdateShopDto,
  ): Promise<{ success: boolean }> {
    const existsSync = fs.existsSync;
    const unlinkAsync = promisify(fs.unlink);
    const writeFileAsync = promisify(fs.writeFile);

    try {
      const shopToUpdate = await this.shopRepository.findOne({
        where: { id: id },
      });

      if (!shopToUpdate) {
        throw new NotFoundException('Shop not found');
      }

      // If a new avatar is provided in the DTO, perform the update
      if (updateShopDto.avatar) {
        // Check if there is an old avatar
        if (shopToUpdate.avatar) {
          const oldImagePath = join('public/uploads/', shopToUpdate.avatar);

          // If the old file exists, delete it
          if (existsSync(oldImagePath)) {
            await unlinkAsync(oldImagePath);
          }
        }

        // Use the shop name as part of the file name (adjust as needed)
        const fileName = `${shopToUpdate.name}-avatar.txt`;
        const filePath = join('public/uploads/', fileName);

        // Save the new avatar to the text file
        await writeFileAsync(filePath, updateShopDto.avatar);
        updateShopDto.avatar = fileName;
      }

      const updateResult = await this.shopRepository
        .createQueryBuilder('shop')
        .update(Shop)
        .set(updateShopDto)
        .where('id = :id', { id: id })
        .execute();

      if (updateResult.affected && updateResult.affected > 0) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      throw new InternalServerErrorException('Error updating shop');
    }
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
