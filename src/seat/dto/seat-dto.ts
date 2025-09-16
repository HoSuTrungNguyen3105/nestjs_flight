export type SeatCreateInput = {
  row: number;
  column: string;
  flightId: number;
  isBooked: boolean;
};

// seat-type.dto.ts
export class SeatTypeDto {
  type: string;
  count: number;
}

export class SeatTypesResponseDto {
  resultCode: string;
  resultMessage: string;
  data?: SeatTypeDto[];
  error?: string;
}
