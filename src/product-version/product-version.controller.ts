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

@Controller('product-versions')
export class ProductVersionController {
  constructor(private readonly productVersionService: ProductVersionService) {}

  @Post('/:productId/createVersion')
  async create(
    @Param('productId') productId: number,
    @Body() createProductVersionDto: CreateProductVersionDto,
  ): Promise<ProductVersion> {
    return this.productVersionService.create(
      productId,
      createProductVersionDto,
    );
  }

  @Get()
  async findAll(): Promise<ProductVersion[]> {
    return this.productVersionService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<ProductVersion> {
    const productVersion = await this.productVersionService.findById(id);
    if (!productVersion) {
      throw new NotFoundException(`ProductVersion with ID ${id} not found`);
    }
    return productVersion;
  }

  @Put(':id/update')
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
