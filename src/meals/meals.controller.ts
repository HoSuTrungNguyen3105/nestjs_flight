import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { MealService } from './meals.service';
import { Prisma } from 'generated/prisma';

@Controller('sys/meals')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Post()
  create(@Body() data: Prisma.MealCreateInput) {
    return this.mealService.create(data);
  }

  @Get()
  findAll() {
    return this.mealService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mealService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.MealUpdateInput) {
    return this.mealService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mealService.remove(+id);
  }
}
