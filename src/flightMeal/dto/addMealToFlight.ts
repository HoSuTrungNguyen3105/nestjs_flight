import { IsArray } from 'class-validator';

export class CreateFlightMealsDto {
  @IsArray()
  meals: {
    id: number; // mealId
    quantity: number; // số lượng
    price?: number; // giá
  }[];
}
