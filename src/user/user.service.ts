import { Injectable, NotFoundException, Req } from '@nestjs/common';
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

  async getCustomers(): Promise<User[]> {
    return this.findByRole('customer');
  }

  async getSeller(): Promise<User[]> {
    return this.findByRole('seller');
  }

  async getPending(): Promise<User[]> {
    return this.findByRole('pending');
  }

  async findByRole(role: string): Promise<User[]> {
    const users = await User.find({ where: { role } });
    return users;
  }

  async find() {
    return this.userRepository.find();
  }

  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    let status = true;
    const target = await this.userRepository.delete(id);
    if (!target) {
      status = false;
    }
    return { status };
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

  // async updateAvatar(user: User, avatar: string) {
  //   const userId = user.id;

  //   // Create a condition to update the user with the specified userId
  //   const condition = { id: userId };
  //   return await this.userRepository.update(condition, { avatar });
  // }
  async saveBase64Avatar(user: User, Image: string) {
    const userToSave = await this.userRepository.findOne({
      where: { id: user.id },
    });

    userToSave.avatar = Image;

    // Lưu thông tin người dùng với ảnh avatar mới
    await userToSave.save();
  }
}
