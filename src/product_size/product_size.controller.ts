import { Controller, Put, Param, Body, Delete, Get } from '@nestjs/common';
import { ProductSizeService } from './product_size.service';
import { UpdateProductSizeDto } from './dto/update-product_size.dto';
import { async } from 'rxjs';

@Controller('product-sizes')
export class ProductSizeController {
  constructor(private productSizeService: ProductSizeService) {}

  @Put(':productId/size/:sizeName')
  async updateProductSize(
    @Param('productId') productId: number,
    @Param('sizeName') sizeName: string,
    @Body() updateDto: UpdateProductSizeDto,
  ) {
    const updatedProductSize = await this.productSizeService.update(
      productId,
      sizeName,
      updateDto,
    );

    return updatedProductSize;
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.productSizeService.delete(id);
  }

  @Get('/size/:name')
  async findBySizeName(@Param('name') name: string) {
    return this.productSizeService.findBySizeName(name);
  }

  @Get('/size/productId/:id')
  async findSizeByProductId(@Param('id') id: number) {
    return this.productSizeService.findByProductId(id);
  }
}
