export class CreateAircraftDto {
  code: string;
  model: string;
  range: number;

  imageAircraft?: string;
  manufacturer: string;
  totalSeats: number;
}

export class UpdateAircraftDto {
  model: string;
  range: number;

  imageAircraft?: string;
  manufacturer: string;
  totalSeats: number;
}
