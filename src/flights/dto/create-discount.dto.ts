import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsInt()
  discountAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  discountPercent?: number;

  @IsBoolean()
  isPercentage: boolean;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  usageLimit?: number;

  @IsInt()
  validFrom: number;

  @IsInt()
  validTo: number;
}
