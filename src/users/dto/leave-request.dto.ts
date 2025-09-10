import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
} from 'class-validator';

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  UNPAID = 'UNPAID',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateLeaveRequestDto {
  @IsNumber()
  @IsPositive()
  employeeId: number;

  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @IsNumber()
  @IsPositive()
  startDate: number;

  @IsNumber()
  @IsPositive()
  endDate: number;

  @IsNumber()
  @IsPositive()
  days: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateLeaveRequestDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @IsNumber()
  @IsOptional()
  approverId?: number;

  @IsString()
  @IsOptional()
  approverNote?: string;
}

export class LeaveRequestResponseDto {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: LeaveType;
  startDate: number;
  endDate: number;
  days: number;
  reason: string;
  status: LeaveStatus;
  approverId: number;
  approverName: string;
  approverNote: string;
  appliedAt: number;
  decidedAt: number;
}
