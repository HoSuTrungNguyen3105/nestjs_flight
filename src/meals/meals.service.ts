import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MealService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MealCreateInput) {
    return this.prisma.meal.create({ data });
  }

  async findAll() {
    return this.prisma.meal.findMany({
      include: { flightMeals: true, mealOrders: true },
    });
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
