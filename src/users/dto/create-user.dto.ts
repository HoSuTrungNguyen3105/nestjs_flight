import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  role: string; // USER | ADMIN

  @IsOptional()
  @IsString()
  password?: string; // truyền random ben frontend con neu frontend ko co se gán mặc định
}
