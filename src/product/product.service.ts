import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductSizeService } from 'src/product_size/product_size.service';
import { CreateProductSizeDto } from 'src/product_size/dto/create-product_size.dto';
import { User } from 'src/user/entities/user.entity';
import { SearchKeywordService } from 'src/search_keyword/search_keyword.service';
import { existsSync } from 'fs';
import { join } from 'path';

import { promisify } from 'util';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private searchKeywordService: SearchKeywordService,
  ) {}

  async create(
    user: User,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    if (user.role === 'seller') {
      const { name, brand, price, description, image, type, gender, origin } =
        createProductDto;
      const writeFileAsync = promisify(fs.writeFile);
      const product = new Product();
      product.name = name;
      product.brand = brand;
      product.price = price;
      product.description = description;
      product.image = image;
      product.type = type;
      product.gender = gender;
      product.origin = origin;
      product.shop_id = user.shop_id;

      if (image) {
        try {
          // Tạo đường dẫn và tên file cho mã base64
          const fileName = `${name.replace(/ /g, '_')}_${Date.now()}-image.txt`;
          const filePath = `src/public/ProductImage/${fileName}`;

          // Lưu mã base64 vào tệp văn bản
          await writeFileAsync(filePath, image);
          // Lưu đường dẫn tệp vào trường image của sản phẩm
          product.image = fileName;
        } catch (error) {
          throw new InternalServerErrorException(
            'Lỗi khi lưu mã base64 vào tệp',
          );
        }
      }

      await product.save();

      return product;
    }
    throw new InternalServerErrorException(`You don't have permission`);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async findById(id: number) {
    const found = await this.productRepository.findOne({ where: { id } });
    if (!found) {
      throw new InternalServerErrorException(`Product:${id} non-exist`);
    }
    return found;
  }

  async findProductsByShopId(user: User, shopId: number): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: { shop_id: shopId },
    });

    return products;
  }

  async findByName(name: string): Promise<Product[]> {
    const found = await this.productRepository
      .createQueryBuilder('Product')
      .where('Product.name like :name', { name: `${name}` })
      .getMany();

    if (!found) {
      throw new InternalServerErrorException(`Product: ${name} non-exist`);
    }
    return found;
  }

  async filterProducts(user: User, filter: string): Promise<Product[]> {
    const filteredProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.name LIKE :filter', { filter: `${filter}` })
      .orWhere('product.description LIKE :filter', { filter: `${filter}` })
      .getMany();
    await this.searchKeywordService.createKeyword(user, filter);
    return filteredProducts;
  }

  async findProductByShop(productId: number, shopId: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
        shop: {
          id: shopId,
        },
      },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${productId} not found for shop with ID ${shopId}`,
      );
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    user: User,
  ): Promise<{ success: boolean }> {
    const unlinkAsync = promisify(fs.unlink);
    const writeFileAsync = promisify(fs.writeFile);

    try {
      const product = await this.productRepository.findOne({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException('Sản phẩm không tồn tại');
      }

      // Nếu có hình ảnh mới được cung cấp trong DTO, thực hiện cập nhật
      if (updateProductDto.image) {
        // Kiểm tra xem có hình ảnh cũ không
        if (product.image) {
          const oldImagePath = join('src/public/ProductImage/', product.image);

          // Nếu file cũ tồn tại, xóa nó đi
          if (existsSync(oldImagePath)) {
            await unlinkAsync(oldImagePath);
          }
        }

        // Tạo đường dẫn và tên file cho hình mới
        const fileName = `${product.name.replace(
          / /g,
          '_',
        )}_${Date.now()}-image.txt`;
        const filePath = join('src/public/ProductImage/', fileName);

        // Lưu mã base64 mới vào tệp văn bản
        await writeFileAsync(filePath, updateProductDto.image);

        // Lưu đường dẫn tệp vào trường image của sản phẩm
        updateProductDto.image = fileName;
      }

      // Thực hiện cập nhật thông tin sản phẩm
      await this.productRepository.update(id, updateProductDto);

      return { success: true };
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      throw new InternalServerErrorException('Lỗi khi cập nhật sản phẩm');
    }
  }

  async delete(productId: number, user: User): Promise<{ success: boolean }> {
    const unlinkAsync = promisify(fs.unlink);
    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Sản phẩm không tồn tại');
      }

      // Nếu sản phẩm có hình ảnh, xóa nội dung của file hình ảnh
      if (product.image) {
        const imagePath = `src/public/ProductImage/${product.image}`;
        await unlinkAsync(imagePath);
      }

      // Xóa sản phẩm khỏi cơ sở dữ liệu
      const deleteResult = await this.productRepository.delete(productId);

      if (deleteResult.affected && deleteResult.affected > 0) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      throw new InternalServerErrorException('Lỗi khi xóa sản phẩm');
    }
  }
}
