import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  passengerId: string;

  @IsInt()
  @IsNotEmpty()
  flightId: number;

  @IsString()
  bookingCode: string;

  @IsNotEmpty()
  seatId: number;

  @IsString()
  seatNo: string;

  @IsString()
  seatClass: string;

  @IsInt()
  seatPrice?: number;

  @IsNumber()
  bookingTime: number; // timestamp (ms)

  @IsOptional()
  @IsString()
  discountCode?: string;

  @IsOptional()
  @Type(() => MealOrderDto)
  mealOrders?: MealOrderDto[];
}

export class MealOrderDto {
  @IsInt()
  mealId: number;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsNumber()
  price?: number;
}

export class CreatePassengerPseudoDto {
  @IsString()
  fullName: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  passport: string;
}
