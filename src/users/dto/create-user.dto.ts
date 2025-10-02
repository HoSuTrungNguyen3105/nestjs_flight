import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

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

class EmployeeNoUpdateItem {
  userId: number;
  employeeNo: string;
}

export class BatchUpdateEmployeeNoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeNoUpdateItem)
  updates: EmployeeNoUpdateItem[];
}
