import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  MinLength,
  Min,
} from 'class-validator';

export class CreateMealDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  mealType: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
