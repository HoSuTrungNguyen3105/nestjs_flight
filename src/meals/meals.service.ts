import { Injectable } from '@nestjs/common';
import { Meal, MealType, Prisma } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { PrismaService } from 'src/prisma.service';
import { CreateMealDto } from './dto/CreateMeal.dto';

@Injectable()
export class MealService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMealDto) {
    const res = await this.prisma.meal.create({
      data: {
        mealCode: data.mealCode,
        name: data.name,
        mealType: data.mealType as MealType,
        description: data.description,
        price: data.price,
        isAvailable: data.isAvailable ?? true,
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách món ăn thành công!',
      data: res,
    };
  }

  async createMany(dataList: CreateMealDto[]) {
    try {
      const results = await Promise.all(
        dataList.map(async (data) => {
          const hasMealCode = await this.prisma.meal.findUnique({
            where: { mealCode: data.mealCode },
          });

          if (hasMealCode) {
            return {
              resultCode: '01',
              resultMessage: 'Duplicate meal code!',
            };
          }

          const meal = await this.prisma.meal.create({
            data: {
              mealCode: data.mealCode,
              name: data.name,
              mealType: data.mealType as MealType,
              description: data.description,
              price: data.price,
              isAvailable: data.isAvailable ?? true,
            },
          });

          return {
            ...meal,
          };
        }),
      );

      return {
        resultCode: '00',
        resultMessage: 'Processed create many meals!',
        data: results,
      };
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async findAll(): Promise<BaseResponseDto<Meal>> {
    const meals = await this.prisma.meal.findMany({
      include: { flightMeals: true },
    });

    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách món ăn thành công!',
      list: meals,
    };
  }

  async findOne(id: number) {
    const meal = await this.prisma.meal.findUnique({
      where: { id },
      include: { flightMeals: true, mealOrders: true },
    });
    if (!meal)
      return {
        resultCode: '01',
        resultMessage: 'Meal not found',
      };
    return {
      resultCode: '00',
      resultMessage: 'Lấy món ăn thành công!',
      data: meal,
    };
  }

  async update(id: number, data: Prisma.MealUpdateInput) {
    return this.prisma.meal.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.meal.delete({
      where: { id },
    });
  }

  async removeAllMeal() {
    return this.prisma.meal.deleteMany({});
  }
}
