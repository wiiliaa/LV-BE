import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { AuthCredentials } from './dto/auth-credentials.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './JWT/jwt-payload.interface';
import { CartsService } from 'src/carts/carts.service';
import { UserAddressService } from 'src/user_address/user_address.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly cartService: CartsService,
    private readonly userAddressService: UserAddressService,
  ) { }
  async signUp(createUserDto: CreateUserDto) {
    const { username, password, name, email } = createUserDto;
    const user = new User();
    user.username = username;
    user.password = password;
    user.email = email;
<<<<<<< HEAD
    user.name = name || username;
=======
    user.name = username;
>>>>>>> 8dc10ca1a6490b99384654e518f099659cc4de85

    await user.save();

    const emptyUserAddress = {
      country: '',
      city: '',
      detail_address: '',
      user_id: user.id,
    };
    await this.userAddressService.create(emptyUserAddress);

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
