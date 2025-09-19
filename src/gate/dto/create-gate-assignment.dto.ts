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
  @Type(() => Number)
  flightId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  assignedAt?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  releasedAt?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  createdAt?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  updatedAt?: number;
}

export class UpdateGateAssignmentDto extends PartialType(
  CreateGateAssignmentDto,
) {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  updatedAt?: number;
}
