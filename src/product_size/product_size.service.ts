import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSize } from './entities/product_size.entity';
import { CreateProductSizeDto } from './dto/create-product_size.dto';
import { UpdateProductSizeDto } from './dto/update-product_size.dto';

@Injectable()
export class ProductSizeService {
  constructor(
    @InjectRepository(ProductSize)
    private productSizeRepository: Repository<ProductSize>,
  ) {}

  async create(createProductSizeDto: CreateProductSizeDto) {
    const { sizeName, quantity, productId } = createProductSizeDto;
    const meta = new ProductSize();

    meta.sizeName = sizeName;
    meta.quantity = quantity;
    meta.productId = productId;

    await meta.save();

    return meta;
  }
  async update(
    productId: number,
    sizeName: string,
    updateDto: UpdateProductSizeDto,
  ): Promise<ProductSize | null> {
    const productSize = await this.productSizeRepository.findOne({
      where: { productId, sizeName },
    });

    if (!productSize) {
      return null; // Size not found for the given product and size name
    }

    const { quantity } = updateDto;
    productSize.quantity = quantity;

    await productSize.save();

    return productSize;
  }

  async findBySizeName(sizeName: string): Promise<ProductSize[]> {
    const foundSizes = await this.productSizeRepository.find({
      where: { sizeName },
    });

    if (!foundSizes || foundSizes.length === 0) {
      throw new NotFoundException(
        `No product sizes found for sizeName ${sizeName}`,
      );
    }

    return foundSizes;
  }

  async findByProductId(productId: number): Promise<ProductSize[]> {
    const foundSizes = await this.productSizeRepository.find({
      where: { productId },
    });

    if (!foundSizes || foundSizes.length === 0) {
      throw new NotFoundException(
        `No product sizes found for product with ID ${productId}`,
      );
    }

    return foundSizes;
  }
  async delete(id: number) {
    let status = true;
    const target = await this.productSizeRepository.delete(id);
    if (!target) {
      status = false;
    }
    return { status };
  }
}
