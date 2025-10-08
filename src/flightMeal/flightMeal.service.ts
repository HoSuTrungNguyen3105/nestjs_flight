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
        flight: {
          select: {
            flightNo: true,
            departureAirport: true,
            arrivalAirport: true,
            aircraftCode: true,
            flightType: true,
          },
        },
        meal: {
          omit: {
            id: true,
          },
        },
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
        flight: {
          select: {
            flightNo: true,
            departureAirport: true,
            arrivalAirport: true,
            aircraftCode: true,
            flightType: true,
          },
        },
        meal: {
          omit: {
            id: true,
          },
        },
      },
    });

    if (!fm)
      return {
        resultCode: '01',
        resultMessage: `FlightMeal with ID ${id} not found`,
      };

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
    try {
      for (const m of meals) {
        const fm = await this.prisma.flightMeal.findFirst({
          where: {
            flightId,
            mealId: m.id,
          },
        });

        if (fm)
          return {
            resultCode: '00',
            resultMessage: `Flight ${flightId} đã có mealId ${m.id} rồi`,
          };

        const checkMeal = await this.prisma.meal.findUnique({
          where: { id: m.id },
        });

        if (checkMeal)
          return {
            resultCode: '00',
            resultMessage: `Meal ${flightId} not found`,
          };
      }

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
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateFlightMealDto) {
    await this.findOne(id);
    return this.prisma.flightMeal.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.flightMeal.delete({
      where: { id },
    });
  }
}
