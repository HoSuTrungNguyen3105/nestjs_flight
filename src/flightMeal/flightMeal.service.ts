import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFlightMealDto } from './dto/create-meal.dto';
import { UpdateFlightMealDto } from './dto/update-meal.dto';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { FlightMeal } from 'generated/prisma';

@Injectable()
export class FlightMealService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: CreateFlightMealDto,
  ): Promise<BaseResponseDto<FlightMeal>> {
    const meal = await this.prisma.flightMeal.create({
      data,
    });
    return {
      resultCode: '00',
      resultMessage: 'Flight meal created successfully',
      data: meal,
    };
  }

  async findAll(): Promise<BaseResponseDto<FlightMeal>> {
    const meals = await this.prisma.flightMeal.findMany({
      include: {
        flight: true,
        meal: true,
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Flight meals retrieved successfully',
      list: meals,
    };
  }

  async findOne(id: number): Promise<BaseResponseDto<FlightMeal>> {
    const fm = await this.prisma.flightMeal.findUnique({
      where: { id },
      include: {
        flight: true,
        meal: true,
      },
    });

    if (!fm) {
      throw new NotFoundException(`FlightMeal with ID ${id} not found`);
    }

    return {
      resultCode: '00',
      resultMessage: 'Flight meals retrieved successfully',
      data: fm,
    };
  }

  async addMealsToFlight(
    flightId: number,
    meals: { id: number; quantity: number; price?: number }[],
  ) {
    const data = meals.map((m) => ({
      flightId,
      mealId: m.id,
      quantity: m.quantity,
      price: m.price,
    }));

    await this.prisma.flightMeal.createMany({ data });

    return {
      resultCode: '00',
      resultMessage: 'Gán meals vào flight thành công!',
      list: data,
    };
  }

  async update(id: number, data: UpdateFlightMealDto) {
    await this.findOne(id); // check exists
    return this.prisma.flightMeal.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // check exists
    return this.prisma.flightMeal.delete({
      where: { id },
    });
  }
}
