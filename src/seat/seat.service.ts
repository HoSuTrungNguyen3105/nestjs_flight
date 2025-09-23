import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { Prisma } from 'generated/prisma';
import { SeatTypeDto, SeatTypesResponseDto } from './dto/seat-dto';

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

      if (data.seatRow && data.seatNumber) {
        await this.prisma.seat.create({
          data: {
            seatRow: data.seatRow.toUpperCase(),
            seatNumber: data.seatNumber,
            flightId: data.flightId,
            isBooked: data.isBooked ?? false,
          },
        });

        return {
          resultCode: '00',
          resultMessage: 'Created 1 seat successfully',
        };
      }

      const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
      const seats: Prisma.SeatCreateManyInput[] = [];

      for (let number = 1; number <= 40; number++) {
        for (const row of columns) {
          seats.push({
            seatRow: row,
            seatNumber: number,
            flightId: data.flightId,
            isBooked: false,
          });
        }
      }

      await this.prisma.seat.createMany({
        data: seats,
        skipDuplicates: true,
      });

      const createdSeats = await this.prisma.seat.findMany({
        where: { flightId: data.flightId },
        orderBy: [{ seatRow: 'asc' }, { seatNumber: 'asc' }],
      });

      return {
        resultCode: '00',
        resultMessage: `Created ${createdSeats.length} seats successfully (A-F × 1-40).`,
      };
    } catch (err) {
      console.error('Error creating seats:', err);
      return {
        resultCode: '99',
        resultMessage: 'Internal server error',
      };
    }
  }

  async deleteAllByFlight(flightId: number) {
    try {
      const res = await this.prisma.seat.deleteMany({
        where: { flightId },
      });

      return {
        resultCode: '00',
        resultMessage: `Deleted ${res.count} seats successfully for flightId ${flightId}`,
      };
    } catch (err) {
      console.error('Error deleting seats:', err);
      throw err;
    }
  }

  async findAllByFlightId(flightId: number) {
    try {
      const flight = await this.prisma.flight.findUnique({
        where: { flightId: flightId },
      });

      if (!flight) {
        return { resultCode: '09', resultMessage: 'Flight not found.' };
      }

      const seats = await this.prisma.seat.findMany({
        where: { flightId: flightId },
        orderBy: [{ seatNumber: 'asc' }, { seatRow: 'asc' }],
      });

      const formattedSeats = seats.map((seat) => ({
        id: seat.id,
        seatNumber: seat.seatNumber,
        seatRow: seat.seatRow,
        type: this.determineSeatType(seat.seatNumber, seat.seatRow),
        isBooked: seat.isBooked,
        isWindow: this.isWindowSeat(seat.seatRow),
        nearRestroom: this.isNearRestroom(seat.seatNumber),
      }));

      return {
        resultCode: '00',
        resultMessage: 'Seats retrieved successfully',
        list: formattedSeats,
      };
    } catch (err) {
      console.error('An error occurred during seat retrieval:', err);
      throw err;
    }
  }

  private determineSeatType(seatNumber: number, seatRow: string): string {
    if (seatNumber <= 2) return 'VIP';
    if (seatNumber <= 5) return 'BUSINESS';
    return 'ECONOMY';
  }

  private isWindowSeat(seatRow: string): boolean {
    return seatRow === 'A' || seatRow === 'F';
  }

  private isNearRestroom(seatNumber: number): boolean {
    return seatNumber === 1 || seatNumber === 15 || seatNumber === 30;
  }

  async deleteAllSeats() {
    try {
      const deleted = await this.prisma.seat.deleteMany({});
      return {
        resultCode: '00',
        resultMessage: `Deleted ${deleted.count} seats successfully`,
      };
    } catch (err) {
      console.error('Error deleting seats:', err);
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

  async getAllSeatTypes(): Promise<SeatTypesResponseDto> {
    try {
      const seatTypes = await this.prisma.seat.groupBy({
        by: ['type'],
        _count: {
          id: true,
        },
        orderBy: {
          type: 'asc',
        },
      });

      const result: SeatTypeDto[] = seatTypes.map((item) => ({
        type: item.type,
        count: item._count.id,
      }));

      return {
        resultCode: '00',
        resultMessage: 'Successfully retrieved all seat types',
        data: result,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: 'Error retrieving seat types',
        error: error.message,
      };
    }
  }

  async getSeatTypesByFlight(flightId: number): Promise<SeatTypesResponseDto> {
    try {
      const seatTypes = await this.prisma.seat.groupBy({
        by: ['type'],
        where: {
          flightId: flightId,
        },
        _count: {
          id: true,
        },
        orderBy: {
          type: 'asc',
        },
      });

      const result: SeatTypeDto[] = seatTypes.map((item) => ({
        type: item.type,
        count: item._count.id,
      }));

      return {
        resultCode: '00',
        resultMessage: `Successfully retrieved seat types for flight ${flightId}`,
        data: result,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: 'Error retrieving seat types by flight',
        error: error.message,
      };
    }
  }

  async getAvailableSeatTypes(
    flightId?: number,
  ): Promise<SeatTypesResponseDto> {
    try {
      const whereCondition: any = {
        isAvailable: true,
        isBooked: false,
      };

      if (flightId) {
        whereCondition.flightId = flightId;
      }

      const seatTypes = await this.prisma.seat.groupBy({
        by: ['type'],
        where: whereCondition,
        _count: {
          id: true,
        },
        orderBy: {
          type: 'asc',
        },
      });

      const result: SeatTypeDto[] = seatTypes.map((item) => ({
        type: item.type,
        count: item._count.id,
      }));

      return {
        resultCode: '00',
        resultMessage: 'Successfully retrieved available seat types',
        data: result,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: 'Error retrieving available seat types',
        error: error.message,
      };
    }
  }
  async getDistinctSeatTypes() {
    try {
      const distinctTypes = await this.prisma.seat.findMany({
        select: {
          type: true,
        },
        distinct: ['type'],
        orderBy: {
          type: 'asc',
        },
      });

      const types = distinctTypes.map((item) => item.type);

      return {
        resultCode: '00',
        resultMessage: 'Successfully retrieved distinct seat types',
        data: types,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: 'Error retrieving distinct seat types',
        data: [],
      };
    }
  }

  async updateSeats(seatIds: number[], data: UpdateSeatDto) {
    try {
      if (!seatIds || seatIds.length === 0) {
        return {
          resultCode: '01',
          resultMessage: 'No seat IDs provided',
          data: [],
        };
      }

      const updatedSeats = await this.prisma.seat.updateMany({
        where: {
          id: {
            in: seatIds,
          },
        },
        data,
      });

      const seats = await this.prisma.seat.findMany({
        where: {
          id: {
            in: seatIds,
          },
        },
      });

      return {
        resultCode: '00',
        resultMessage: `${updatedSeats.count} seats updated successfully`,
        data: seats,
      };
    } catch (err) {
      console.error('Error updating seats:', err);
      throw err;
    }
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
