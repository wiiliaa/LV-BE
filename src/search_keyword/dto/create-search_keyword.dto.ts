import { IsNotEmpty } from 'class-validator';

export class CreateSearchKeywordDto {
  @IsNotEmpty()
  keyword: string;
}
