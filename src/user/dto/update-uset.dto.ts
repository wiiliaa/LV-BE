import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  seller: boolean;
}
