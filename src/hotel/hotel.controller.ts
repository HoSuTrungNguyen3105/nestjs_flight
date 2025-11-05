import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-multi-hotel.dto';
import { UpdateEntireHotelDto } from './dto/update-hotel.dto';

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

  @Get('find-by-hotel-code/:hotelCode')
  async getHotelByHotelCode(@Param('hotelCode') hotelCode: string) {
    return this.hotelService.getHotelByHotelCode(hotelCode);
  }

  @Get('random-code')
  async randomHotelCode() {
    return this.hotelService.randomHotelCode();
  }

  @Post('update-code/:id')
  async updateHotelCode(@Param('id') id: number, @Body('code') code: string) {
    return this.hotelService.updateHotelCode(+id, code);
  }

  @Post('update/:id')
  async updateHotelByID(
    @Param('id') id: number,
    @Body() data: UpdateEntireHotelDto,
  ) {
    return this.hotelService.updateHotelByID(+id, data);
  }
}
