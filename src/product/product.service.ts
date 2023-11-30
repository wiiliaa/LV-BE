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
import { User } from 'src/user/entities/user.entity';
import { SearchKeywordService } from 'src/search_keyword/search_keyword.service';
import { existsSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { ImageService } from 'src/image/image.service';
import { ProductCategoriesService } from 'src/product_categories/product_categories.service';
import { version } from 'os';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private searchKeywordService: SearchKeywordService,
    private imageService: ImageService,
    private productCategoryService: ProductCategoriesService,
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
      await this.updateDiscountedPrice(product.id);
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
        await this.updateDiscountedPrice(product.id);
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
    const res = await this.productRepository.findOne({
      where: { id },
      relations: ['categories', 'versions', 'versions.sizes'], // Add 'versions.image' to load version images
    });

    if (!res) {
      throw new Error(`Product with ID ${id} not found`);
    }

    // Load images for the product and its versions
    const productImage = await this.imageService.getImage(res.image);

    // Load images for each version and nest them within the version object
    const versionsWithImages = await Promise.all(
      res.versions.map(async (version) => {
        const versionImage = await this.imageService.getImage(version.image);
        return { ...version, image: versionImage };
      }),
    );

    // Update discounted price for the product
    await this.updateDiscountedPrice(res.id);

    return { ...res, image: productImage, versions: versionsWithImages };
  }

  async findByName(name: string): Promise<Product[]> {
    const found = await this.productRepository
      .createQueryBuilder('Product')
      .where('Product.name like :name', { name: `%${name}%` }) // Use '%' to perform a partial match
      .leftJoinAndSelect('Product.categories', 'categories') // Include categories in the query
      .getMany();

    if (!found) {
      throw new InternalServerErrorException(`Product: ${name} non-exist`);
    }

    const productsWithImages: Product[] = await Promise.all(
      found.map(async (product) => {
        await this.updateDiscountedPrice(product.id);
        const image = await this.imageService.getImage(product.image);
        return { ...product, image } as Product;
      }),
    );

    return productsWithImages;
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

  async findProductsByShop(user: User, shopId: number): Promise<Product[]> {
    // Lấy danh sách sản phẩm từ cơ sở dữ liệu dựa trên shopId và bao gồm các relations
    const products = await this.productRepository.find({
      where: {
        shop: {
          id: shopId,
        },
      },
      relations: ['discount'],
    });

    // Duyệt qua từng sản phẩm và thêm thông tin ảnh và discount
    const productsWithImages: Product[] = await Promise.all(
      products.map(async (product) => {
        await this.updateDiscountedPrice(product.id);

        // Lấy thông tin ảnh của sản phẩm
        const image = await this.imageService.getImage(product.image);

        // Lấy thông tin discount nếu tồn tại
        const discount = product.discount;

        // Tạo một đối tượng mới chỉ với thông tin ảnh và discount được thêm vào
        return {
          ...product,
          image,
          discount,
        } as Product;
      }),
    );

    // Trả về danh sách sản phẩm với thông tin ảnh và discount
    return productsWithImages;
  }

  // async update(
  //   id: number,
  //   updateProductDto: UpdateProductDto,
  //   user: User,
  // ): Promise<{ success: boolean }> {
  //   const unlinkAsync = promisify(fs.unlink);
  //   const writeFileAsync = promisify(fs.writeFile);

  //   try {
  //     const product = await this.productRepository.findOne({
  //       where: { id },
  //     });

  //     if (!product) {
  //       throw new NotFoundException('Sản phẩm không tồn tại');
  //     }

  //     // Nếu có hình ảnh mới được cung cấp trong DTO, thực hiện cập nhật
  //     if (updateProductDto.image) {
  //       // Kiểm tra xem có hình ảnh cũ không
  //       if (product.image) {
  //         const oldImagePath = join('/public/uploads/', product.image);

  //         // Nếu file cũ tồn tại, xóa nó đi
  //         if (existsSync(oldImagePath)) {
  //           await unlinkAsync(oldImagePath);
  //         }
  //       }

  //       // Tạo đường dẫn và tên file cho hình mới
  //       const fileName = `${product.id}_${Date.now()}-image.txt`;
  //       const filePath = `public/uploads/${fileName}`;

  //       // Lưu mã base64 mới vào tệp văn bản
  //       await writeFileAsync(filePath, updateProductDto.image);

  //       // Lưu đường dẫn tệp vào trường image của sản phẩm
  //       updateProductDto.image = fileName;
  //     }

  //     // Thực hiện cập nhật thông tin sản phẩm
  //     await this.productRepository.update(id, updateProductDto);
  //     await this.updateTotal(id);
  //     await this.updateDiscountedPrice(id);
  //     return { success: true };
  //   } catch (error) {
  //     console.error('Lỗi khi cập nhật sản phẩm:', error);
  //     throw new InternalServerErrorException('Lỗi khi cập nhật sản phẩm');
  //   }
  // }

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
        relations: ['categories'],
      });

      if (!product) {
        throw new NotFoundException('Sản phẩm không tồn tại');
      }

      const categoryIds = updateProductDto.categoryIds;
      delete updateProductDto.categoryIds;
      Object.assign(product, updateProductDto);

      await this.productRepository.update(id, updateProductDto);
      if (updateProductDto.image) {
        if (product.image) {
          const oldImagePath = join('/public/uploads/', product.image);
          if (existsSync(oldImagePath)) {
            await unlinkAsync(oldImagePath);
          }
        }
        const fileName = `${product.id}_${Date.now()}-image.txt`;
        const filePath = `public/uploads/${fileName}`;
        await writeFileAsync(filePath, updateProductDto.image);
        updateProductDto.image = fileName;
      }

      // If there are categoryIds provided, update the categories of the product
      if (categoryIds) {
        const categoryIdsArray = Array.isArray(categoryIds)
          ? categoryIds
          : [categoryIds];
        const categories = await Promise.all(
          categoryIdsArray.map((categoryId) =>
            this.productCategoryService.findById(categoryId),
          ),
        );
        product.categories = [...categories.filter((category) => !!category)];
      }

      await this.updateTotal(id);
      await this.updateDiscountedPrice(id);
      await this.productRepository.save(product);
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
  async findVer(id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { id: id },
        relations: ['versions', 'versions.sizes'],
      });

      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${id}`);
      }

      const versionsWithImages = await Promise.all(
        product.versions.map(async (version) => ({
          ...version,
          image: await this.imageService.getImage(version.image),
        })),
      );

      return versionsWithImages;
    } catch (error) {
      console.error('Lỗi:', error.message);
      return null;
    }
  }

  async updateDiscountedPrice(id: number): Promise<Product> {
    // Tìm sản phẩm theo ID
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['discount'], // Đảm bảo lấy thông tin về discount
    });

    if (product && product.discount) {
      // Kiểm tra sự tồn tại của discount
      if (product.discount.percent) {
        // Nếu có percent, thực hiện tính toán dựa trên dữ liệu đã nạp
        product.discountedPrice =
          product.price - (product.price * product.discount.percent) / 100;
      } else {
        // Nếu không có percent, đặt discountedPrice bằng price
        product.discountedPrice = product.price;
      }

      return this.productRepository.save(product);
    } else {
      product.discountedPrice = product.price;
      await this.productRepository.save(product);
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

  async addProductToCategories(
    productId: number,
    categoryIds: number | number[],
  ): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['categories'],
    });

    const categoryIdsArray = Array.isArray(categoryIds)
      ? categoryIds
      : [categoryIds];

    const categories = await Promise.all(
      categoryIdsArray.map((id) => this.productCategoryService.findById(id)),
    );

    if (!product || categories.some((category) => !category)) {
      throw new Error('Product or categories not found');
    }

    product.categories = [
      ...product.categories,
      ...categories.filter((category) => !!category),
    ];

    await this.productRepository.save(product);
  }

  async deleteProductFromCategories(
    productId: number,
    categoryIds: number | number[],
  ): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['categories'],
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const categoryIdsArray = Array.isArray(categoryIds)
      ? categoryIds
      : [categoryIds];

    // Lọc bỏ các danh mục có id nằm trong mảng categoryIds
    product.categories = product.categories.filter(
      (category) => !categoryIdsArray.includes(category.id),
    );

    await this.productRepository.save(product);
  }

  async findProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      // Find the category
      const category = await this.productCategoryService.findById(categoryId);

      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }

      // Find products associated with the category
      const products = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.categories', 'categories')
        .where('categories.id = :categoryId', { categoryId })
        .getMany();

      // Duyệt qua từng sản phẩm và thêm thông tin ảnh
      const productsWithImages: Product[] = await Promise.all(
        products.map(async (product) => {
          await this.updateDiscountedPrice(product.id);
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
    } catch (error) {
      console.error('Lỗi khi tìm sản phẩm theo danh mục:', error.message);
      throw new InternalServerErrorException(
        'Lỗi khi tìm sản phẩm theo danh mục',
      );
    }
  }
  async findProductsByCategoryAndShop(
    user: User,
    categoryId: number,
  ): Promise<Product[]> {
    try {
      // Check if the category exists
      const category = await this.productCategoryService.findById(categoryId);

      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }

      // Find products associated with the user's shop and category, including discount
      const products = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.categories', 'categories')
        .leftJoinAndSelect('product.discount', 'discount') // Include discount in the query
        .where('product.shop_id = :shopId', { shopId: user.shop_id })
        .andWhere('categories.id = :categoryId', { categoryId })
        .getMany();

      // Process products and return them
      const productsWithImages: Product[] = await Promise.all(
        products.map(async (product) => {
          await this.updateDiscountedPrice(product.id);
          const image = await this.imageService.getImage(product.image);

          // Include discount information in the returned product object
          return {
            ...product,
            image,
            discount: product.discount,
          } as Product;
        }),
      );

      return productsWithImages;
    } catch (error) {
      console.error(
        'Error finding products by category and shop:',
        error.message,
      );
      throw new InternalServerErrorException(
        'Error finding products by category and shop',
      );
    }
  }
}
