import { IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateSearchKeywordDto {
  @IsOptional()
  @IsNotEmpty()
  keyword: string;
}
