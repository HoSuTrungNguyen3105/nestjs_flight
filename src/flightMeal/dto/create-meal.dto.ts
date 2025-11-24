import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateFlightMealDto {
  @IsString()
  flightMealCode: string;

  @IsInt()
  flightId: number;

  @IsInt()
  mealId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  price?: number;
}
