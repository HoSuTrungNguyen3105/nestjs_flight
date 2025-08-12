import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateFlightDto {
  @IsString()
  flightNo: string;

  @IsDateString()
  scheduledDeparture: Date;

  @IsDateString()
  scheduledArrival: Date;

  @IsString()
  departureAirport: string;

  @IsString()
  arrivalAirport: string;

  @IsString()
  status: string;

  @IsString()
  aircraftCode: string;

  @IsOptional()
  @IsDateString()
  actualDeparture?: Date;

  @IsOptional()
  @IsDateString()
  actualArrival?: Date;
}
