import {
  BadRequestException,
  ClassSerializerInterceptor,
  Controller,
  NotFoundException,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Delete, Get, Param, Body, Put } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { UpdateUserDto } from './dto/update-uset.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @Get('/getAll')
  @UseInterceptors(ClassSerializerInterceptor)
  async find() {
    return this.usersService.findAll();
  }

  @Get('/findById/:id')
  async findOne(@Param('id') id: number) {
    const user = await this.usersService.findById(id);
    return user;
  }

  @Get('getAll/seller')
  async findSeller() {
    return this.usersService.getSeller();
  }

  @Get('getAll/customer')
  async findCustomer() {
    return this.usersService.getCustomers();
  }

  @Get('getAll/pending')
  async findPending() {
    return this.usersService.getPending();
  }

  // @Delete('/:id')
  // @UseGuards(AuthGuard('jwt'))
  // async delete(@Param('id') id: number) {
  //   return this.usersService.delete(id);
  // }

  @Put('/updateProfile')
  @UseGuards(AuthGuard('jwt'))
  async update(@Body() updateUserDto: UpdateUserDto, @GetUser() user: User) {
    return this.usersService.update(user, updateUserDto);
  }
}
