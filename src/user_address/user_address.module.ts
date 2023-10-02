import { Module } from '@nestjs/common';
import { UserAddressService } from './user_address.service';
import { UserAddressController } from './user_address.controller';
import { UserAddress } from './entities/user_address.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [UserAddressController],
  providers: [UserAddressService],
  imports: [TypeOrmModule.forFeature([UserAddress])],
  exports: [UserAddressService],
})
export class UserAddressModule {}
