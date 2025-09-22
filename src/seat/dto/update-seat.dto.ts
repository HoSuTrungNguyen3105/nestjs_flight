import { SeatPosition, SeatType } from 'generated/prisma';

export class UpdateSeatDto {
  type?: SeatType;
  position?: SeatPosition;
  seatRow?: string;
  seatNumber?: number;
  price?: number;
  isBooked?: boolean;
  isAvailable?: boolean;
  isExitRow?: boolean;
  isExtraLegroom?: boolean;
  note?: string;
}
