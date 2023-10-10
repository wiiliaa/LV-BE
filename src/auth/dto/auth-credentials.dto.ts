import { IsString, MinLength, IsEmail, IsOptional } from 'class-validator';

export class AuthCredentials {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email: string;
}
