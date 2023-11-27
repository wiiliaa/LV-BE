import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './JWT/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { CartsModule } from 'src/carts/carts.module';
import { UserAddressModule } from 'src/user_address/user_address.module';
import { GoogleStrategy } from './GG_AUTH/google.strategy';
@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: 'LuanVan2023',
      signOptions: {
        expiresIn: 360000, // one hour
      },
    }),
    TypeOrmModule.forFeature([User]),
    CartsModule,
    UserAddressModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
