import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Like, QueryBuilder, Repository, SelectQueryBuilder } from 'typeorm';
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
import * as unorm from 'unorm';
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
      const {
        name,
        brand,
        price,
        description,
        image,
        type,
        gender,
        origin,
        categoryIds,
      } = createProductDto;
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
        await product.save();
        const fileName = `${product.id}-image.txt`;
        const filePath = `public/uploads/${fileName}`;

        // Lưu mã base64 vào tệp văn bản
        await writeFileAsync(filePath, image);
        // Lưu đường dẫn tệp vào trường image của sản phẩm
        product.image = fileName;
      }

      // Lưu sản phẩm và cập nhật danh sách sản phẩm của người bán
      await product.save();
      await this.updateTotal(product.id);
      await this.addProductToNewProducts(product.id);
      await this.updateDiscountedPrice(product.id);

      // Kiểm tra xem có categoryIds được cung cấp hay không
      if (categoryIds) {
        await this.addProductToCategories(product.id, categoryIds); // Thêm sản phẩm vào danh mục
      }

      return product;
    }

    throw new InternalServerErrorException(`Bạn không có quyền`);
  }
  async findAll(
    page: number = 1,
    pageSize: number = 8,
    searchTerm?: string,
  ): Promise<{ products: Product[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const queryBuilder: SelectQueryBuilder<Product> =
      this.productRepository.createQueryBuilder('product');

    if (searchTerm) {
      queryBuilder.where(
        `(LOWER(product.name) LIKE LOWER(:searchTerm) OR LOWER(product.description) LIKE LOWER(:searchTerm))`,
        { searchTerm: `%${searchTerm}%` },
      );
    }

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(take)
      .getManyAndCount();

    if (total === 0) {
      return { products: [], total: 0 };
    }

    const productsWithImages: Product[] = await Promise.all(
      products.map(async (product) => {
        await this.updateDiscountedPrice(product.id);
        const image = await this.imageService.getImage(product.image);
        return {
          ...product,
          image,
        } as Product;
      }),
    );

    const totalPages = Math.ceil(total / pageSize);

    return { products: productsWithImages, total: totalPages };
  }

  async findById(id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['categories', 'versions', 'versions.sizes', 'discount'],
      });

      if (!product) {
        return null;
      }

      // Load images for the product and its versions
      const productImage = await this.imageService.getImage(product.image);

      // Load images for each version and nest them within the version object
      const versionsWithImages = await Promise.all(
        product.versions.map(async (version) => {
          const versionImage = await this.imageService.getImage(version.image);
          return { ...version, image: versionImage };
        }),
      );

      // Update discounted price for the product
      await this.updateDiscountedPrice(product.id);

      // Get totalSold for the product
      const totalSold = await this.getTotalSoldQuantity(product.id);

      // Return the product object with additional information
      return {
        ...product,
        image: productImage,
        versions: versionsWithImages,
        totalSold,
      };
    } catch (error) {
      console.error('Error finding product by ID:', error.message);
      throw new NotFoundException('Error finding product by ID');
    }
  }

  async findByName(name: string): Promise<Product[]> {
    const found = await this.productRepository
      .createQueryBuilder('Product')
      .where('Product.name like :name', { name: `%${name}%` }) // Use '%' to perform a partial match
      .leftJoinAndSelect('Product.categories', 'categories') // Include categories in the query
      .getMany();

    if (!found) {
      return [];
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

  async filterProducts(filter: string): Promise<Product[]> {
    const filteredProducts = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.versions', 'version')
      .leftJoinAndSelect('product.sizes', 'size')
      .leftJoinAndSelect('product.shop', 'shop')
      .where('product.name LIKE :filter', { filter: `%${filter}%` })
      .orWhere('product.description LIKE :filter', { filter: `%${filter}%` })
      .orWhere('version.color LIKE :filter', { filter: `%${filter}%` })
      .orWhere('size.name LIKE :filter', { filter: `%${filter}%` })
      .orWhere('shop.name LIKE :filter', { filter: `%${filter}%` })
      .getMany();

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

    // Duyệt qua từng sản phẩm và thêm thông tin ảnh, discount và totalSold
    const productsWithImages: Product[] = await Promise.all(
      products.map(async (product) => {
        await this.updateDiscountedPrice(product.id);

        // Lấy thông tin ảnh của sản phẩm
        const image = await this.imageService.getImage(product.image);

        // Lấy thông tin discount nếu tồn tại
        const discount = product.discount;

        // Lấy totalSold cho sản phẩm
        const totalSold = await this.getTotalSoldQuantity(product.id);

        // Thêm trực tiếp thuộc tính image, discount, và totalSold vào đối tượng product
        product.image = image;
        product.discount = discount;
        product.totalSold = totalSold;

        // Trả về sản phẩm với thông tin ảnh, discount và totalSold
        return product;
      }),
    );

    return productsWithImages;
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
        relations: ['categories'],
      });

      const categoryIds = updateProductDto.categoryIds;
      delete updateProductDto.categoryIds;

      if (updateProductDto.image) {
        if (product.image) {
          const oldImagePath = join('public/uploads/', product.image);
          if (existsSync(oldImagePath)) {
            await unlinkAsync(oldImagePath);
          }
        }
        const randomSuffix = Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, '0');
        const fileName = `${randomSuffix}-image.txt`;
        const filePath = `public/uploads/${fileName}`;
        await writeFileAsync(filePath, updateProductDto.image);
        updateProductDto.image = fileName;
        await this.productRepository.update(id, updateProductDto);
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
      Object.assign(product, updateProductDto);

      await this.productRepository.update(id, updateProductDto);

      await this.updateTotal(id);
      await this.updateDiscountedPrice(id);
      await this.productRepository.save(product);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  async delete(productId: number, user: User): Promise<{ success: boolean }> {
    const unlinkAsync = promisify(fs.unlink);
    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (!product) {
        return { success: false };
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
      return { success: false };
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
        return [];
      }

      const versionsWithImages = await Promise.all(
        product.versions.map(async (version) => ({
          ...version,
          image: await this.imageService.getImage(version.image),
        })),
      );

      return versionsWithImages;
    } catch (error) {
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
  ) {
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
      return { success: false };
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
  ) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['categories'],
    });

    if (!product) {
      return { success: false };
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
        return [];
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
      return [];
    }
  }

  async findProductsByCategoryName(categoryName: string): Promise<Product[]> {
    try {
      // Find the category by name
      const category = await this.productCategoryService.findByName(
        categoryName,
      );

      if (!category) {
        return [];
      }

      // Find products associated with the category
      const products = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.categories', 'categories')
        .where('categories.id = :categoryId', { categoryId: category.id })
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
      return [];
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
        return [];
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
      return [];
    }
  }

  async addProductToNewProducts(productId: number) {
    try {
      // Tìm sản phẩm theo ID
      const product = await this.productRepository.findOne({
        where: { id: productId },
        relations: ['categories'],
      });

      if (!product) {
        return [];
      }

      // Tìm hoặc tạo danh mục "New Products"
      let newProductsCategory = await this.productCategoryService.findByName(
        'New Products',
      );

      // Thêm sản phẩm vào danh mục "New Products"
      await this.addProductToCategories(productId, newProductsCategory.id);
    } catch (error) {
      console.error(
        'Lỗi khi thêm sản phẩm vào danh mục "New Products":',
        error.message,
      );
      throw new NotFoundException(
        'Lỗi khi thêm sản phẩm vào danh mục "New Products"',
      );
    }
  }

  async findAllPage(
    page: number = 1, // Default to page 1 if not provided
    pageSize: number = 8, // Default to a page size of 10 if not provided
  ): Promise<Product[]> {
    try {
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const [products, total] = await this.productRepository.findAndCount({
        skip,
        take,
      });

      if (total === 0) {
        throw new NotFoundException('No products found.');
      }

      // Duyệt qua từng sản phẩm và thêm thông tin ảnh và giảm giá
      const productsWithImages: Product[] = await Promise.all(
        products.map(async (product) => {
          await this.updateDiscountedPrice(product.id);
          const image = await this.imageService.getImage(product.image);

          // Tạo một đối tượng mới chỉ với thông tin ảnh và giảm giá được thêm vào
          return {
            ...product,
            image,
          } as Product;
        }),
      );

      // Trả về danh sách sản phẩm với thông tin ảnh và giảm giá
      return productsWithImages;
    } catch (error) {
      console.error('Error retrieving products:', error);
      throw new NotFoundException('Error retrieving products');
    }
  }

  async findProductsByCategoryPage(
    categoryId: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ products: Product[]; total: number }> {
    try {
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const [products, count] = await this.productRepository.findAndCount({
        join: {
          alias: 'product',
          innerJoinAndSelect: {
            categories: 'product.categories',
          },
        },
        where: {
          categories: {
            id: categoryId,
          },
        },
        skip,
        take,
      });

      // Process products and return them
      const productsWithImages: Product[] = await Promise.all(
        products.map(async (product) => {
          await this.updateDiscountedPrice(product.id);
          const image = await this.imageService.getImage(product.image);

          // Create a new object with added image and discount information
          return {
            ...product,
            image,
          } as Product;
        }),
      );

      const total = Math.ceil(count / pageSize);

      return { products: productsWithImages, total };
    } catch (error) {
      console.error('Error finding products by category:', error.message);
      throw new NotFoundException('Error finding products by category');
    }
  }

  async removeDiscountFromProducts(discountId: number): Promise<void> {
    const products = await this.productRepository.find({
      where: {
        discount: { id: discountId },
      },
    });

    for (const product of products) {
      product.discount = null; // Xóa reference đến discount
      await this.productRepository.save(product);
      await this.updateDiscountedPrice(product.id);
    }
  }

  async findProduct(id: number) {
    return this.productRepository.findOne({ where: { id } });
  }
  async getTotalSoldQuantity(productId: number): Promise<number> {
    const totalSold = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.versions', 'version')
      .leftJoin('version.order_items', 'order_item')
      .where('product.id = :productId', { productId })
      .select('SUM(order_item.quantity)', 'totalSold')
      .getRawOne();

    return totalSold.totalSold || 0;
  }
}
