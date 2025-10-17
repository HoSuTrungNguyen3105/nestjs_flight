import { IsOptional, IsString, IsNumber, IsUrl, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMyInfoDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  userAlias?: string;

  @IsOptional()
  @IsString()
  //   @IsPhoneNumber(null)
  phone?: string;

  @IsOptional()
  @IsUrl()
  pictureUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  baseSalary?: number;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  employeeNo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  hireDate?: number;
}
