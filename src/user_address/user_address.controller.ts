// user-address.controller.ts
import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Get,
  Delete,
} from '@nestjs/common';
import { CreateUserAddressDto } from './dto/create-user_address.dto';
import { UpdateUserAddressDto } from './dto/update-user_address.dto';
import { UserAddress } from './entities/user_address.entity';
import { UserAddressService } from './user_address.service';

@Controller('user-addresses')
export class UserAddressController {
  constructor(private readonly userAddressService: UserAddressService) {}

  @Post()
  async create(
    @Body() createUserAddressDto: CreateUserAddressDto,
  ): Promise<UserAddress> {
    return await this.userAddressService.create(createUserAddressDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserAddressDto: UpdateUserAddressDto,
  ): Promise<UserAddress> {
    return await this.userAddressService.update(id, updateUserAddressDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<UserAddress> {
    return await this.userAddressService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    await this.userAddressService.remove(id);
  }
}
