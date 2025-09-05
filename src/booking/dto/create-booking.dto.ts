import { IsInt, IsNotEmpty, IsArray, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  passengerId: number;

  @IsInt()
  @IsNotEmpty()
  flightId: number;

  @IsArray()
  @IsNumber({}, { each: true }) // tất cả phần tử phải là number
  @IsNotEmpty()
  seatIds: number[];
}
