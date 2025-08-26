import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // nếu anh xài Prisma
import { CreatePassengerDto, UpdatePassengerDto } from './dto/register_user';

@Injectable()
export class PassengerService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePassengerDto) {
    try {
      if (!data.email || !data.fullName) {
        throw new Error('Email and Full Name are required');
      }
      if (data.email) {
        const existingPassenger = await this.prisma.passenger.findUnique({
          where: { email: data.email },
        });
        if (existingPassenger) {
          return 'Email already exists';
        }
      }
      // const passenger = await this.prisma.passenger.create({ data });
      // return passenger;
    } catch (error) {
      console.error('Error creating passenger:', error);
      throw new Error('Error creating passenger');
    }
  }

  async findAll() {
    return this.prisma.passenger.findMany();
  }

  async findOne(id: number) {
    const passenger = await this.prisma.passenger.findUnique({ where: { id } });
    if (!passenger) throw new NotFoundException('Passenger not found');
    return passenger;
  }

  async update(id: number, data: UpdatePassengerDto) {
    return this.prisma.passenger.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.passenger.delete({ where: { id } });
  }
}
