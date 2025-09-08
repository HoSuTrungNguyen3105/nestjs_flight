import { IsString, IsOptional, Min } from 'class-validator';

export class CreateMealDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  mealType: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @Min(0)
  price?: number | null;

  @IsOptional()
  isAvailable?: boolean;
}
