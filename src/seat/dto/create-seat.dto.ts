import {
  IsInt,
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateSeatDto {
  @IsInt()
  @IsNotEmpty()
  seatNumber: number;

  @IsString()
  @IsNotEmpty()
  seatRow: string;

  @IsInt()
  @IsNotEmpty()
  flightId: number;

  @IsBoolean()
  @IsOptional()
  isBooked?: boolean;
}
