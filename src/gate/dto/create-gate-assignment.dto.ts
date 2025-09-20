import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateGateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  gateId: string;

  @IsInt()
  @IsNotEmpty()
  flightId: number;

  @IsOptional()
  @IsNumber()
  assignedAt?: number;

  @IsOptional()
  @IsNumber()
  releasedAt?: number;

  @IsOptional()
  @IsNumber()
  createdAt?: number;

  @IsOptional()
  @IsNumber()
  updatedAt?: number;
}

export class UpdateGateAssignmentDto extends PartialType(
  CreateGateAssignmentDto,
) {
  @IsOptional()
  @IsNumber()
  updatedAt?: number;
}
