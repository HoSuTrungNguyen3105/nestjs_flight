import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAttendanceDto {
  @IsInt()
  employeeId: number;

  @IsNumber()
  date: number;

  @IsNumber()
  checkIn: number;

  @IsNumber()
  @IsOptional()
  checkOut?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
