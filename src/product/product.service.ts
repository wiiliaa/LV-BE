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
import { ImageService } from 'src/image/image.service';
import { versions } from 'process';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private searchKeywordService: SearchKeywordService,
    private imageService: ImageService,
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
          await product.save();
          const fileName = `${product.id}-image.txt`;
          const filePath = `public/uploads/${fileName}`;

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
      await this.updateTotal(product.id);
      return product;
    }
    throw new InternalServerErrorException(`You don't have permission`);
  }

  async findAll(): Promise<Product[]> {
    // Lấy danh sách sản phẩm từ cơ sở dữ liệu
    const products = await this.productRepository.find();

    // Duyệt qua từng sản phẩm và thêm thông tin ảnh
    const productsWithImages: Product[] = await Promise.all(
      products.map(async (product) => {
        // Lấy thông tin ảnh từ imageService
        const image = await this.imageService.getImage(product.image);

        // Tạo một đối tượng mới chỉ với thông tin ảnh được thêm vào
        return {
          ...product,
          image,
        } as Product;
      }),
    );

    // Trả về danh sách sản phẩm với thông tin ảnh
    return productsWithImages;
  }

  async findById(id: number) {
    const res = await this.productRepository.findOne({ where: { id } });
    const image1 = await this.imageService.getImage(res.image);
    return { ...res, image: image1 };
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
          const oldImagePath = join('/public/uploads/', product.image);

          // Nếu file cũ tồn tại, xóa nó đi
          if (existsSync(oldImagePath)) {
            await unlinkAsync(oldImagePath);
          }
        }

        // Tạo đường dẫn và tên file cho hình mới
        const fileName = `${product.id}_${Date.now()}-image.txt`;
        const filePath = `public/uploads/${fileName}`;

        // Lưu mã base64 mới vào tệp văn bản
        await writeFileAsync(filePath, updateProductDto.image);

        // Lưu đường dẫn tệp vào trường image của sản phẩm
        updateProductDto.image = fileName;
      }

      // Thực hiện cập nhật thông tin sản phẩm
      await this.productRepository.update(id, updateProductDto);
      await this.updateTotal(id);
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
        const imagePath = `public/uploads/${product.image}`;
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

  async addDis(id: number, idDis: number) {
    const found = await this.productRepository.findOne({
      where: { id },
    });
    if (found) {
      found.discount_id = idDis;
      this.productRepository.save(found);
    }
  }
  async findVer(id: number): Promise<Product | null> {
    try {
      const product = await Product.findOne({
        where: { id: id },
        relations: ['versions', 'versions.sizes'], // Liên kết thông tin về versions và sizes của versions
      });

      return product || null;
    } catch (error) {
      console.error(
        'Lỗi khi lấy sản phẩm, phiên bản và kích thước:',
        error.message,
      );
      return null;
    }
  }

  async updateDiscountedPrice(id: number): Promise<Product> {
    // Tìm sản phẩm theo ID
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['discount'], // Đảm bảo lấy thông tin về discount
    });

    if (product && product.discount && product.discount.percent) {
      // Kiểm tra sự tồn tại của discount và percent
      console.log(product.discount.percent);

      // Thực hiện tính toán dựa trên dữ liệu đã nạp
      product.discountedPrice =
        product.price - (product.price * product.discount.percent) / 100;

      // Lưu lại sản phẩm với giá đã được tính toán
      return this.productRepository.save(product);
    } else {
      // Nếu không có discount hoặc percent, trả về sản phẩm ban đầu
      return product;
    }
  }
  async updateTotal(productId: number) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['versions'],
    });

    if (!product) {
      throw new Error('Không tìm thấy sản phẩm');
    }

    // Tính toán tổng số lượng từ trường total của tất cả các phiên bản sản phẩm
    product.total = product.versions.reduce((total, version) => {
      return total + (version.total || 0);
    }, 0);

    // Cập nhật tổng số lượng cho sản phẩm
    await this.productRepository.save(product);
  }
}
