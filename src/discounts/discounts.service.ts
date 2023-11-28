import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDiscountDto } from './dto/create-discount.dto';
import { Discount } from './entities/discount.entity';
import { User } from 'src/user/entities/user.entity';
import { ProductService } from 'src/product/product.service';
import { identity } from 'rxjs';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    private productService: ProductService,
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

  async createDiscount(
    user: User,
    createDiscountDto: CreateDiscountDto,
  ): Promise<Discount> {
    if (!user.shop) {
      throw new NotFoundException('User does not have a shop');
    }
    const { name, limit, percent, description } = createDiscountDto;
    const existingDiscount = await this.discountRepository.findOne({
      where: { name, shop_id: user.shop.id },
    });

    if (existingDiscount) {
      throw new NotFoundException('Discount with the same name already exists');
    }
    const discount = this.discountRepository.create({
      name,
      limit,
      percent,
      description,
      shop: user.shop,
    });

    return this.discountRepository.save(discount);
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

  async activateDiscountForProduct(
    discountId: number,
    productId: number,
  ): Promise<void> {
    // Kiểm tra xem giảm giá có tồn tại không
    const discount = await this.discountRepository.findOne({
      where: { id: discountId },
      relations: ['product'],
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await this.productService.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Kiểm tra xem giảm giá đã được kích hoạt cho sản phẩm chưa
    if (discount.product) {
      throw new BadRequestException(
        'Discount is already activated for a product',
      );
    }

    // Kích hoạt giảm giá cho sản phẩm
    product.discount_id = discountId;
    discount.product_id = productId;
    // Lưu giảm giá đã được kích hoạt
    await this.discountRepository.save(discount);
  }
}
