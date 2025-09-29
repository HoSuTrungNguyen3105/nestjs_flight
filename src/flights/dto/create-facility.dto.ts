import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FacilityType } from 'generated/prisma';
import { PartialType } from '@nestjs/mapped-types';

export class CreateFacilityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  type: FacilityType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  terminalId: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;
}

export class UpdateFacilityDto extends PartialType(CreateFacilityDto) {}
