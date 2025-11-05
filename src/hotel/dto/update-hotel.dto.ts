import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateEntireHotelDto {
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
  updatedAt: number;
}

// export class UpdatePatchHotelDto {
//   @IsString()
//   hotelCode: string;

//   @IsNumber()
//   updatedAt: number;
// }
