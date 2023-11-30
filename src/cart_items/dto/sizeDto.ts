import { IsInt, IsPositive, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SizeDto {
  id: number;

  sizeName: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsInt()
  version_id: number;
}
