// meals.module.ts
import { Module } from '@nestjs/common';
import { MealController } from './meals.controller';
import { MealService } from './meals.service';

@Module({
  controllers: [MealController],
  providers: [MealService],
})
export class MealsModule {}
