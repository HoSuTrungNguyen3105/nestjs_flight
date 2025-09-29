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
  Query,
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { Aircraft, Airport, Facility, Flight, Prisma } from 'generated/prisma';
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
import { CreateFacilityDto } from './dto/create-facility.dto';
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

  @Post('facilities')
  async createFacility(@Body() data: CreateFacilityDto) {
    return this.flightService.createFacility(data);
  }

  @Delete('facilities/:id')
  async deleteFacility(@Param('id') id: string): Promise<Facility> {
    return this.flightService.deleteFacility(id);
  }

  @Get('by-terminal/:terminalId')
  async getFacilitiesByTerminal(
    @Param('terminalId') terminalId: string,
  ): Promise<Facility[]> {
    return this.flightService.getFacilitiesByTerminal(terminalId);
  }

  @Get('by-type/:type')
  async getFacilitiesByType(@Param('type') type: string): Promise<Facility[]> {
    return this.flightService.getFacilitiesByType(type as any);
  }

  @Get()
  async getFacilities(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<Facility[]> {
    return this.flightService.getFacilities({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
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

  @Post('createFlightStatus')
  createFlightStatus(
    @Body() body: { flightId: number; status: string; description?: string },
  ) {
    return this.flightService.createFlightStatus(body);
  }

  @Get('findAllFlightStatus')
  findAllFlightStatus() {
    return this.flightService.findAllFlightStatus();
  }

  @Post('updateFlightStatus/:id')
  updateFlightStatus(
    @Param('id') id: string,
    @Body() body: { status?: string; description?: string },
  ) {
    return this.flightService.updateFlightStatus(Number(id), body);
  }
}
