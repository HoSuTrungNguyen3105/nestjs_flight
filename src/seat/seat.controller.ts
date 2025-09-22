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
  Query,
} from '@nestjs/common';
import { SeatService } from './seat.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { SeatType } from 'generated/prisma';
import { SeatTypesResponseDto } from './dto/seat-dto';

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

  @Post('updateSeatsByIds')
  async updateSeat(
    @Body()
    body: {
      seatIds: number;
      data: UpdateSeatDto;
    },
  ) {
    return this.seatService.updateSeat(body.seatIds, body.data);
  }

  @Post('updateMultipleSeatsByIds')
  async updateMultipleSeatsWithBody(
    @Body()
    body: {
      seatIds: number[];
      data: UpdateSeatDto;
    },
  ) {
    return this.seatService.updateMultipleSeats(body.seatIds, body.data);
  }

  @Post('flight/:flightId')
  async deleteAllSeats(@Param('flightId') flightId: number) {
    return this.seatService.deleteAllByFlight(Number(flightId));
  }

  @Delete('delete-all')
  async deleteAll() {
    await this.seatService.deleteAllSeats();
  }

  @Get()
  async getAllSeatTypes(): Promise<SeatTypesResponseDto> {
    return this.seatService.getAllSeatTypes();
  }

  @Get('flight/:flightId')
  async getSeatTypesByFlight(
    @Param('flightId') flightId: string,
  ): Promise<SeatTypesResponseDto> {
    return this.seatService.getSeatTypesByFlight(parseInt(flightId));
  }

  @Get('available')
  async getAvailableSeatTypes(
    @Query('flightId') flightId?: string,
  ): Promise<SeatTypesResponseDto> {
    return this.seatService.getAvailableSeatTypes(
      flightId ? parseInt(flightId) : undefined,
    );
  }

  @Get('distinct')
  async getDistinctSeatTypes(): Promise<{
    resultCode: string;
    resultMessage: string;
    data: string[];
  }> {
    return this.seatService.getDistinctSeatTypes();
  }
}
