import { IsInt, IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateSeatDto {
  @IsInt()
  @IsNotEmpty()
  row: number;

  @IsString()
  @IsNotEmpty()
  column: string;

  @IsInt()
  @IsNotEmpty()
  flightId: number;

  @IsBoolean()
  isBooked?: boolean; // Tùy chọn, mặc định là false
}
