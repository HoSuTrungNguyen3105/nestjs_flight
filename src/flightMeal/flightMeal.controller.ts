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
import { CreateFlightMealsDto } from './dto/addMealToFlight';

@Controller('sys/flight-meals')
export class FlightMealController {
  constructor(private readonly flightMealService: FlightMealService) {}

  @Post()
  create(@Body() dto: CreateFlightMealDto) {
    return this.flightMealService.create(dto);
  }

  @Get()
  findAll() {
    return this.flightMealService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flightMealService.findOne(+id);
  }

  @Post('update/:id')
  update(@Param('id') id: string, @Body() dto: UpdateFlightMealDto) {
    return this.flightMealService.update(+id, dto);
  }

  @Post('delete/:id')
  remove(@Param('id') id: string) {
    return this.flightMealService.remove(+id);
  }

  // @Post(':id/meals')
  // async addMealsToFlight(
  //   @Param('id') flightId: string,
  //   @Body() body: CreateFlightMealsDto,
  // ) {
  //   return this.flightMealService.addMealsToFlight(+flightId, body.meals);
  // }
}
