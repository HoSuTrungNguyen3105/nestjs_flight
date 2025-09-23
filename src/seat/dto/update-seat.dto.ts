import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SeatType } from 'generated/prisma';

export class UpdateSeatDto {
  @IsOptional()
  @IsInt()
  seatNumber?: number;

  @IsOptional()
  @IsString()
  seatRow?: string;

  @IsOptional()
  @IsEnum(SeatType)
  type?: SeatType;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isBooked?: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  isExtraLegroom?: boolean;

  @IsOptional()
  @IsBoolean()
  isExitRow?: boolean;

  @IsOptional()
  @IsBoolean()
  isHandicapAccessible?: boolean;

  @IsOptional()
  @IsBoolean()
  isNearLavatory?: boolean;

  @IsOptional()
  @IsBoolean()
  isUpperDeck?: boolean;

  @IsOptional()
  @IsBoolean()
  isWing?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}
