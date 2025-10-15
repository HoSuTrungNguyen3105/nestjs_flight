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
  role: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  employeeNo: string;
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
