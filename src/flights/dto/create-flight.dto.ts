import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDecimal,
  IsNotEmpty,
  Min,
  IsPositive,
} from 'class-validator';

export class CreateFlightDto {
  @IsNumber()
  @IsNotEmpty()
  flightId: number;

  @IsString()
  @IsNotEmpty()
  flightNo: string;

  @IsString()
  @IsNotEmpty()
  flightType: string;

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

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxCapacity?: number;

  @IsDecimal()
  @IsNotEmpty()
  scheduledDeparture: string;

  @IsDecimal()
  @IsNotEmpty()
  scheduledArrival: string;

  @IsOptional()
  @IsDecimal()
  actualDeparture?: string;

  @IsOptional()
  @IsDecimal()
  actualArrival?: string;

  @IsOptional()
  @IsString()
  gate?: string;

  @IsOptional()
  @IsString()
  terminal?: string;

  @IsOptional()
  @IsBoolean()
  isCancelled: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  delayMinutes?: number;
}
