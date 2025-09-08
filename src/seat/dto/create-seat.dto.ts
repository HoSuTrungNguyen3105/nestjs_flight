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
  row: number;

  @IsOptional()
  @IsString()
  column?: string; // tạo 1 ghế riêng

  @IsOptional()
  @IsInt()
  startRow?: number; // tạo nhiều hàng từ startRow

  @IsOptional()
  @IsInt()
  endRow?: number; // tới endRow

  @IsInt()
  @IsNotEmpty()
  flightId: number;

  @IsBoolean()
  isBooked?: boolean; // Tùy chọn, mặc định là false
}
