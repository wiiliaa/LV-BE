import {
  BadRequestException,
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
import { extname } from 'path';
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @Get('/getAll')
  @UseInterceptors(ClassSerializerInterceptor)
  async find() {
    return this.usersService.find();
  }

  @Get('/findById/:id')
  async findOne(@Param('id') id: number) {
    return this.usersService.findById(id);
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

  @Post('uploadAvatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: storageConfig('avatar'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['jpg', 'png', 'jpeg'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidatonError = ` Wrong extension type. Accepted file ext are: ${allowedExtArr.toString()}`;
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidatonError = `File size is too lagre. Accepted file size is less to 5mb`;
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    console.log('upload avatar');
    if (req.fileValidatonError) {
      throw new BadRequestException(req.fileValidatonError);
    }
    if (!file) {
      throw new BadRequestException('file is require');
    }
    this.usersService.updateAvatar(
      req.user_data.id,
      file.destination + '/' + file.fieldname,
    );
  }
}
