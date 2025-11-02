import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  Min,
  IsInt,
} from 'class-validator';
import { FlightType } from 'generated/prisma';

export class CreateFlightDto {
  @IsNumber()
  @IsNotEmpty()
  flightId: number;

  @IsString()
  @IsNotEmpty()
  flightNo: string;

  @IsString()
  @IsNotEmpty()
  flightType: FlightType;

  @IsString()
  @IsNotEmpty()
  departureAirport: string;

  @IsString()
  @IsNotEmpty()
  arrivalAirport: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  aircraftCode: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceEconomy?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceBusiness?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceFirst?: number;

  @IsNotEmpty()
  scheduledDeparture: string;

  @IsNotEmpty()
  scheduledArrival: string;

  @IsOptional()
  @IsString()
  gateId?: string;

  // @IsOptional()
  // @IsString()
  // terminal?: string;

  @IsOptional()
  @IsBoolean()
  isDomestic?: boolean;

  @IsOptional()
  @IsBoolean()
  isCancelled?: boolean;

  @IsOptional()
  @IsInt()
  delayMinutes?: number;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @IsString()
  delayReason?: string;
}
