import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
export class UpdateUserDto {
  @IsOptional()
  password: string;

  @IsOptional()
  name: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  seller: boolean;

  @IsOptional()
  avatar: string;
}
