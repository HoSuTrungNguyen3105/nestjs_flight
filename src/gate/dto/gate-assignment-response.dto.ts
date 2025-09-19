import { FlightResponseDto } from 'src/flights/dto/flight-response.dto';
import { GateResponseDto } from '../../gate/dto/gate-response.dto';

export class GateAssignmentResponseDto {
  id: string;
  gateId: string;
  gate?: GateResponseDto;
  flightId: number;
  flight?: FlightResponseDto;
  assignedAt: number;
  releasedAt: number;
  createdAt: number;
  updatedAt: number;
}
