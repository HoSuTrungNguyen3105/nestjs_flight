import { Controller, Get } from '@nestjs/common';
import {
  Role,
  LeaveStatus,
  UnlockStatus,
  EmployeeStatus,
  AttendanceStatus,
  PayrollStatus,
  Department,
  Position,
  Rank,
  TerminalType,
  GateStatus,
  FacilityType,
  SeatType,
  MealType,
} from 'generated/prisma';

interface ApiResponse<T> {
  resultCode: string;
  resultMessage: string;
  data: T;
}

@Controller('sys/enums')
export class EnumController {
  private success<T>(data: T): ApiResponse<T> {
    return {
      resultCode: '00',
      resultMessage: 'SUCCESS',
      data,
    };
  }

  @Get('roles')
  getRoles() {
    return this.success(Object.values(Role));
  }

  @Get('leave-statuses')
  getLeaveStatuses() {
    return this.success(Object.values(LeaveStatus));
  }

  @Get('unlock-statuses')
  getUnlockStatuses() {
    return this.success(Object.values(UnlockStatus));
  }

  @Get('employee-statuses')
  getEmployeeStatuses() {
    return this.success(Object.values(EmployeeStatus));
  }

  @Get('attendance-statuses')
  getAttendanceStatuses() {
    return this.success(Object.values(AttendanceStatus));
  }

  @Get('payroll-statuses')
  getPayrollStatuses() {
    return this.success(Object.values(PayrollStatus));
  }

  @Get('departments')
  getDepartments() {
    return this.success(Object.values(Department));
  }

  @Get('positions')
  getPositions() {
    return this.success(Object.values(Position));
  }

  @Get('ranks')
  getRanks() {
    return this.success(Object.values(Rank));
  }

  @Get('terminal-types')
  getTerminalTypes() {
    return this.success(Object.values(TerminalType));
  }

  @Get('gate-statuses')
  getGateStatuses() {
    return this.success(Object.values(GateStatus));
  }

  @Get('facility-types')
  getFacilityTypes() {
    return this.success(Object.values(FacilityType));
  }

  @Get('seat-types')
  getSeatTypes() {
    return this.success(Object.values(SeatType));
  }

  @Get('meal-types')
  getMealTypes() {
    return this.success(Object.values(MealType));
  }
}
