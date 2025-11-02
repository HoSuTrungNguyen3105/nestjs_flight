import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FacilityType } from 'generated/prisma';
import { PartialType } from '@nestjs/mapped-types';
import { Decimal } from 'generated/prisma/runtime/library';
import {
  CreateTerminalDto,
  TerminalDto,
} from 'src/flights/dto/create-terminal.dto';

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

export class FacilityDto {
  id: string;
  name: string;
  type: FacilityType;
  description: string | null; // ✅ đổi undefined thành null
  terminalId: string;
  location: string | null;
  openingHours: string | null;
  createdAt: number;
  updatedAt: number;

  @IsOptional()
  terminal?: TerminalDto; // 👈 thêm dòng này
}
