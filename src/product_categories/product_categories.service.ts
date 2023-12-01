// product-category.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ProductCategory } from './entities/product_category.entity';
import { CreateProductCategoryDto } from './dto/create-product_category.dto';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync } from 'fs';
import * as fs from 'fs';
import { UpdateProductCategoryDto } from './dto/update-product_category.dto';
import { ImageService } from 'src/image/image.service';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private productCategoryRepository: Repository<ProductCategory>,
    private imageService: ImageService,
  ) {}

  async findAll(): Promise<ProductCategory[]> {
    // Lấy danh sách danh mục sản phẩm từ cơ sở dữ liệu
    const categories = await this.productCategoryRepository.find();

    // Sắp xếp danh sách theo id
    categories.sort((a, b) => a.id - b.id);

    // Duyệt qua từng danh mục sản phẩm và thêm thông tin ảnh
    const categoriesWithImages: ProductCategory[] = await Promise.all(
      categories.map(async (category) => {
        // Lấy thông tin ảnh từ imageService
        const image = await this.imageService.getImage(category.image);

        // Tạo một đối tượng mới chỉ với thông tin ảnh được thêm vào
        return {
          ...category,
          image,
        } as ProductCategory;
      }),
    );

    // Trả về danh sách danh mục sản phẩm với thông tin ảnh và đã sắp xếp theo id
    return categoriesWithImages;
  }

  async findOne(id: number) {
    const res = await this.productCategoryRepository.findOne({ where: { id } });
    const image1 = await this.imageService.getImage(res.image);
    return { ...res, image: image1 };
  }

  async create(categoryData: CreateProductCategoryDto) {
    const { name, image } = categoryData;
    const writeFileAsync = promisify(fs.writeFile);
    const category = new ProductCategory();
    category.name = name;
    category.image = image;
    if (image) {
      try {
        // Tạo đường dẫn và tên file cho mã base64
        const randomSuffix = Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, '0');
        const fileName = `${randomSuffix}-image.txt`;
        const filePath = `public/uploads/${fileName}`;
        // Lưu mã base64 vào tệp văn bản
        await writeFileAsync(filePath, image);
        // Lưu đường dẫn tệp vào trường image của sản phẩm
        category.image = fileName;
      } catch (error) {
        throw new InternalServerErrorException('Lỗi khi lưu mã base64 vào tệp');
      }
    }
    await category.save();
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateProductCategoryDto,
  ): Promise<{ success: boolean }> {
    const unlink = promisify(fs.unlink);
    const writeFile = promisify(fs.writeFile);

    try {
      const category = await this.productCategoryRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Danh mục không tồn tại');
      }

      if (updateCategoryDto.image) {
        if (category.image) {
          const oldImagePath = join('public/uploads/', category.image);

          if (existsSync(oldImagePath)) {
            await unlink(oldImagePath);
          }
        }

        const randomSuffix = Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, '0');
        const fileName = `${randomSuffix}-image.txt`;
        const filePath = `public/uploads/${fileName}`;

        await writeFile(filePath, updateCategoryDto.image);

        updateCategoryDto.image = fileName;
      }

      await this.productCategoryRepository.update(id, updateCategoryDto);

      return { success: true };
    } catch (error) {
      console.error('Lỗi khi cập nhật danh mục:', error);
      throw new InternalServerErrorException('Lỗi khi cập nhật danh mục');
    }
  }

  async deleteCategory(categoryId: number): Promise<{ success: boolean }> {
    const unlink = promisify(fs.unlink);

    try {
      const category = await this.productCategoryRepository.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException('Danh mục không tồn tại');
      }

      // Nếu danh mục có hình ảnh, xóa nội dung của file hình ảnh
      if (category.image) {
        const imagePath = `public/uploads/${category.image}`;
        await unlink(imagePath);
      }

      // Xóa danh mục khỏi cơ sở dữ liệu
      const deleteResult = await this.productCategoryRepository.delete(
        categoryId,
      );

      return { success: deleteResult.affected && deleteResult.affected > 0 };
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
      throw new InternalServerErrorException('Lỗi khi xóa danh mục');
    }
  }

  async findById(id: number): Promise<ProductCategory | null> {
    return await this.productCategoryRepository.findOne({ where: { id } });
  }

  async findByName(name: string) {
    return await this.productCategoryRepository.findOne({
      where: { name: Like(`%${name}%`) },
      select: ['id', 'image'],
    });
  }
}
