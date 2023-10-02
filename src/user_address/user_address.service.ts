// user-address.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddress } from './entities/user_address.entity';
import { CreateUserAddressDto } from './dto/create-user_address.dto';
import { UpdateUserAddressDto } from './dto/update-user_address.dto';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectRepository(UserAddress)
    private readonly userAddressRepository: Repository<UserAddress>,
  ) {}

  async create(
    createUserAddressDto: CreateUserAddressDto,
  ): Promise<UserAddress> {
    const userAddress = this.userAddressRepository.create(createUserAddressDto);
    return await this.userAddressRepository.save(userAddress);
  }

  async update(
    id: number,
    updateUserAddressDto: UpdateUserAddressDto,
  ): Promise<UserAddress> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { id },
    });
    if (!userAddress) {
      throw new NotFoundException(`User address with id ${id} not found.`);
    }

    this.userAddressRepository.merge(userAddress, updateUserAddressDto);

    return await this.userAddressRepository.save(userAddress);
  }

  async findOne(id: number): Promise<UserAddress> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { id },
    });
    if (!userAddress) {
      throw new NotFoundException(`User address with id ${id} not found.`);
    }
    return userAddress;
  }

  async remove(id: number): Promise<void> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { id },
    });
    if (!userAddress) {
      throw new NotFoundException(`User address with id ${id} not found.`);
    }
    await this.userAddressRepository.remove(userAddress);
  }
}
