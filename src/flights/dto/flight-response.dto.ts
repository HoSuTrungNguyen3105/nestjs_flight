import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';

export class FlightResponseDto {
  flightId: number;
  flightNo: string;
  flightType: string;
  departureAirport: string;
  arrivalAirport: string;
  status: string;
  aircraftCode: string;
  priceEconomy?: number | null;
  priceBusiness?: number | null;
  priceFirst?: number | null;
  scheduledDeparture: Prisma.Decimal | null;
  scheduledArrival: Prisma.Decimal | null;
  actualDeparture?: Prisma.Decimal | null;
  actualArrival?: Prisma.Decimal | null;
  gate?: string | null;
  terminal?: string | null;
  isCancelled: boolean | null;
  delayMinutes?: number | null;
}
