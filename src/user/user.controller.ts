import {
  ClassSerializerInterceptor,
  Controller,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'src/helper/config';
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  async find() {
    return this.usersService.find();
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  // @Delete('/:id')
  // @UseGuards(AuthGuard('jwt'))
  // async delete(@Param('id') id: number) {
  //   return this.usersService.delete(id);
  // }

  @Put('/updateToSeller')
  @UseGuards(AuthGuard('jwt'))
  async updateToSeller(@GetUser() user: User) {
    return this.usersService.updateUserToSeller(user);
  }

  @Put('/updateProfile')
  @UseGuards(AuthGuard('jwt'))
  async update(@Body() updateUserDto: UpdateUserDto, @GetUser() user: User) {
    return this.usersService.update(user, updateUserDto);
  }

  @Post('uploadAvatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('avatar', { storage: storageConfig }))
  uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    console.log('upload avatar');
  }
}
