import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { Prisma } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import {
  SearchFlightDto,
  SearchFlightFromPassengerDto,
} from './dto/search.flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { CreateFlightDto } from './dto/create-flight.dto';
import { FlightResponseDto } from './dto/flight-response.dto';
import {
  CreateAircraftDto,
  UpdateAircraftDto,
} from './dto/create-aircraft.dto';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { CreateAirportDto, UpdateAirportDto } from './dto/create-airport.dto';
import {
  CreateFlightDiscountDto,
  UpdateFlightDiscountDto,
} from './dto/create-flight-discount.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FindTicketDto } from './dto/find-ticket.dto';

@Controller('sys/flights')
export class FlightsController {
  constructor(private readonly flightService: FlightsService) {}

  @Post()
  create(@Body() data: CreateFlightDto) {
    return this.flightService.create(data);
  }

  @Post('bulk-create')
  async createMany(@Body() createFlightsDto: CreateFlightDto[]) {
    return this.flightService.createMany(createFlightsDto);
  }

  @Get('terminal')
  async findAllTerminal() {
    return await this.flightService.findAllTerminal();
  }

  @Post('createTerminal/bulk')
  async createTerminalBulk(@Body() dto: CreateTerminalDto[]) {
    return await this.flightService.creatManyTerminal(dto);
  }

  @Get('best-sellers')
  async findBestSellerFlightsWithDiscount() {
    return await this.flightService.findBestSellerFlightsWithDiscount();
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<BaseResponseDto<FlightResponseDto>> {
    return await this.flightService.findAll(Number(page), Number(limit));
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

  @Post('all')
  async deleteAllFlights() {
    return this.flightService.deleteAll();
  }

  @Get('dates/:airportCode')
  async getDates(@Param('airportCode') code: string) {
    return this.flightService.getAvailableDates(code);
  }

  @Get('aircraft')
  async getAircraft() {
    return this.flightService.getAllAircraft();
  }

  @Get('flightIds/status')
  async findAllIdsFlight() {
    return this.flightService.findAllFlightWithStatus();
  }

  // @Get('flight-info/main')
  // async findAllMainInfoFlight() {
  //   return this.flightService.findAllMainInfoFlight();
  // }

  @Post('flightIds/delete')
  async deleteManyFlightIds(@Body() ids: number[]) {
    return this.flightService.deleteManyFlightIds(ids);
  }

  @Post('aircraft')
  @UseInterceptors(FileInterceptor('imageAircraft'))
  async createAircraft(
    @Body() data: CreateAircraftDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.flightService.createAircraft(data, file);
  }

  @Post('aircraft/batch')
  @UseInterceptors(FileInterceptor('imageAircraft'))
  async createBatchAircraft(
    @Body('createBatchAircraftDto') createBatchAircraftDto: CreateAircraftDto[],
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('createBatchAircraftDto', createBatchAircraftDto);
    return this.flightService.createBatchAircraft(createBatchAircraftDto, file);
  }

  @Post('airport/batch')
  async createBatchAirport(@Body() createBatchAircraftDto: CreateAirportDto[]) {
    console.log('createBatchAircraftDto', createBatchAircraftDto);

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
  async findAircraftByCode(@Param('code') code: string) {
    return this.flightService.findAircraftByCode(code);
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

  @Get('getAllCode')
  async getAllCode() {
    return this.flightService.getAllCode();
  }

  @Get('getAllAirportIds')
  async getAllAirportIds() {
    return this.flightService.getAllAirportIds();
  }

  @Post('airports')
  async createAirport(@Body() body: CreateAirportDto) {
    return this.flightService.createAirport(body);
  }

  @Post('search')
  async searchFlights(@Body() dto: SearchFlightDto) {
    return this.flightService.searchFlights(dto);
  }

  @Get('passenger/searchs')
  async searchFlightFromPassenger(
    @Query() search: SearchFlightFromPassengerDto,
  ) {
    return this.flightService.searchFlightFromPassenger(search);
  }

  @Get('by-date')
  async getFlightsByDate(
    @Query('airport') airport: string,
    @Query('date') date: string, // "2025-01-10"
  ) {
    return this.flightService.getFlightsByDate(airport, date);
  }

  @Post('find-passenger-ticket')
  async findTicketByPassengerID(@Body('id') id: string) {
    return this.flightService.findTicketByPassengerID(id);
  }

  @Post('find-passenger-tickets')
  async findTicketsByPassenger(@Body() dto: FindTicketDto) {
    return this.flightService.findTicketsByPassenger(dto);
  }

  @Post('flight-status/add')
  createFlightStatus(
    @Body() body: { flightId: number; status: string; description?: string },
  ) {
    return this.flightService.createFlightStatus(body);
  }

  @Post('flight-status/update')
  updateFlightStatus(@Body() body: { id: number; status: string }) {
    return this.flightService.updateFlightStatus(body.id, body);
  }

  @Post('flight-discount')
  async createFlightDiscount(@Body() dto: CreateFlightDiscountDto) {
    return this.flightService.createFlightDiscount(dto);
  }

  @Get('flight-discount')
  async findAllFlightDiscount() {
    return this.flightService.findAllFlightDiscount();
  }

  @Get('flight-discount/:flightId')
  async findFlightDiscountByFlightId(@Body() flightId: number) {
    return this.flightService.findFlightDiscountByFlightId(flightId);
  }

  @Get('flight-discount/:id')
  async findFlightDiscountByID(@Param('id', ParseIntPipe) id: number) {
    return this.flightService.findFlightDiscountByID(id);
  }

  @Post('flight-discount/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlightDiscountDto,
  ) {
    return this.flightService.updateFlightDiscount(id, dto);
  }

  @Post('flight-discount/delete/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.flightService.removeFlightDiscount(id);
  }

  @Post('discount/create')
  async createDiscount(@Body() createDto: CreateDiscountDto) {
    return this.flightService.createDiscount(createDto);
  }

  @Post('discounts/create')
  async createDiscounts(@Body() createDto: CreateDiscountDto[]) {
    return this.flightService.createDiscounts(createDto);
  }

  @Get('discount/all')
  async getAllDiscounts() {
    return this.flightService.getAllDiscounts();
  }

  @Get('discount/:id')
  async getDiscountById(@Param('id', ParseIntPipe) id: number) {
    return this.flightService.getDiscountById(id);
  }
}
