import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ImageModule } from 'src/image/image.module';
import { ShopsModule } from 'src/shops/shops.module';
import { Shop } from 'src/shops/entities/shop.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User, Shop]), ImageModule],
  exports: [UserService],
})
export class UserModule {}
