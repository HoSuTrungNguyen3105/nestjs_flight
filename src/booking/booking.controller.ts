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
import { SearchBookingDto } from './dto/search-booking.dto';
import { CreateBaggageDto } from './dto/baggage.dto';

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

  @Get('findAllPassenger')
  findAllPassenger() {
    return this.bookingService.findAllPassenger();
  }

  @Post('findPassengerById')
  findPassengerById(@Body('id') id: string) {
    return this.bookingService.findPassengerById(id);
  }

  @Get('findAllBooking')
  findAll() {
    return this.bookingService.findAll();
  }

  @Post()
  createBaggage(@Body() dto: CreateBaggageDto) {
    return this.bookingService.createBaggage(dto);
  }

  @Get('baggage')
  findAllBaggage() {
    return this.bookingService.findAllBaggage();
  }

  @Get('baggage/:id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOneBaggage(+id);
  }

  @Post('search')
  async search(@Body() dto: SearchBookingDto) {
    return this.bookingService.searchBooking(dto);
  }

  @Post()
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.bookSeats(createBookingDto);
  }

  @Post('deleteBooking')
  async deleteBooking(@Body() id: number) {
    return this.bookingService.deleteBooking(id);
  }

  @Get('flight/:flightId/seats')
  async getFlightSeats(@Param('flightId', ParseIntPipe) flightId: number) {
    return this.bookingService.getFlightSeats(flightId);
  }
}
