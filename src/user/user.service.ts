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
import * as fs from 'fs';
import { ImageService } from 'src/image/image.service';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private imageService: ImageService,
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

    // Duyệt qua từng người dùng và thêm thông tin ảnh nếu có
    const usersWithImages: User[] = await Promise.all(
      users.map(async (user) => {
        // Lấy thông tin ảnh từ imageService
        if (user.avatar) {
          const avatar = await this.imageService.getImage(user.avatar);

          // Tạo một đối tượng mới chỉ với thông tin ảnh được thêm vào
          return {
            ...user,
            avatar,
          } as User;
        } else {
          // Nếu không có ảnh, trả về người dùng với avatar là null
          return {
            ...user,
            avatar: null,
          } as User;
        }
      }),
    );

    return usersWithImages;
  }

  async find(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();

    // Duyệt qua từng người dùng và thêm thông tin ảnh nếu có
    const usersWithImages: (User | null)[] = await Promise.all(
      users.map(async (user) => {
        // Lấy thông tin ảnh từ imageService
        if (user.avatar) {
          const avatar = await this.imageService.getImage(user.avatar);

          // Tạo một đối tượng mới chỉ với thông tin ảnh được thêm vào
          return {
            ...user,
            avatar,
          } as User;
        } else {
          // Nếu không có ảnh, trả về người dùng với avatar là null
          return {
            ...user,
            avatar: null,
          } as User;
        }
      }),
    );

    // Lọc ra những người dùng không có hình (null) và trả về danh sách
    return usersWithImages.filter((user) => user !== null) as User[];
  }

  async findById(id: number) {
    const res = await this.userRepository.findOne({ where: { id } });
    const image = await this.imageService.getImage(res.avatar);
    return { ...res, avatar: image };
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const unlinkAsync = promisify(fs.unlink);

    try {
      const userToDelete = await this.userRepository.findOne({
        where: { id },
      });

      if (!userToDelete) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      // Kiểm tra xem người dùng có hình ảnh không
      if (userToDelete.avatar) {
        // Xác định đường dẫn tuyệt đối của hình ảnh
        const imagePath = join('public/uploads/', userToDelete.avatar);

        // Nếu file tồn tại, xóa nó
        if (fs.existsSync(imagePath)) {
          await unlinkAsync(imagePath);
        }
      }

      // Xóa người dùng từ cơ sở dữ liệu
      const deleteResult = await this.userRepository.delete(id);

      if (deleteResult.affected && deleteResult.affected > 0) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      throw new InternalServerErrorException('Lỗi khi xóa người dùng');
    }
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
          const oldImagePath = join('/public/uploads/', userToUpdate.avatar);

          // Nếu file cũ tồn tại, xóa nó đi
          if (existsSync(oldImagePath)) {
            await unlinkAsync(oldImagePath);
          }
        }
        const fileName = `${userToUpdate.username}-avatar.txt`;
        const filePath = join('public/uploads/', fileName);

        // Lưu ảnh mới vào tệp văn bản
        await writeFileAsync(filePath, updateUserDto.avatar);
        updateUserDto.avatar = fileName;
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
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error);
      throw new InternalServerErrorException('Lỗi khi cập nhật người dùng');
    }
  }
}
