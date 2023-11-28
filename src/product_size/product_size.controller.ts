import {
  Controller,
  Put,
  Param,
  Body,
  Delete,
  Get,
  Post,
} from '@nestjs/common';
import { ProductSizeService } from './product_size.service';
import { UpdateProductSizeDto } from './dto/update-product_size.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateProductSizeDto } from './dto/create-product_size.dto';

@ApiTags('Product_sizes')
@Controller('sizes')
export class ProductSizeController {
  constructor(private productSizeService: ProductSizeService) {}

  @Post('/createSize/:id')
  create(
    @Param('id') id: number,
    @Body() createProductSizeDtos: CreateProductSizeDto[],
  ) {
    const productSizes = this.productSizeService.create(
      id,
      createProductSizeDtos,
    );
    return productSizes;
  }

  @Put('/:id/:sizeName')
  async updateProductSize(
    @Param('id') id: number,
    @Param('sizeName') sizeName: string,
    @Body() updateDto: UpdateProductSizeDto,
  ) {
    const updatedProductSize = await this.productSizeService.update(
      id,
      sizeName,
      updateDto,
    );

    return updatedProductSize;
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    return this.productSizeService.delete(id);
  }

  @Get('/size/productId/:id')
  async findSizeByProductId(@Param('id') id: number) {
    return this.productSizeService.findByProductId(id);
  }
}
