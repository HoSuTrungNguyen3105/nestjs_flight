import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  ticketNo: string;

  @IsString()
  passengerId: string;

  @IsNumber()
  flightId: number;

  @IsString()
  seatClass: string;

  @IsString()
  seatNo: string;

  @IsNumber()
  bookedAt: number;

  @IsOptional()
  issuedAt?: number;

  @IsOptional()
  gate?: string;

  @IsOptional()
  boardingTime?: number;

  // @IsOptional()
  // baggageWeight?: number;

  // @IsOptional()
  // baggageStatus?: string;

  // @IsOptional()
  // baggageCheckedAt?: number;
}
