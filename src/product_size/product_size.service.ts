import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSize } from './entities/product_size.entity';
import { CreateProductSizeDto } from './dto/create-product_size.dto';
import { UpdateProductSizeDto } from './dto/update-product_size.dto';
import { ProductVersionService } from 'src/product-version/product-version.service';

@Injectable()
export class ProductSizeService {
  constructor(
    @InjectRepository(ProductSize)
    private productSizeRepository: Repository<ProductSize>,
  ) {}

  // async createForVersion(
  //   productVersionId: number,
  //   createProductSizeDtos: CreateProductSizeDto[],
  // ) {
  //   // Kiểm tra xem phiên bản sản phẩm có tồn tại không
  //   const productVersion = await this.productVersionService.findById(
  //     productVersionId,
  //   );

  //   if (!productVersion) {
  //     throw new NotFoundException(
  //       `Product version with ID ${productVersionId} not found`,
  //     );
  //   }

  //   const productSizes: ProductSize[] = [];

  //   for (const createProductSizeDto of createProductSizeDtos) {
  //     const { sizeName, quantity } = createProductSizeDto;

  //     const productSize = new ProductSize();
  //     productSize.sizeName = sizeName;
  //     productSize.quantity = quantity;
  //     productSize.version = productVersion;

  //     await productSize.save();
  //     productSizes.push(productSize);
  //   }

  //   return productSizes;
  // }

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
