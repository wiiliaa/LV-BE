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

  async saveBase64Avatar(user: User, base64Image: string): Promise<void> {
    const userId = user.id as number;
    const userToSave = await this.findById(userId);

    if (userToSave) {
      // Giải mã base64 thành dữ liệu nhị phân
      const imageBuffer = Buffer.from(base64Image, 'base64');

      // Lưu dữ liệu nhị phân vào trường avatar
      user.avatar = imageBuffer.toString('binary');

      // Lưu thông tin người dùng với ảnh avatar mới
      await user.save();
    }
  }

  async getBase64Avatar(user: User): Promise<string | null> {
    const userId = user.id as number;
    const userToGet = await this.findById(userId);

    if (userToGet && user.avatar) {
      // Chuyển đổi dữ liệu nhị phân thành base64
      return Buffer.from(user.avatar, 'binary').toString('base64');
    }

    return null;
  }
}
