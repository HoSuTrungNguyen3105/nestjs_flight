import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { Facility, Prisma } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { SearchFlightDto } from './dto/search.flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { CreateFlightDto } from './dto/create-flight.dto';
import { FlightResponseDto } from './dto/flight-response.dto';
import {
  CreateAircraftDto,
  UpdateAircraftDto,
} from './dto/create-aircraft.dto';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import {
  CreateFacilityDto,
  UpdateFacilityDto,
} from '../gate/dto/create-facility.dto';
import { CreateAirportDto, UpdateAirportDto } from './dto/create-airport.dto';
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
    return await this.flightService.findAllTerminal();
  }

  // @Post('createTerminal')
  // async createTerminal(@Body() data: CreateTerminalDto) {
  //   return await this.flightService.createTerminal(data);
  // }

  @Post('createTerminal/bulk')
  async createTerminalBulk(@Body() dto: CreateTerminalDto[]) {
    return await this.flightService.creatManyTerminal(dto);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(): Promise<BaseResponseDto<FlightResponseDto>> {
    return await this.flightService.findAll();
  }

  @Get('getFlight/:id')
  async findOne(@Param('id') id: number) {
    return await this.flightService.findOne(+id);
  }

  @Get('getFlightAllInfo/:id')
  findFlightAllInfo(@Param('id') id: number) {
    return this.flightService.findFlightInfo(+id);
  }

  @Post('updateFlight/:flightId')
  updateFlight(@Param('flightId') id: string, @Body() data: UpdateFlightDto) {
    return this.flightService.updateFlight(+id, data);
  }

  @Delete('all')
  async deleteAllFlights() {
    return this.flightService.deleteAll();
  }

  @Get('aircraft')
  async getAircraft() {
    return this.flightService.getAllAircraft();
  }

  @Get('flightIds/status')
  async findAllIdsFlight() {
    return this.flightService.findAllIdsFlight();
  }

  @Post('aircraft/batch')
  async createBatchAircraft(
    @Body() createBatchAircraftDto: CreateAircraftDto[],
  ) {
    return this.flightService.createBatchAircraft(createBatchAircraftDto);
  }

  @Post('airport/batch')
  async createBatchAirport(@Body() createBatchAircraftDto: CreateAirportDto[]) {
    return this.flightService.createBatchAirport(createBatchAircraftDto);
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
  async findAircraftById(@Param('code') code: string) {
    return this.flightService.findAircraftById(code);
  }

  @Post('aircraft/update/:code')
  async updateAircraft(
    @Param('code') code: string,
    @Body() updateAircraftDto: UpdateAircraftDto,
  ) {
    return this.flightService.updateAircraft(code, updateAircraftDto);
  }

  @Post('aircraft/remove/:code')
  async removeAircraft(@Param('code') code: string) {
    return this.flightService.removeAircraft(code);
  }

  @Get('airports')
  async getAirports() {
    return this.flightService.getAllAirports();
  }

  @Post('airports/update/:code')
  async updateAirport(
    @Param('code') code: string,
    @Body() dto: UpdateAirportDto,
  ) {
    return this.flightService.updateAirport(code, dto);
  }

  @Post('airports/delete')
  async removeAirport(@Body() code: string) {
    return this.flightService.removeAirport(code);
  }

  @Post('tickets')
  async createTicket(
    @Body()
    data: {
      ticketNo: string;
      passengerId: string;
      flightId: number;
      seatClass: string;
      seatNo: string;
      bookedAt: number;
    },
  ) {
    return this.flightService.createTicket(data);
  }

  @Get('tickets')
  async findAllTicket() {
    return this.flightService.findAllTicket();
  }

  // @Get('getFlightCodeName')
  // async getFlightCodeName() {
  //   return this.flightService.getAllFlightCodeName();
  // }

  @Get('getAllCode')
  async getAllCode() {
    return this.flightService.getAllCode();
  }

  @Post('airports')
  async createAirport(@Body() body: CreateAirportDto) {
    return this.flightService.createAirport(body);
  }

  @Post('search')
  async searchFlights(@Body() dto: SearchFlightDto) {
    return this.flightService.searchFlights(dto);
  }

  @Post('createFlightStatus')
  createFlightStatus(
    @Body() body: { flightId: number; status: string; description?: string },
  ) {
    return this.flightService.createFlightStatus(body);
  }

  @Post('updateFlightStatus')
  updateFlightStatus(@Body() body: { id: number; status: string }) {
    return this.flightService.updateFlightStatus(body.id, body);
  }
}
