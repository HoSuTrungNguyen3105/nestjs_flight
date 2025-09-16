import {
  IsString,
  IsOptional,
  IsInt,
  IsIn,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';

export class SearchFlightDto {
  @IsOptional()
  @IsString()
  flightNo?: string;
  @IsString()
  from: string; // departureAirport

  @IsString()
  to: string; // arrivalAirport

  @IsOptional()
  departDate?: number;

  @IsOptional()
  returnDate?: number;

  @IsOptional()
  @IsInt()
  passengers?: number;

  @IsOptional()
  @IsIn(['oneway', 'roundtrip'])
  flightType?: 'oneway' | 'roundtrip';

  @IsOptional()
  @IsIn(['ECONOMY', 'BUSINESS', 'VIP'])
  cabinClass?: 'ECONOMY' | 'BUSINESS' | 'VIP';

  // Thêm các field mới
  @IsOptional()
  @IsString()
  aircraftCode?: string;

  @IsOptional()
  @IsIn([
    'scheduled',
    'boarding',
    'departed',
    'arrived',
    'delayed',
    'cancelled',
  ])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  gate?: string;

  @IsOptional()
  @IsString()
  terminal?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minDelayMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxDelayMinutes?: number;

  @IsOptional()
  @IsBoolean()
  includeCancelled?: boolean;
}
