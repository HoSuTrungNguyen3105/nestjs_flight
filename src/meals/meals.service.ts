import { Injectable, NotFoundException } from '@nestjs/common';
import { Meal, Prisma } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MealService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MealCreateInput) {
    return this.prisma.meal.create({ data });
  }

  async findAll(): Promise<BaseResponseDto<Meal>> {
    const meals = await this.prisma.meal.findMany({
      include: { flightMeals: true },
    });

    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách món ăn thành công!',
      list: meals, // mảng Meal[] thật sự
    };
  }

  async findOne(id: number) {
    const meal = await this.prisma.meal.findUnique({
      where: { id },
      include: { flightMeals: true, mealOrders: true },
    });
    if (!meal) throw new NotFoundException('Meal not found');
    return meal;
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
}
