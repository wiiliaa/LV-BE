import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/product/entities/product.entity';
import { ProductSize } from 'src/product_size/entities/product_size.entity';
import { CreateProductVersionDto } from './dto/create-product-version.dto';
import { UpdateProductVersionDto } from './dto/update-product-version.dto';
import { ProductVersion } from './entities/product-version.entity';
import { ProductSizeService } from 'src/product_size/product_size.service';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class ProductVersionService {
  constructor(
    @InjectRepository(ProductVersion)
    private readonly productVersionRepository: Repository<ProductVersion>,

    private productService: ProductService,

    private productSizeService: ProductSizeService,
  ) {}

  async create(
    productId: number,
    createProductVersionDto: CreateProductVersionDto,
  ): Promise<ProductVersion> {
    const product = await this.productService.findById(productId);

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const productVersion = new ProductVersion();
    product.hasVersion = true;
    productVersion.versionName = createProductVersionDto.versionName;
    productVersion.image = createProductVersionDto.image;
    productVersion.product = product;

    await this.productVersionRepository.save(productVersion);

    // Tạo các kích thước sản phẩm cho phiên bản nếu có
    if (
      createProductVersionDto.sizes &&
      createProductVersionDto.sizes.length > 0
    ) {
      for (const sizeDto of createProductVersionDto.sizes) {
        const productSize = new ProductSize();
        productSize.sizeName = sizeDto.sizeName;
        productSize.quantity = sizeDto.quantity;
        productSize.productVersion = productVersion;

        await this.productSizeService.create(productSize);
      }
    }

    return productVersion;
  }

  async findAll(): Promise<ProductVersion[]> {
    return await this.productVersionRepository.find();
  }

  async findById(id: number): Promise<ProductVersion> {
    const productVersion = await this.productVersionRepository.findOne({
      where: { id },
    });

    if (!productVersion) {
      throw new NotFoundException(`ProductVersion with ID ${id} not found`);
    }

    return productVersion;
  }

  async update(
    id: number,
    updateProductVersionDto: UpdateProductVersionDto,
  ): Promise<ProductVersion> {
    await this.productVersionRepository.update(id, updateProductVersionDto);

    return await this.productVersionRepository.findOne({
      where: { id },
    });
  }

  async delete(id: number): Promise<void> {
    const productVersion = await this.productVersionRepository.findOne({
      where: { id },
    });

    if (!productVersion) {
      throw new NotFoundException(`ProductVersion with ID ${id} not found`);
    }

    await this.productVersionRepository.remove(productVersion);
  }
}
