import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
  IsNumber,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateAirportDto {
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
}

export class UpdateAirportDto extends PartialType(CreateAirportDto) {
  @IsOptional()
  @IsNumber()
  updatedAt?: number;
}
