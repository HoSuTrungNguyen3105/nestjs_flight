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
import { CreateMealDto, UpdateMealDto } from './dto/CreateMeal.dto';

@Controller('sys/meals')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Post()
  create(@Body() data: CreateMealDto) {
    return this.mealService.create(data);
  }

  @Post('create-many')
  async createMeals(@Body() dataList: CreateMealDto[]) {
    return this.mealService.createMany(dataList);
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
  update(@Param('id') id: string, @Body() data: UpdateMealDto) {
    return this.mealService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mealService.remove(+id);
  }

  @Post('removeAllMeal')
  removeAllMeal() {
    return this.mealService.removeAllMeal();
  }
}
