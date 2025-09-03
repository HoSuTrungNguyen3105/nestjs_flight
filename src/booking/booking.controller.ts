import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('sys/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.bookSeats(createBookingDto);
  }

  @Get('flight/:flightId/seats')
  async getFlightSeats(@Param('flightId', ParseIntPipe) flightId: number) {
    return this.bookingService.getFlightSeats(flightId);
  }
}
