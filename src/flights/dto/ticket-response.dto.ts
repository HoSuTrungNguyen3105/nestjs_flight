import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { FlightResponseDto } from './flight-response.dto';

export class BaggageDto {
  @IsNumber()
  id: number;

  @IsNumber()
  flightId: number;

  @IsString()
  status: string;

  @IsNumber()
  weight: number;

  @IsNumber()
  checkedAt: number;
}

export class BoardingPassDto {
  @IsNumber()
  id: number;

  @IsString()
  ticketId: number;

  @IsNumber()
  issuedAt: number | string;

  @IsNumber()
  flightId: number;

  @IsString()
  seatNo: string;

  @IsString()
  gate: string;

  @IsString()
  boardingTime: number | string;
}

export class PassengerDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  dateOfBirth: string;

  @IsString()
  nationality: string;

  @IsString()
  passportNumber: string;
}

export class TicketResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  ticketNo: string;

  @IsString() passengerId: string;

  @IsNumber() flightId: number;

  @IsString() seatClass: string;

  @IsString() seatNo: string;

  @IsNumber() bookedAt: number;

  //   @Type(() => PassengerDto)
  //   passenger?: PassengerDto;

  @Type(() => FlightResponseDto)
  flight?: FlightResponseDto | null;

  @Type(() => BoardingPassDto)
  boardingPass?: BoardingPassDto | null;

  @Type(() => BaggageDto)
  baggage?: BaggageDto[];
}
