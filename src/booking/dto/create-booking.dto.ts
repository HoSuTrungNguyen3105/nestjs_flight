import { IsInt, IsNotEmpty, IsArray } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  passengerId: number;

  @IsInt()
  @IsNotEmpty()
  flightId: number;

  //   @IsArray()
  //   @IsInt({ each: true })
  @IsNotEmpty()
  seatIds: number[];
}
