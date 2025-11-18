import { IsArray } from 'class-validator';

export class CreateFlightMealsDto {
  @IsArray()
  meals: {
    id: number;
    quantity: number;
    price?: number;
  }[];
}
