import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EmployeeStatus } from 'generated/prisma';

export class UpdateUserFromAdminDto {
  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @IsOptional()
  @IsNumber()
  baseSalary?: number;
}
