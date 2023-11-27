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
import path from 'path';
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
        const publicPath = path.join(__dirname, '..', 'public');
        const imageBuffer = Buffer.from(image, 'base64');
        const imageName = `${name.replace(/\s+/g, '_')}_${Date.now()}.png`; // Đặt tên cho file dựa trên tên sản phẩm
        const imagePath = path.join(publicPath, imageName);

        await promisify(fs.writeFile)(imagePath, imageBuffer);
        product.image = imageName;
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
      .where('Product.name like :name', { name: `%${name}%` })
      .getMany();

    if (!found) {
      throw new InternalServerErrorException(`Product: ${name} non-exist`);
    }
    return found;
  }

  async filterProducts(user: User, filter: string): Promise<Product[]> {
    const filteredProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.name LIKE :filter', { filter: `%${filter}%` })
      .orWhere('product.description LIKE :filter', { filter: `%${filter}%` })
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

  async update(id: number, updateProductDto: UpdateProductDto, user: User) {
    const product = await this.findProductByShop(id, user.shop_id);
    await this.productRepository.update(id, updateProductDto);
    return await this.productRepository.findOne({ where: { id } });
  }

  async delete(id: number, user: User) {
    const product = await this.findProductByShop(id, user.shop.id);
    const deleteResult = await this.productRepository.delete(id);
    if (deleteResult.affected === 0) {
      throw new InternalServerErrorException(
        `Failed to delete product with ID ${id}`,
      );
    }
    return { status: true };
  }
}
