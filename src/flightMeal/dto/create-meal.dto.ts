import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateFlightMealDto {
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
