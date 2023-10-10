import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthCredentials } from './dto/auth-credentials.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('login')
  login(@Body() authCredentials: AuthCredentials) {
    return this.authService.login(authCredentials);
  }
  @Get('/me')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@GetUser() user: User) {
    return { user };
  }
}
