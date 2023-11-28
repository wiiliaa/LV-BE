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
    return this.productService.findProductsByShopId(user, shopId);
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
}
