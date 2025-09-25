import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GateStatus, TerminalType } from 'generated/prisma';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTerminalDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TerminalType)
  type: TerminalType;

  @IsString()
  airportId: string;
}

export class CreateGateDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  terminalId: string;

  @IsOptional()
  @IsEnum(GateStatus)
  status?: GateStatus;
}

export class UpdateGateDto extends PartialType(CreateGateDto) {
  @IsOptional()
  @IsNumber()
  updatedAt?: number;

  @IsOptional()
  @IsEnum(GateStatus)
  status?: GateStatus;
}

export class GateQueryDto {
  @IsOptional()
  @IsEnum(GateStatus)
  status?: GateStatus;

  @IsOptional()
  @IsString()
  terminalId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}

export class CreateGateAssignmentDto {
  @IsString()
  gateId: string;

  @IsInt()
  flightId: number;
}
