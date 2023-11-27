import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProductCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  image: string;
}
