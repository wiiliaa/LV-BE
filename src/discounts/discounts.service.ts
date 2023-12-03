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
import { ImageService } from 'src/image/image.service';
import { Product } from 'src/product/entities/product.entity';
import { UserAuthResponse } from 'pusher';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    private productService: ProductService,
    private imageService: ImageService,
  ) {}

  async findAll(): Promise<Discount[]> {
    const discounts = await this.discountRepository.find();

    const discountsWithImages: Discount[] = await Promise.all(
      discounts.map(async (discount) => {
        const image = await this.imageService.getImage(discount.image);

        return {
          ...discount,
          image,
        } as Discount;
      }),
    );

    return discountsWithImages;
  }

  async findOne(id: number) {
    const res = await this.discountRepository.findOne({ where: { id } });
    if (res.image) {
      const image1 = await this.imageService.getImage(res.image);
      return { ...res, image: image1 };
    }
    return { ...res };
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

  async delete(id: number): Promise<{ status: boolean }> {
    let status = true;
    const unlinkAsync = promisify(fs.unlink);
    // Tìm thông tin chi tiết của discount
    const discount = await this.discountRepository.findOne({ where: { id } });

    if (!discount) {
      // Nếu không tìm thấy discount, đặt status về false
      status = false;
    } else {
      // Nếu discount được tìm thấy, xóa ảnh nếu tồn tại
      if (discount.image) {
        try {
          const imagePath = `public/uploads/${discount.image}`;
          // Xóa ảnh từ thư mục
          await unlinkAsync(imagePath);
        } catch (error) {
          // Nếu có lỗi trong quá trình xóa ảnh, đặt status về false
          status = false;
        }
      }

      // Tiến hành xóa discount từ cơ sở dữ liệu
      await this.discountRepository.delete(id);
    }

    return { status };
  }
  async activateDiscount(discountId: number, productId: number) {
    try {
      // Find the product by ID
      const product = await this.productService.findById(productId);

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      product.discount_id = discountId;

      // Save changes to the database
      return await this.productService.addDis(productId, discountId);
    } catch (error) {
      // Handle errors
      console.error('Error activating discount:', error);
      throw new InternalServerErrorException('Error activating discount');
    }
  }

  async findAllProductsByDiscountId(discountId: number): Promise<Product[]> {
    // Find the discount by ID with its associated products
    const discount = await this.discountRepository.findOne({
      where: { id: discountId },
      relations: ['product'],
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    // Retrieve images for each associated product
    const productsWithImages = await Promise.all(
      discount.product.map(async (product) => ({
        ...product,
        image: await this.imageService.getImage(product.image), // Replace with your actual service or logic
      })),
    );

    // Return the associated products with images
    return productsWithImages as Product[];
  }
}
