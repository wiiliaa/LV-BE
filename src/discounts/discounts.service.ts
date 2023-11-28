import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { Discount } from './entities/discount.entity';
import { User } from 'src/user/entities/user.entity';
import { ProductService } from 'src/product/product.service';
import { promisify } from 'util';

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
    if (user.role !== 'seller') {
      throw new NotFoundException('User does not have a shop');
    }
    const { name, limit, percent, description, image } = createDiscountDto;
    const existingDiscount = await this.discountRepository.findOne({
      where: { name, shop_id: user.shop_id },
    });

    if (existingDiscount) {
      throw new NotFoundException('Discount with the same name already exists');
    }
    const writeFileAsync = promisify(fs.writeFile);
    const discount = this.discountRepository.create({
      name,
      limit,
      percent,
      description,
      shop_id: user.shop_id,
    });
    if (image) {
      try {
        await discount.save();
        const fileName = `${discount.id}-image.txt`;
        const filePath = `public/uploads/${fileName}`;

        // Lưu mã base64 vào tệp văn bản
        await writeFileAsync(filePath, image);
        // Lưu đường dẫn tệp vào trường image của sản phẩm
        discount.image = fileName;
      } catch (error) {
        throw new InternalServerErrorException('Lỗi khi lưu mã base64 vào tệp');
      }
    }

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

  async activateDiscount(discountId: number, productId: number): Promise<void> {
    // Kiểm tra xem giảm giá có tồn tại không
    const discount = await this.discountRepository.findOne({
      where: { id: discountId },
      relations: ['product'],
    });
    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    // Kiểm tra xem sản phẩm đã có giảm giá chưa
    if (await this.hasDiscount(productId)) {
      // Nếu đã có giảm giá, xóa giảm giá cũ trên sản phẩm
      discount.product.discount_id = null;
      discount.product = null;
    }
    // Kích hoạt giảm giá cho sản phẩm
    this.productService.addDis(productId, discountId);
    discount.product_id = productId;
    discount.active = true;
    this.productService.updateDiscountedPrice(productId);
    // Lưu giảm giá đã được kích hoạt
    await this.discountRepository.save(discount);
  }

  async hasDiscount(productId: number): Promise<boolean> {
    const product = await this.productService.findById(productId);
    return !!product?.discount_id;
  }
}
