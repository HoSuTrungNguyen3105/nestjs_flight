import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { Aircraft, Airport, Flight } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { AirportDto } from './dto/create-airport.dto';
import { SearchFlightDto } from './dto/SearchFlightDto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateFlightDto } from './dto/create-flight.dto';
// import { ApiOperation } from '@nestjs/swagger';

@Controller('sys/flights')
export class FlightsController {
  constructor(private readonly flightService: FlightsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // @ApiOperation({ summary: 'Create a new flight' })
  create(@Body() data: CreateFlightDto) {
    return this.flightService.create(data);
  }

  @Post('aircraft')
  createAircraft(@Body() data: Aircraft) {
    return this.flightService.createAircraft(data);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(): Promise<BaseResponseDto<Flight>> {
    return this.flightService.findAll();
  }

  @Get('getFlight/:id')
  findOne(@Param('id') id: number) {
    return this.flightService.findOne(+id);
  }

  @Post('updateFlight/:flightId')
  updateFlight(@Param('flightId') id: string, @Body() data: UpdateFlightDto) {
    console.log('id', id);
    console.log('res', data);
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

  @Get('getAllAircraftBasic')
  async getAllAircraftBasic() {
    return this.flightService.getAllAircraftBasic();
  }

  @Get('aircraft/:id/seats')
  async getSeatsByAircraft(@Param('id') id: string) {
    return this.flightService.getSeatsByAircraftId(id);
  }

  @Get('airports')
  async getAirports() {
    return this.flightService.getAllAirports();
  }

  @Post('airports')
  async createAirport(@Body() body: AirportDto) {
    return this.flightService.createAirport(body);
  }

  // @Post('generate/:flightId')
  // async generateSeats(@Param('flightId') flightId: string) {
  //   return this.flightService.generateSeats(Number(flightId));
  // }

  @Post('search')
  async searchFlights(@Body() dto: SearchFlightDto) {
    return this.flightService.searchFlights(dto);
  }
}
