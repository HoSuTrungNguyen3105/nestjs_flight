import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import {
  CreateBookingDto,
  CreatePassengerPseudoDto,
} from './dto/create-booking.dto';

@Controller('sys/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('passenger/create-many')
  async createPseudoPassenger(@Body() body: CreatePassengerPseudoDto[]) {
    return this.bookingService.createPseudoPassengers(body);
  }
  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingService.create(dto);
  }

  @Post()
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.bookSeats(createBookingDto);
  }

  @Get('flight/:flightId/seats')
  async getFlightSeats(@Param('flightId', ParseIntPipe) flightId: number) {
    return this.bookingService.getFlightSeats(flightId);
  }
}
