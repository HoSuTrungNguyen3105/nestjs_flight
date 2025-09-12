import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SeatService } from './seat.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { SeatType } from 'generated/prisma';

@Controller('sys/seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Post()
  async create(@Body() createSeatDto: CreateSeatDto) {
    return this.seatService.create(createSeatDto);
  }
  @Get()
  async findAll() {
    return this.seatService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.seatService.findOne(id);
  }

  @Get('getFlightSeat/:id')
  async getFlightSeat(@Param('id', ParseIntPipe) id: number) {
    return this.seatService.findAllByFlightId(id);
  }

  @Post('updateMultipleSeatsByIds')
  async updateMultipleSeatsWithBody(
    @Body()
    body: {
      seatIds: number[];
      type?: SeatType;
      seatRow?: string;
      seatNumber?: number;
    },
  ) {
    return this.seatService.updateMultipleSeats(body.seatIds, {
      type: body.type,
      seatRow: body.seatRow,
      seatNumber: body.seatNumber,
    });
  }

  @Post('flight/:flightId')
  async deleteAllSeats(@Param('flightId') flightId: number) {
    return this.seatService.deleteAllByFlight(Number(flightId));
  }

  @Post('delete-all')
  async deleteAll() {
    await this.seatService.deleteAllSeats();
  }
}
