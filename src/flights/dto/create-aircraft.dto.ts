export class CreateAircraftDto {
  code: string;
  model: string;
  range: number;
}

export class UpdateAircraftDto {
  model: string;
  range: number;
}
