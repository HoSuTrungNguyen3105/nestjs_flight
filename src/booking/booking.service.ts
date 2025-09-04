import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PrismaService } from 'src/prisma.service';
import { nowDecimal } from 'src/common/helpers/base.helper';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async bookSeats(data: CreateBookingDto) {
    const { passengerId, flightId, seatIds } = data;

    const availableSeats = await this.prisma.seat.findMany({
      where: {
        id: { in: seatIds },
        flightId: flightId,
        bookingId: null,
      },
    });

    if (availableSeats.length !== seatIds.length) {
      throw new BadRequestException(
        'One or more selected seats are not available or do not exist.',
      );
    }

    const passenger = await this.prisma.user.findUnique({
      where: { id: passengerId, role: 'USER' },
    });
    const flight = await this.prisma.flight.findUnique({
      where: { flightId: flightId },
    });

    if (!passenger || !flight) {
      return {
        resultCode: '01',
        resultMessage: 'Passenger or Flight not found.',
      };
    }
    return this.prisma.$transaction(async (tx) => {
      const availableSeats = await tx.seat.findMany({
        where: {
          id: { in: seatIds },
          flightId,
          bookingId: null,
        },
      });

      if (availableSeats.length !== seatIds.length) {
        throw new BadRequestException(
          'One or more selected seats are not available.',
        );
      }

      const booking = await tx.booking.create({
        data: {
          passengerId,
          flightId,
          bookingTime: nowDecimal(),
        },
      });

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { bookingId: booking.id, isBooked: true },
      });

      return {
        resultCode: '00',
        resultMessage: 'Success.',
        data: booking,
      };
    });
  }
  async getFlightSeats(flightId: number) {
    const flight = await this.prisma.flight.findUnique({
      where: { flightId: flightId },
      include: {
        seats: {
          orderBy: [{ row: 'asc' }, { column: 'asc' }],
        },
      },
    });

    if (!flight) {
      return {
        resultCode: '01',
        resultMessage: 'Flight not found.',
      };
    }

    return {
      resultCode: '00',
      resultMessage: 'Success.',
      data: flight.seats,
    };
  }
}
