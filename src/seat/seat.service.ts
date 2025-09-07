import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';

@Injectable()
export class SeatService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSeatDto) {
    try {
      const flight = await this.prisma.flight.findUnique({
        where: { flightId: data.flightId },
      });

      if (!flight) {
        return { resultCode: '09', resultMessage: 'Flight not found.' };
      }

      if (data.column) {
        const seat = await this.prisma.seat.create({
          data: {
            row: data.row,
            column: data.column,
            flightId: data.flightId,
            isBooked: data.isBooked ?? false,
          },
        });
        return {
          resultCode: '00',
          resultMessage: 'Created 1 seat successfully',
          data: seat,
        };
      }

      const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
      const seats = columns.map((col) => ({
        row: data.row,
        column: col,
        flightId: data.flightId,
        isBooked: false,
      }));

      const res = await this.prisma.seat.createMany({
        data: seats,
        skipDuplicates: true,
      });

      return {
        resultCode: '00',
        resultMessage: `Created ${res.count} seats successfully for row ${data.row}`,
      };
    } catch (err) {
      console.error('An error occurred during seat creation:', err);
      throw err;
    }
  }

  async findAll() {
    const res = await this.prisma.seat.findMany();
    return {
      resultCode: '00',
      resultMessage: `Success`,
      list: res,
    };
  }

  async findOne(id: number) {
    const seat = await this.prisma.seat.findUnique({ where: { id } });
    if (!seat) {
      return {
        resultCode: '01',
        resultMessage: `Seat with ID ${id} not found.`,
      };
    }
    return {
      resultCode: '00',
      resultMessage: 'Success',
      data: seat,
    };
  }

  async update(id: number, data: UpdateSeatDto) {
    const seat = await this.prisma.seat.findUnique({ where: { id } });
    if (!seat) {
      return {
        resultCode: '01',
        resultMessage: `Seat with ID ${id} not found.`,
      };
    }
    return this.prisma.seat.update({ where: { id }, data });
  }

  async remove(id: number) {
    const seat = await this.prisma.seat.findUnique({ where: { id } });
    if (!seat) {
      return {
        resultCode: '01',
        resultMessage: `Seat with ID ${id} not found.`,
      };
    }
    if (seat.isBooked) {
      return {
        resultCode: '02',
        resultMessage: 'Cannot delete a booked seat.',
      };
    }
    return this.prisma.seat.delete({ where: { id } });
  }
}
