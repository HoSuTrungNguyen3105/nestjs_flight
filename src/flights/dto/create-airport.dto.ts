import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
  IsNumber,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class AirportDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 10, { message: 'Mã sân bay phải từ 3 đến 10 ký tự' })
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  coordinates?: string;

  @IsOptional()
  @IsNumber()
  createdAt?: number;

  @IsOptional()
  @IsNumber()
  updatedAt?: number;
}

export class UpdateAirportDto extends PartialType(AirportDto) {
  @IsOptional()
  @IsNumber()
  updatedAt?: number;
}
