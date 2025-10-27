import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FacilityType } from 'generated/prisma';
import { PartialType } from '@nestjs/mapped-types';
import { Decimal } from 'generated/prisma/runtime/library';

export class FlightStatusDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsInt()
  @IsNotEmpty()
  flightId: number;

  @IsOptional()
  @IsString()
  status?: string; // ví dụ: "SCHEDULED", "DELAYED", "CANCELLED", ...

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  updatedAt?: Decimal;
}
