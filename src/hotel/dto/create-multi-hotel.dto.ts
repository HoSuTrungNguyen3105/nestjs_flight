import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  name: string;

  @IsString()
  hotelCode: string;

  @IsString()
  city: string;

  @IsString()
  address: string;

  @IsNumber()
  rating: number;

  @IsString()
  imageUrl: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @IsOptional()
  @IsBoolean()
  isPrime?: boolean;

  @IsOptional()
  @IsBoolean()
  freeWifi?: boolean;

  @IsOptional()
  @IsBoolean()
  covidMeasures?: boolean;

  @IsOptional()
  @IsBoolean()
  freeCancel?: boolean;

  @IsOptional()
  @IsNumber()
  rooms?: number;

  @IsOptional()
  @IsNumber()
  distanceToCenter: number;

  @IsNumber()
  createdAt: number;

  @IsNumber()
  updatedAt: number;
}
