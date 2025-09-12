import { ApiProperty } from '@nestjs/swagger';

export class FlightResponseDto {
  @ApiProperty()
  flightId: number;

  @ApiProperty()
  flightNo: string;

  @ApiProperty()
  flightType: string;

  @ApiProperty()
  departureAirport: string;

  @ApiProperty()
  arrivalAirport: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  aircraftCode: string;

  @ApiProperty({ required: false })
  priceEconomy?: number;

  @ApiProperty({ required: false })
  priceBusiness?: number;

  @ApiProperty({ required: false })
  priceFirst?: number;

  @ApiProperty({ required: false })
  maxCapacity?: number;

  @ApiProperty()
  scheduledDeparture: string;

  @ApiProperty()
  scheduledArrival: string;

  @ApiProperty({ required: false })
  actualDeparture?: string;

  @ApiProperty({ required: false })
  actualArrival?: string;

  @ApiProperty({ required: false })
  gate?: string;

  @ApiProperty({ required: false })
  terminal?: string;

  @ApiProperty()
  isCancelled: boolean;

  @ApiProperty({ required: false })
  delayMinutes?: number;

  @ApiProperty()
  createdAt: number;

  @ApiProperty()
  updatedAt: number;
}
