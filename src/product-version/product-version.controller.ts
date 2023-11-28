import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ProductVersionService } from './product-version.service';
import { CreateProductVersionDto } from './dto/create-product-version.dto';
import { UpdateProductVersionDto } from './dto/update-product-version.dto';
import { ProductVersion } from './entities/product-version.entity';

@Controller('versions')
export class ProductVersionController {
  constructor(private readonly productVersionService: ProductVersionService) {}

  @Post('/createVersion/:id')
  async create(
    @Param('id') id: number,
    @Body() createProductVersionDto: CreateProductVersionDto,
  ): Promise<ProductVersion> {
    return this.productVersionService.create(id, createProductVersionDto);
  }

  @Get()
  async findAll(): Promise<ProductVersion[]> {
    return this.productVersionService.findAll();
  }

  @Get(':id')
  async findid(@Param('id') id: number) {
    const result = await this.productVersionService.findById(id);

    if (!result.found) {
      // Trả về lỗi 404 nếu không tìm thấy sản phẩm
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Trả về thông tin sản phẩm và danh sách ảnh nếu có
    return result;
  }

  @Get('/detail/:id')
  async findById(@Param('id') id: number): Promise<ProductVersion> {
    const { productVersion, found } = await this.productVersionService.findById(
      id,
    );

    if (!found) {
      throw new NotFoundException(`ProductVersion with ID ${id} not found`);
    }

    return productVersion!;
  }

  @Put('updateVersion/:id')
  async update(
    @Param('id') id: number,
    @Body() updateProductVersionDto: UpdateProductVersionDto,
  ): Promise<ProductVersion> {
    return this.productVersionService.update(id, updateProductVersionDto);
  }

  @Delete(':id/delete')
  async delete(@Param('id') id: number): Promise<void> {
    await this.productVersionService.delete(id);
  }
}
