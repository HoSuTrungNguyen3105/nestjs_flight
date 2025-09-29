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
}

export class UpdateGateAssignmentDto extends PartialType(
  CreateGateAssignmentDto,
) {
  @IsOptional()
  @IsNumber()
  updatedAt?: number;
}
