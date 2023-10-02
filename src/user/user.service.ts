import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-uset.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async find() {
    return this.userRepository.find();
  }

  async findById(id: number) {
    return this.userRepository.find({ where: { id } });
  }

  async delete(id: number) {
    let status = true;
    const target = await this.userRepository.delete(id);
    if (!target) {
      status = false;
    }
    return { status };
  }

  async updateUserToSeller(user: User): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with id ${user.id} not found.`);
    }
    existingUser.seller = true;
    await this.userRepository.save(existingUser);

    return existingUser;
  }

  async update(
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean }> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updateResult = await this.userRepository
      .createQueryBuilder('user')
      .update(User)
      .set(updateUserDto)
      .where('id = :id', { id: user.id })
      .execute();

    if (updateResult.affected && updateResult.affected > 0) {
      return { success: true };
    } else {
      return { success: false };
    }
  }
}
