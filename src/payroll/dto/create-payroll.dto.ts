import { IsInt, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PayrollStatus } from 'generated/prisma';

export class CreatePayrollDto {
  @IsInt()
  employeeId: number;

  @IsInt()
  month: number;

  @IsInt()
  year: number;

  @IsNumber()
  baseSalary: number;

  @IsOptional()
  @IsNumber()
  allowances?: number;

  @IsOptional()
  @IsNumber()
  deductions?: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;
}

export type FindPayrollWhere = {
  employeeId: number;
  month?: number;
  year?: number;
};
