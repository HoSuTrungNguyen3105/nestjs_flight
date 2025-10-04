import { IsInt, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateBaggageDto {
  @IsInt()
  flightId: number;

  @IsNumber()
  weight: number;

  @IsString()
  status: string;

  @IsNumber()
  checkedAt: number;

  @IsInt()
  ticketId: number;
}
