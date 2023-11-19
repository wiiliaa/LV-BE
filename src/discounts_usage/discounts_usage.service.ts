import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiscountsUsageDto } from './dto/create-discounts_usage.dto';
import { UpdateDiscountsUsageDto } from './dto/update-discounts_usage.dto';
import { DiscountUsage } from './entities/discounts_usage.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Discount } from 'src/discounts/entities/discount.entity';

@Injectable()
export class DiscountsUsageService {
  constructor(
    @InjectRepository(DiscountUsage)
    private readonly discountUsageRepository: Repository<DiscountUsage>,
  ) {}

  async createDiscountUsage(
    user: User,
    discount: Discount,
  ): Promise<DiscountUsage> {
    const discountUsage = new DiscountUsage();
    discountUsage.user = user;
    discountUsage.discount = discount;
    return await this.discountUsageRepository.save(discountUsage);
  }

  async findDiscountUsagesByUser(user: User): Promise<DiscountUsage[]> {
    return await this.discountUsageRepository.find({
      where: { id: user.id },
    });
  }

  async findDiscountUsagesByDiscount(
    discount: Discount,
  ): Promise<DiscountUsage[]> {
    return await this.discountUsageRepository.find({
      where: { id: discount.id },
    });
  }

  async deleteDiscountUsage(id: number): Promise<void> {
    const discountUsage = await this.discountUsageRepository.findOne({
      where: { id },
    });
    if (!discountUsage) {
      throw new NotFoundException(`DiscountUsage with ID ${id} not found.`);
    }
    await this.discountUsageRepository.remove(discountUsage);
  }
}
