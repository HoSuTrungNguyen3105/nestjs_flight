import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { FlightResponseDto } from './flight-response.dto';
import { EmployeeStatus, Role } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';

export class BaggageDto {
  @IsNumber()
  id: number;

  @IsNumber()
  flightId: number;

  @IsString()
  status: string;

  @IsNumber()
  weight: number;

  @IsNumber()
  checkedAt: number;
}

export class BoardingPassDto {
  @IsNumber()
  id: number;

  @IsString()
  ticketId: number;

  @IsNumber()
  issuedAt: number | string;

  @IsNumber()
  flightId: number;

  // @IsString()
  // seatNo: string;

  // @IsString()
  // gate: string;

  // @IsString()
  // boardingTime: number | string;
}

export class PassengerDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  passport: string;

  @IsOptional()
  @IsString()
  accountLockYn?: string; // default = "N"

  @IsOptional()
  @IsString()
  isEmailVerified?: string; // default = "Y"

  @IsOptional()
  lastLoginDate?: number; // Prisma Decimal -> number (timestamp or float)

  @IsOptional()
  role?: Role; // default = PASSENGER

  @IsOptional()
  @IsString()
  otpCode?: string;

  @IsOptional()
  otpExpire?: number; // Prisma Decimal -> number

  @IsOptional()
  status?: EmployeeStatus; // default = ACTIVE
}

export class TicketResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  ticketNo: string;

  @IsString() passengerId: string;

  @IsNumber() flightId: number;

  // @IsString() seatClass: string;

  // @IsString() seatNo: string;

  // @IsNumber() bookedAt: number;

  @Type(() => PassengerDto)
  passenger?: PassengerDto | null;

  @Type(() => FlightResponseDto)
  flight?: FlightResponseDto | null;

  @Type(() => BoardingPassDto)
  boardingPass?: BoardingPassDto | null;

  @Type(() => BaggageDto)
  baggage?: BaggageDto[];
}
