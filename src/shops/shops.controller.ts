import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Shop } from './entities/shop.entity';
import { ShopService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Shops')
@Controller('shops')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('/createShop')
  @UseGuards(AuthGuard('jwt'))
  create(
    @GetUser() user: User,
    @Body() createShopDto: CreateShopDto,
  ): Promise<Shop> {
    return this.shopService.create(user, createShopDto);
  }

  @Post(':id/process')
  async processShopRequest(
    @Param('id') shopId: number,
    @Body() body: { status: 'accept' | 'reject' },
  ) {
    try {
      const shop = await this.shopService.processShopRequest(
        shopId,
        body.status,
      );
      return { shop };
    } catch (error) {
      return {};
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const result = await this.shopService.findOne(id);
    return result;
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateShopDto: UpdateShopDto) {
    return this.shopService.update(id, updateShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.shopService.remove(id);
  }

  @Get('total/:id')
  async getTotalProductsForShop(@Param('id') id: number): Promise<number> {
    const totalProducts = await this.shopService.getTotalProductsForShop(id);
    return totalProducts;
  }
  @Get('dashBoard/:id')
  async getShopDashboard(@Param('id') shopId: number) {
    const dashboardData = await this.shopService.dashboard(shopId);

    return dashboardData;
  }
}
