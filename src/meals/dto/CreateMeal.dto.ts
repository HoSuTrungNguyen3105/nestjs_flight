// dto/create-meal.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMealDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  category?: string;
}
