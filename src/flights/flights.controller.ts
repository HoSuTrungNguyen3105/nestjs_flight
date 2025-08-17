import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { Aircraft, Airport, Flight } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { AirportDto } from './dto/create-airport.dto';

@Controller('sys/flights')
export class FlightsController {
  constructor(private readonly flightService: FlightsService) {}

  @Post()
  create(@Body() data: Omit<Flight, 'flightId'>) {
    return this.flightService.create(data);
  }

  @Post('/aircraft')
  createAircraft(@Body() data: Aircraft) {
    return this.flightService.createAircraft(data);
  }

  @Get()
  async findAll(): Promise<BaseResponseDto<Flight>> {
    return this.flightService.findAll();
  }

  @Get(':flightId')
  findOne(@Param('flightId') id: string) {
    return this.flightService.findOne(+id);
  }

  @Patch(':flightId')
  update(@Param('flightId') id: string, @Body() data: Partial<Flight>) {
    return this.flightService.update(+id, data);
  }

  @Delete(':flightId')
  remove(@Param('flightId') id: string) {
    return this.flightService.delete(+id);
  }
  @Delete('all')
  async deleteAllFlights() {
    return this.flightService.deleteAll();
  }

  @Get('aircraft')
  async getAircraft() {
    return this.flightService.getAllAircraft();
  }

  // 2. GET all airports
  @Get('airports')
  async getAirports() {
    return this.flightService.getAllAirports();
  }

  // 3. POST create new airport
  // flights.controller.ts
  @Post('airports')
  async createAirport(@Body() body: AirportDto) {
    console.log('👉 REQ BODY /flights/airports:', body);
    return this.flightService.createAirport(body);
  }
}
