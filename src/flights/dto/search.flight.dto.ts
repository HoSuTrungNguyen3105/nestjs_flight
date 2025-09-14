import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';

export class SearchFlightDto {
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
  @IsIn(['ECONOMY', 'BUSINESS', 'VIP']) // hoặc ['economy', 'business', 'first'] VIP
  cabinClass?: 'ECONOMY' | 'BUSINESS' | 'VIP';
}
