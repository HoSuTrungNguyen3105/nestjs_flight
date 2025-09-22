import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GateStatus } from 'generated/prisma';
import { PartialType } from '@nestjs/mapped-types';

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
  @Type(() => Number)
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
