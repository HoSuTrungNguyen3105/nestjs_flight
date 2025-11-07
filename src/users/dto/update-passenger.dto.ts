import {
  IsEmail,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { EmployeeStatus, Role } from 'generated/prisma';

export class UpdatePassengerDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  //   @IsOptional()
  //   @IsString()
  //   password?: string;

  //   @IsOptional()
  //   @IsEmail()
  //   email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  passport?: string;

  //   @IsOptional()
  //   @IsString()
  //   accountLockYn?: string; // "Y" hoặc "N"

  //   @IsOptional()
  //   @IsString()
  //   isEmailVerified?: string; // "Y" hoặc "N"

  //   @IsOptional()
  //   @IsEnum(Role)
  //   role?: Role;

  //   @IsOptional()
  //   @IsString()
  //   otpCode?: string;

  //   @IsOptional()
  //   @IsNumber()
  //   otpExpire?: number; // Prisma Decimal -> number

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @IsOptional()
  @IsNumber()
  lastLoginDate?: number; // Prisma Decimal -> number
}
