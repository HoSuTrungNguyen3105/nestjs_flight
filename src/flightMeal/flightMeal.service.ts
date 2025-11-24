import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFlightMealDto } from './dto/create-meal.dto';
import { UpdateFlightMealDto } from './dto/update-meal.dto';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { FlightMeal } from 'generated/prisma';

@Injectable()
export class FlightMealService {
  constructor(private prisma: PrismaService) {}

  async addMealToFlight(
    data: CreateFlightMealDto,
  ): Promise<BaseResponseDto<FlightMeal>> {
    const { flightId, mealId, quantity, price } = data;

    const flight = await this.prisma.flight.findUnique({ where: { flightId } });

    if (!flight)
      return {
        resultCode: '01',
        resultMessage: `Không tìm thấy chuyến bay có ID = ${flightId}`,
      };

    // const hasMealCode = await this.prisma.meal.findUnique({
    //       where: { mealCode: data.mealCode },
    //     });

    //     if (hasMealCode) {
    //       return {
    //         resultCode: '01',
    //         resultMessage: 'Duplicate meal code!',
    //       };
    //     }

    const meal = await this.prisma.meal.findUnique({ where: { id: mealId } });

    if (!meal)
      return {
        resultCode: '02',
        resultMessage: `Không tìm thấy suất ăn có ID = ${mealId}`,
      };

    const mealCode = await this.prisma.flightMeal.findUnique({
      where: { flightMealCode: data.flightMealCode },
    });

    if (mealCode)
      return {
        resultCode: '03',
        resultMessage: `Meal Code has yet = ${data.flightMealCode}`,
      };

    await this.prisma.flightMeal.create({
      data: {
        flightId,
        mealId,
        quantity,
        flightMealCode: data.flightMealCode,
        price: price ?? meal.price,
      },
      include: {
        meal: true,
        flight: true,
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Meal added to flight successfully',
    };
  }

  async generateForOneFlight(flightId: number) {
    const meals = await this.prisma.meal.findMany();

    if (meals.length === 0) {
      throw new Error('Không có meal nào trong hệ thống');
    }

    const count = Math.floor(Math.random() * 5) + 1; // random 1–5 meal

    const randomMeals = meals.sort(() => 0.5 - Math.random()).slice(0, count);

    return this.prisma.flightMeal.createMany({
      data: randomMeals.map((m) => ({
        flightId,
        mealId: m.id,
        quantity: Math.floor(Math.random() * 3) + 1, // 1–3
        price: Number((Math.random() * 20 + 5).toFixed(2)), // 5–25
      })),
    });
  }

  async generateRandomMealsForFlights(flightIds: number[]) {
    const results: { flightId: number; total: number }[] = [];

    for (const id of flightIds) {
      const created = await this.generateForOneFlight(id);
      results.push({
        flightId: id,
        total: created.count,
      });
    }

    return {
      message: 'Tạo ngẫu nhiên meal cho nhiều flight thành công',
      flights: results,
    };
  }

  // Tạo random cho ALL flight trong DB
  async generateRandomMealsForAllFlights() {
    const flights = await this.prisma.flight.findMany({
      select: { flightId: true },
    });

    const ids = flights.map((f) => f.flightId);

    return this.generateRandomMealsForFlights(ids);
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
          select: {
            mealCode: true,
            price: true,
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
          select: {
            mealCode: true,
            price: true,
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

  async findMealByFlightId(id: number): Promise<BaseResponseDto<FlightMeal>> {
    const meals = await this.prisma.flightMeal.findMany({
      where: { flightId: id },
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
        meal: true,
      },
    });

    if (!meals)
      return {
        resultCode: '01',
        resultMessage: `FlightMeal with ID ${id} not found`,
      };

    return {
      resultCode: '00',
      resultMessage: 'Flight meals retrieved successfully',
      list: meals,
    };
  }

  // async addMealsToFlight(
  //   flightId: number,
  //   meals: { id: number; quantity: number; price?: number }[],
  // ) {
  //   try {
  //     for (const m of meals) {
  //       const fm = await this.prisma.flightMeal.findFirst({
  //         where: {
  //           flightId,
  //           mealId: m.id,
  //         },
  //       });

  //       if (fm)
  //         return {
  //           resultCode: '01',
  //           resultMessage: `Flight ${flightId} đã có mealId ${m.id} rồi`,
  //         };

  //       const checkMeal = await this.prisma.meal.findUnique({
  //         where: { id: m.id },
  //       });

  //       if (checkMeal)
  //         return {
  //           resultCode: '02',
  //           resultMessage: `Meal ${flightId} not found`,
  //         };
  //     }

  //     const data = meals.map((m) => ({
  //       flightId,
  //       mealId: m.id,
  //       quantity: m.quantity,
  //       price: m.price,
  //     }));

  //     await this.prisma.flightMeal.createMany({ data });

  //     return {
  //       resultCode: '00',
  //       resultMessage: 'Gán meals vào flight thành công!',
  //       list: data,
  //     };
  //   } catch (error) {
  //     console.error('error', error);
  //     throw error;
  //   }
  // }

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
