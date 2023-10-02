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

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Shop> {
    return this.shopService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDto,
  ): Promise<Shop> {
    return this.shopService.update(+id, updateShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.shopService.remove(+id);
  }
}
