import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { FlightMealService } from './flightMeal.service';
import { CreateFlightMealDto } from './dto/create-meal.dto';
import { UpdateFlightMealDto } from './dto/update-meal.dto';

@Controller('sys/flight-meals')
export class FlightMealController {
  constructor(private readonly flightMealService: FlightMealService) {}

  @Post()
  create(@Body() dto: CreateFlightMealDto) {
    return this.flightMealService.addMealToFlight(dto);
  }

  @Get()
  findAll() {
    return this.flightMealService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flightMealService.findOne(+id);
  }

  @Get('flight/:id')
  findMealByFlightId(@Param('id') id: string) {
    return this.flightMealService.findMealByFlightId(+id);
  }

  @Post('update/:id')
  update(@Param('id') id: string, @Body() dto: UpdateFlightMealDto) {
    return this.flightMealService.update(+id, dto);
  }

  @Post('delete/:id')
  remove(@Param('id') id: string) {
    return this.flightMealService.remove(+id);
  }

  @Post('generate-many')
  async generateMany(@Body('flightIds') flightIds: number[]) {
    return this.flightMealService.generateRandomMealsForFlights(flightIds);
  }

  // Tạo cho ALL flight
  @Post('generate-all')
  async generateAll() {
    return this.flightMealService.generateRandomMealsForAllFlights();
  }

  // @Post(':id/meals')
  // async addMealsToFlight(
  //   @Param('id') flightId: string,
  //   @Body() body: CreateFlightMealsDto,
  // ) {
  //   return this.flightMealService.addMealsToFlight(+flightId, body.meals);
  // }
}
