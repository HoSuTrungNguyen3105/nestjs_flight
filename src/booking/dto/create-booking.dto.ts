import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateFlightMealsDto } from 'src/flightMeal/dto/add-meal-to-flight.dto';
import { CreateFlightMealDto } from 'src/flightMeal/dto/create-meal.dto';

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
  flightMealId: number;

  @IsInt()
  bookingId: number;

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
