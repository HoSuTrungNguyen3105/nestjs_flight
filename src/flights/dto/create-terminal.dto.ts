import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { TerminalType } from 'generated/prisma';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTerminalDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TerminalType)
  @IsNotEmpty()
  type: TerminalType;

  @IsString()
  @IsNotEmpty()
  airportId: string;

  @IsOptional()
  @IsNumber()
  createdAt?: number;

  @IsOptional()
  @IsNumber()
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
