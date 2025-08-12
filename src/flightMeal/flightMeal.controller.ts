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

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFlightMealDto) {
    return this.flightMealService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flightMealService.remove(+id);
  }
}
