// import { IsDateString, IsOptional, IsString } from 'class-validator';

// export class CreateFlightDto {
//   @IsString()
//   flightNo: string;

//   @IsDateString()
//   scheduledDeparture: Date;

//   @IsDateString()
//   scheduledArrival: Date;

//   @IsString()
//   departureAirport: string;

//   @IsString()
//   arrivalAirport: string;

//   @IsString()
//   status: string;

//   @IsString()
//   aircraftCode: string;

//   @IsOptional()
//   @IsDateString()
//   actualDeparture?: Date;

//   @IsOptional()
//   @IsDateString()
//   actualArrival?: Date;
// }
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class CreateFlightDto {
  @IsString()
  flightNo: string;

  @IsString()
  flightType: 'oneway' | 'roundtrip';

  @IsString()
  departureAirport: string;

  @IsString()
  arrivalAirport: string;

  @IsString()
  status: string;

  @IsString()
  aircraftCode: string;

  @IsNumber()
  scheduledDeparture: number; // timestamp in ms

  @IsNumber()
  scheduledArrival: number; // timestamp in ms

  @IsOptional()
  @IsNumber()
  actualDeparture?: number;

  @IsOptional()
  @IsNumber()
  actualArrival?: number;

  @IsOptional()
  @IsNumber()
  priceEconomy?: number;

  @IsOptional()
  @IsNumber()
  priceBusiness?: number;

  @IsOptional()
  @IsNumber()
  priceFirst?: number;

  @IsOptional()
  @IsNumber()
  maxCapacity?: number;

  @IsOptional()
  @IsString()
  gate?: string;

  @IsOptional()
  @IsString()
  terminal?: string;

  @IsOptional()
  @IsBoolean()
  isCancelled?: boolean;

  @IsOptional()
  @IsNumber()
  delayMinutes?: number;
}
