import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductSizeService } from 'src/product_size/product_size.service';
import { CreateProductSizeDto } from 'src/product_size/dto/create-product_size.dto';
import { User } from 'src/user/entities/user.entity';
import { Console } from 'console';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private productSizeService: ProductSizeService,
  ) {}

  async create(
    user: User,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    if (user.seller === true) {
      const { name, brand, price, description, ProductSizes } =
        createProductDto;

      const product = new Product();
      product.name = name;
      product.brand = brand;
      product.price = price;
      product.description = description;
      product.shop_id = user.shop_id;
      await product.save();
      if (ProductSizes) {
        for (const sizeDto of ProductSizes) {
          const productSize: CreateProductSizeDto = {
            sizeName: sizeDto.sizeName,
            quantity: sizeDto.quantity,
            productId: product.id,
          };
          await this.productSizeService.create(productSize);
        }
      }

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

  async filterProducts(filter: string): Promise<Product[]> {
    const filteredProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.name LIKE :filter', { filter: `%${filter}%` })
      .orWhere('product.description LIKE :filter', { filter: `%${filter}%` })
      .getMany();

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
    const product = await this.findProductByShop(id, user.shop.id);
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
