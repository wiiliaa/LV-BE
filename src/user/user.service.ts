import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-uset.dto';
import * as bcrypt from 'bcrypt';
import { join } from 'path';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
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
    const existsSync = fs.existsSync;
    const unlinkAsync = promisify(fs.unlink);
    const writeFileAsync = promisify(fs.writeFile);

    try {
      const userToUpdate = await this.userRepository.findOne({
        where: { id: user.id },
      });

      if (!userToUpdate) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      // Nếu có ảnh mới được cung cấp trong DTO, thực hiện cập nhật
      if (updateUserDto.avatar) {
        // Kiểm tra xem có ảnh cũ không
        if (userToUpdate.avatar) {
          const oldImagePath = join('src/public/uploads/', userToUpdate.avatar);

          // Nếu file cũ tồn tại, xóa nó đi
          if (existsSync(oldImagePath)) {
            await unlinkAsync(oldImagePath);
          }
        }

        // Tạo đường dẫn và tên file cho ảnh mới
        const fileName = `${userToUpdate.username}-avatar.txt`;
        const filePath = join('src/public/userAvatar/', fileName);

        // Lưu ảnh mới vào tệp văn bản
        await writeFileAsync(filePath, updateUserDto.avatar);

        // Lưu đường dẫn tệp vào trường avatar của người dùng
        updateUserDto.avatar = fileName;
      }

      // Thực hiện cập nhật thông tin người dùng
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
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error);
      throw new InternalServerErrorException('Lỗi khi cập nhật người dùng');
    }
  }
}
