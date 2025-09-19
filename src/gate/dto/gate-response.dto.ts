import { GateStatus } from 'generated/prisma';
import { TerminalSimpleResponseDto } from 'src/flights/dto/create-terminal.dto';
import { FlightResponseDto } from 'src/flights/dto/flight-response.dto';
import { GateAssignmentResponseDto } from './gate-assignment-response.dto';

export class GateResponseDto {
  id: string;
  code: string;
  terminalId: string;
  terminal?: TerminalSimpleResponseDto;
  status: GateStatus;
  assignments?: GateAssignmentResponseDto[];
  currentFlight?: FlightResponseDto;
  createdAt: number;
  updatedAt: number;
}

export class GateSimpleResponseDto {
  id: string;
  code: string;
  terminalId: string;
  status: GateStatus;
  createdAt: number;
  updatedAt: number;
}
