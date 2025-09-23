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
import { SearchFlightDto } from './dto/search.flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { CreateFlightDto } from './dto/create-flight.dto';
import { FlightResponseDto } from './dto/flight-response.dto';
import {
  CreateAircraftDto,
  UpdateAircraftDto,
} from './dto/create-aircraft.dto';
import { CreateTerminalDto } from './dto/create-terminal.dto';
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

  @Post('bulk-create')
  async createMany(@Body() createFlightsDto: CreateFlightDto[]) {
    return this.flightService.createMany(createFlightsDto);
  }

  @Post('aircraft')
  createAircraft(@Body() data: CreateAircraftDto) {
    return this.flightService.createAircraft(data);
  }

  @Get('terminal')
  async findAllTerminal() {
    return this.flightService.findAllTerminal();
  }

  @Post('createTerminal')
  createTerminal(@Body() data: CreateTerminalDto) {
    return this.flightService.createTerminal(data);
  }

  @Post('createTerminal/bulk')
  async createTerminalBulk(@Body() dto: CreateTerminalDto[]) {
    return this.flightService.creatManyTerminal(dto);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(): Promise<BaseResponseDto<FlightResponseDto>> {
    return this.flightService.findAll();
  }

  @Get('getFlight/:id')
  findOne(@Param('id') id: number) {
    return this.flightService.findOne(+id);
  }

  @Get('getFlightAllInfo/:id')
  findFlightAllInfo(@Param('id') id: number) {
    return this.flightService.findFlightInfo(+id);
  }

  @Post('updateFlight/:flightId')
  updateFlight(@Param('flightId') id: string, @Body() data: UpdateFlightDto) {
    return this.flightService.updateFlight(+id, data);
  }

  // @Post('delete/:flightId')
  // deleteFlight(@Param('flightId') id: string) {
  //   return this.flightService.deleteFlight(+id);
  // }

  @Delete('all')
  async deleteAllFlights() {
    return this.flightService.deleteAll();
  }

  @Get('aircraft')
  async getAircraft() {
    return this.flightService.getAllAircraft();
  }

  @Post('aircraft/batch')
  async createBatch(@Body() createBatchAircraftDto: CreateAircraftDto[]) {
    return this.flightService.createBatchAircraft(createBatchAircraftDto);
  }

  @Get('getAllAircraftBasic')
  async getAllAircraftBasic() {
    return this.flightService.getAllAircraftBasic();
  }

  @Get('aircraft/:id/seats')
  async getSeatsByAircraft(@Param('id') id: string) {
    return this.flightService.getSeatsByAircraftId(id);
  }

  @Get('aircraft/:code')
  findAircraftById(@Param('code') code: string) {
    return this.flightService.findAircraftById(code);
  }

  @Post('aircraft/update/:code')
  updateAircraft(
    @Param('code') code: string,
    @Body() updateAircraftDto: UpdateAircraftDto,
  ) {
    return this.flightService.updateAircraft(code, updateAircraftDto);
  }

  @Post('aircraft/remove/:code')
  removeAircraft(@Param('code') code: string) {
    return this.flightService.removeAircraft(code);
  }

  @Get('airports')
  async getAirports() {
    return this.flightService.getAllAirports();
  }

  @Get('getAllCode')
  async getAllCode() {
    return this.flightService.getAllCode();
  }

  @Post('airports')
  async createAirport(@Body() body: AirportDto) {
    return this.flightService.createAirport(body);
  }

  @Post('search')
  async searchFlights(@Body() dto: SearchFlightDto) {
    return this.flightService.searchFlights(dto);
  }
}
