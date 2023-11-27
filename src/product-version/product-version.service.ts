import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductVersionDto } from './dto/create-product-version.dto';
import { UpdateProductVersionDto } from './dto/update-product-version.dto';
import { ProductVersion } from './entities/product-version.entity';
import { ProductSizeService } from 'src/product_size/product_size.service';
import { ProductService } from 'src/product/product.service';
import { promisify } from 'util';
import * as fs from 'fs';
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

    const writeFileAsync = promisify(fs.writeFile);
    const { name, image } = createProductVersionDto;
    const productVersion = new ProductVersion();
    product.hasVersion = true;
    productVersion.name = name;
    productVersion.image = image;
    if (image) {
      try {
        // Tạo đường dẫn và tên file cho mã base64
        const fileName = `${name}-image.txt`;
        const filePath = `public/uploads/${fileName}`;

        // Lưu mã base64 vào tệp văn bản
        await writeFileAsync(filePath, image);
        // Lưu đường dẫn tệp vào trường image của phiên bản sản phẩm
        productVersion.image = fileName;
      } catch (error) {
        throw new InternalServerErrorException('Lỗi khi lưu mã base64 vào tệp');
      }
    }
    await this.productVersionRepository.save(productVersion);

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

  async update(id: number, updateProductVersionDto: UpdateProductVersionDto) {
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
