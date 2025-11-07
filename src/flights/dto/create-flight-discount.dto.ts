import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsNotEmpty } from 'class-validator';

export class FlightDiscountDto {
  id: number;
  discountCodeId: number;
  flightId: number;
  createdAt: number;
}

// src/flight-discount/dto/create-flight-discount.dto.ts
export class CreateMultiFlightDiscountDto {
  flightIds: number[]; // danh sách flightId
  discountCodeIds: number[]; // danh sách discountCodeId
}

export class CreateFlightDiscountDto {
  @IsInt()
  @IsNotEmpty()
  discountCodeId: number;

  @IsInt()
  @IsNotEmpty()
  flightId: number;
}

export class UpdateFlightDiscountDto extends PartialType(
  CreateFlightDiscountDto,
) {}
