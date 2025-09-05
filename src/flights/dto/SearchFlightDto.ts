import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';

export class SearchFlightDto {
  @IsString()
  from: string; // departureAirport

  @IsString()
  to: string; // arrivalAirport

  @IsOptional()
  departDate?: number; // ISO string hoặc yyyy-MM-dd

  @IsOptional()
  returnDate?: number;

  @IsOptional()
  @IsInt()
  passengers?: number;

  @IsOptional()
  @IsIn(['oneway', 'roundtrip'])
  flightType?: 'oneway' | 'roundtrip';

  @IsOptional()
  @IsIn(['economy', 'business', 'first'])
  cabinClass?: 'economy' | 'business' | 'first';
}
