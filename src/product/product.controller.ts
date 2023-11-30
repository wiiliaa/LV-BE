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
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('byCategory/:categoryId')
  async findProductsByCategory(@Param('categoryId') categoryId: number) {
    const products = await this.productService.findProductsByCategory(
      categoryId,
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

  @Get('/getAll')
  async getAll() {
    return this.productService.findAll();
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
  filterProducts(@GetUser() user: User, @Param('filter') filter: string) {
    return this.productService.filterProducts(user, filter);
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
}
