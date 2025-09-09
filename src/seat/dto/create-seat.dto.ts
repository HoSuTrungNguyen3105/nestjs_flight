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
  seatNumber: number; // Ví dụ: 1, 2, 3...

  @IsString()
  @IsNotEmpty()
  seatRow: string; // Ví dụ: "A", "B", "C"...

  @IsInt()
  @IsNotEmpty()
  flightId: number;

  @IsBoolean()
  @IsOptional()
  isBooked?: boolean; // Mặc định false
}
