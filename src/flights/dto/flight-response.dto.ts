import { Prisma } from 'generated/prisma';
import { FlightStatusDto } from './flight-status.dto';

export class FlightResponseDto {
  flightId: number;
  flightNo: string;
  flightType: string;
  departureAirport: string;
  arrivalAirport: string;
  aircraftCode: string;
  priceEconomy?: number | null;
  priceBusiness?: number | null;
  priceFirst?: number | null;
  scheduledDeparture: Prisma.Decimal | null;
  scheduledArrival: Prisma.Decimal | null;
  actualDeparture?: Prisma.Decimal | null;
  actualArrival?: Prisma.Decimal | null;
  gate?: string | null;
  // terminal?: string | null;
  isDomestic: boolean | null;
  isCancelled: boolean | null;
  delayMinutes?: number | null;
  flightStatuses?: FlightStatusDto[];
}
