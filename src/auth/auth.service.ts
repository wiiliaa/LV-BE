import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { AuthCredentials } from './dto/auth-credentials.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './JWT/jwt-payload.interface';
import { CartsService } from 'src/carts/carts.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly cartService: CartsService,
  ) {}
  async signUp(createUserDto: CreateUserDto) {
    const { username, password, name, email } = createUserDto;
    const user = new User();
    user.username = username;
    user.password = password;
    user.email = email;
    user.name = name || username;

    await user.save();

    await this.cartService.create(user.id);

    return user;
  }

  async login(
    authCredentials: AuthCredentials,
  ): Promise<{ accessToken: string; message }> {
    const username = await this.validateUserPassword(authCredentials);
    const payload: JwtPayload = { username };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, message: 'Login success' };
  }

  async validateUserPassword(authCredentials: AuthCredentials) {
    const { username, password } = authCredentials;
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (user && (await user.validatePassword(password))) {
      return user.username;
    } else {
      throw new UnauthorizedException('email or password is wrong');
    }
  }

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }
    return {
      message: 'User Info from Google',
      user: req.user,
    };
  }
}
