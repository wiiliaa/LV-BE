import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDiscountDto } from './dto/create-discount.dto';
import { Discount } from './entities/discount.entity';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
  ) {}

  async find() {
    return this.discountRepository.find();
  }

  async findOne(id: number) {
    const found = await this.discountRepository.findOne({ where: { id } });

    if (!found) {
      throw new BadRequestException(`Discount:${id} non exist`);
    }
    return found;
  }

  async create(createDiscountDto: CreateDiscountDto): Promise<Discount> {
    const discount = this.discountRepository.create(createDiscountDto);
    return await this.discountRepository.save(discount);
  }

  async delete(id: number) {
    let status = true;
    const target = await this.discountRepository.delete(id);
    if (!target) {
      status = false;
    }
    return { status };
  }

  async acceptDiscount(discountId: number) {
    return this.updateDiscountStatus(discountId, 'approved');
  }

  async rejectDiscount(discountId: number) {
    return this.updateDiscountStatus(discountId, 'rejected');
  }

  private async updateDiscountStatus(discountId: number, status: string) {
    const result = await this.discountRepository.update(
      { id: discountId, status: 'pending' },
      { status },
    );

    if (status === 'rejected' && result.affected === 0) {
      throw new BadRequestException('Discount not found or already rejected');
    }

    return result;
  }
}
