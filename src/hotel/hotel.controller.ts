import { Body, Controller, Get, Post } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-multi-hotel.dto';

@Controller('sys/hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post('bulk')
  async createMany(@Body() data: CreateHotelDto[]) {
    return this.hotelService.createManyHotels(data);
  }

  @Get()
  async getAll() {
    return this.hotelService.getAllHotels();
  }

  @Get('random-code')
  async randomHotelCode() {
    return this.hotelService.randomHotelCode();
  }
}
