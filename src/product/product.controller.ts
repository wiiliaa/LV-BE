import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpException,
  HttpStatus,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { Product } from './entities/product.entity';
@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('byCategoryName/:name')
  async findProductsByCategoryName(
    @Param('name') name: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    const decodedCategoryName = decodeURIComponent(name);
    const products = await this.productService.findProductsByCategoryName(
      decodedCategoryName,
      page,
      pageSize,
    );

    return products;
  }

  @Get('byCategoryOfShop/:categoryId/:shopId')
  @UseGuards(AuthGuard('jwt'))
  async findProductsByShopAndCategory(
    @GetUser() user: User,
    @Param('categoryId') categoryId: number,
  ) {
    // Call the service method to get products by shop and category
    const products = await this.productService.findProductsByCategoryAndShop(
      user,
      categoryId,
    );

    return products;
  }

  @Get('/search/:name')
  async findByName(@Param('name') name: string) {
    return this.productService.findByName(name);
  }

  @Get('/detail/:id')
  async findOne(@Param('id') id: number) {
    return this.productService.findById(id);
  }

  @Get('/search/:filter')
  filterProducts(@Param('filter') filter: string) {
    return this.productService.filterProducts(filter);
  }

  @Get('/shop/:id/all')
  @UseGuards(AuthGuard('jwt'))
  async findProductsByShopId(
    @GetUser() user: User,
    @Param('id') shopId: number,
  ) {
    return this.productService.findProductsByShop(user, shopId);
  }

  @Post('/createProduct')
  @UseGuards(AuthGuard('jwt'))
  create(@GetUser() user: User, @Body() createProductDto: CreateProductDto) {
    return this.productService.create(user, createProductDto);
  }

  @Put('/updateProduct/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productService.update(id, updateProductDto, user);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: number, @GetUser() user: User) {
    return this.productService.delete(id, user);
  }

  @Get('/version/:id')
  async findVer(@Param('id') id: number) {
    try {
      const product = await this.productService.findVer(id);

      if (!product) {
        throw new NotFoundException(
          `Không tìm thấy version của product: ${id}`,
        );
      }

      return product;
    } catch (error) {
      console.error(
        'Lỗi khi lấy sản phẩm, phiên bản và kích thước:',
        error.message,
      );
      return null;
    }
  }

  @Post('/addProductToCate/:productId/:categoryId')
  async addProductToCategories(
    @Param('productId') productId: number,
    @Param('categoryId') categoryIds: number[],
  ) {
    try {
      await this.productService.addProductToCategories(productId, categoryIds);
      return {
        success: true,
        message: 'Product added to categories successfully.',
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to add product to categories.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('/removeProductToCate/:productId/:categoryId')
  async removeCategoriesFromProduct(
    @Param('productId') productId: number,
    @Body('categoryId') categoryIds: number | number[],
  ) {
    try {
      await this.productService.deleteProductFromCategories(
        productId,
        categoryIds,
      );
      return {
        success: true,
        message: 'Categories removed from product successfully.',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to remove categories from product.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/getAll')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('searchTerm') searchTerm?: string,
    @Query('shopId') shopId?: number,
  ): Promise<{ products: Product[]; total: number }> {
    const { products, total } = await this.productService.findAll(
      page,
      pageSize,
      searchTerm,
      shopId,
    );
    return { products, total };
  }

  @Get('/byCategory/:categoryId')
  async findProductsByCategoryPage(
    @Param('categoryId') categoryId: number,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('shopId') shopId: number,
  ) {
    const products = await this.productService.findProductsByCategoryPage(
      categoryId,
      page,
      pageSize,
      shopId,
    );
    return products;
  }

  @Get('totalSold/:id')
  async getTotalSoldQuantity(@Param('id') id: number): Promise<number> {
    const totalSoldQuantity = await this.productService.getTotalSoldQuantity(
      id,
    );

    return totalSoldQuantity;
  }

  @Get('/shop/discount/:shopId')
  async findProductsByDiscountPage(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('shopId') shopId?: number,
  ) {
    const result = await this.productService.findProductsByDiscountPage(
      page,
      pageSize,
      shopId,
    );
    return result;
  }
}
