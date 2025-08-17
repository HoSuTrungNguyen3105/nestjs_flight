import { IsNotEmpty, IsString } from 'class-validator';

export class AirportDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  coordinates: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;
}
