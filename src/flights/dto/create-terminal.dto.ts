import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { TerminalType } from 'generated/prisma';
import { PartialType } from '@nestjs/mapped-types';
import { Decimal } from 'generated/prisma/runtime/library';

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

export class TerminalDto {
  id: string;
  name: string;
  type: TerminalType;
  description: string | null;
  code: string;
  airportId: string;
  createdAt?: number;
  updatedAt?: number;
}

export class UpdateTerminalDto extends PartialType(CreateTerminalDto) {
  @IsOptional()
  @IsNumber()
  updatedAt?: number;

  @IsOptional()
  @IsEnum(TerminalType)
  type?: TerminalType;
}

// export class TerminalResponseDto {
//   id: string;
//   code: string;
//   name: string;
//   description?: string;
//   type: TerminalType;
//   airportId: string;
//   airport?: AirportDto;
//   gates?: [];
//   facilities?: FacilityResponseDto[];
//   createdAt: number;
//   updatedAt: number;
// }

export class TerminalSimpleResponseDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: TerminalType;
  airportId: string;
  createdAt: number;
  updatedAt: number;
}
