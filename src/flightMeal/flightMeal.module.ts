import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { FlightMealService } from './flightMeal.service';
import { FlightMealController } from './flightMeal.controller';

@Module({
  controllers: [FlightMealController],
  providers: [FlightMealService, PrismaService],
})
export class FlightMealModule {}
