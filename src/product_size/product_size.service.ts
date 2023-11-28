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
    private productVersionService: ProductVersionService,
  ) {}

  async create(
    id: number,
    createProductSizeDtos: CreateProductSizeDto[],
  ): Promise<{ success: boolean }> {
    const productSizes: ProductSize[] = [];
    const found = await this.productVersionService.findById(id);

    try {
      for (const createProductSizeDto of createProductSizeDtos) {
        const { sizeName, quantity, product_id, version_id } =
          createProductSizeDto;
        const productSize = new ProductSize();
        productSize.sizeName = sizeName;
        productSize.quantity = quantity;

        // Kiểm tra xem found có thuộc tính productVersion hay không
        if (found.id && found) {
          productSize.version_id = found.id;
        } else {
          productSize.product_id = id;
        }

        await productSize.save();
        productSizes.push(productSize);
        await this.productVersionService.findQuantityByVersionAndSize(
          id,
          productSize.id,
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error creating product sizes:', error);
      return { success: false };
    }
  }

  async update(
    id: number,
    sizeName: string,
    updateDto: UpdateProductSizeDto,
  ): Promise<ProductSize | null> {
    const productSize = await this.productSizeRepository.findOne({
      where: { id, sizeName },
    });

    const { quantity } = updateDto;
    productSize.quantity = quantity;

    await productSize.save();

    return productSize;
  }

  async findByProductId(id: number): Promise<ProductSize[]> {
    const foundSizes = await this.productSizeRepository.find({
      where: { id },
    });

    if (!foundSizes || foundSizes.length === 0) {
      throw new NotFoundException(
        `No product sizes found for product with ID ${id}`,
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
