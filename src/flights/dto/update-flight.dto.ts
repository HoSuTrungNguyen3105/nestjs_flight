import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDecimal,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class UpdateFlightDto {
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

  //   @IsDecimal()
  //   @IsNotEmpty()
  //   scheduledDeparture: string;

  //   @IsDecimal()
  //   @IsNotEmpty()
  //   scheduledArrival: string;

  @IsOptional()
  @IsDecimal()
  actualDeparture?: string;

  @IsOptional()
  @IsDecimal()
  actualArrival?: string;

  @IsString()
  airline: string;

  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsOptional()
  @IsString()
  gateId?: string;

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

  @IsString()
  cancellationReason?: string;

  @IsString()
  delayReason?: string;
}
