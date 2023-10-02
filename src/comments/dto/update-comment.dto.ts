import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  text?: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  rate?: number;
}
