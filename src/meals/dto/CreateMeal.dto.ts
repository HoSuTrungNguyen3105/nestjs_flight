import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  Min,
  IsArray,
} from 'class-validator';
import { MealType } from 'generated/prisma';

export class CreateMealDto {
  @IsString()
  mealCode: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsString()
  mealType: MealType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateMealDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsString()
  mealType: MealType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class MealOrderDto {
  @IsInt()
  @IsNotEmpty()
  mealId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateBookingDto {
  @IsInt()
  passengerId: number;

  @IsInt()
  flightId: number;

  @IsNotEmpty()
  bookingTime: number; // timestamp or decimal

  @IsOptional()
  seatId?: number;

  @IsOptional()
  @IsArray()
  @Type(() => MealOrderDto)
  mealOrders?: MealOrderDto[];
}
