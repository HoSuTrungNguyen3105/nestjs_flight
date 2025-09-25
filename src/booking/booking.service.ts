import { Injectable, BadRequestException } from '@nestjs/common';
import {
  CreateBookingDto,
  CreatePassengerPseudoDto,
} from './dto/create-booking.dto';
import { PrismaService } from 'src/prisma.service';
import { nowDecimal } from 'src/common/helpers/format';
import {
  Aircraft,
  Airport,
  Booking,
  Flight,
  Prisma,
  Seat,
} from 'generated/prisma';
import { SearchBookingDto } from './dto/search-booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async createPseudoPassengers(passengers: CreatePassengerPseudoDto[]) {
    try {
      const created = await this.prisma.passenger.createMany({
        data: passengers.map((p) => ({
          fullName: p.fullName,
          email: p.email,
          phone: p.phone,
          passport: p.passport,
          accountLockYn: 'N',
          isEmailVerified: 'Y',
          lastLoginDate: null,
        })),
        skipDuplicates: true,
      });

      return {
        resultCode: '00',
        resultMessage: 'Passengers pseudo created successfully',
        data: created,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: 'Error creating passengers',
        error: error.message,
      };
    }
  }

  async create(dto: CreateBookingDto) {
    const hasFlight = await this.prisma.flight.findUnique({
      where: {
        flightId: dto.flightId,
      },
    });

    if (!hasFlight) {
      return {
        resultCode: '01',
        resultMessage: 'Flight not found',
      };
    }

    // 2. Check passenger tồn tại
    const hasPassenger = await this.prisma.passenger.findUnique({
      where: {
        id: dto.passengerId,
      },
    });

    if (!hasPassenger) {
      return {
        resultCode: '02',
        resultMessage: 'Passenger not found',
      };
    }

    // 3. Nếu có mealOrders thì check luôn meal tồn tại
    if (dto.mealOrders && dto.mealOrders.length > 0) {
      for (const meal of dto.mealOrders) {
        const hasMeal = await this.prisma.meal.findUnique({
          where: { id: meal.mealId },
        });
        if (!hasMeal) {
          return {
            resultCode: '03',
            resultMessage: `Meal with id ${meal.mealId} not found`,
          };
        }
      }
    }

    // 4. Tạo booking
    const booking = await this.prisma.booking.create({
      data: {
        passengerId: dto.passengerId,
        flightId: dto.flightId,
        bookingTime: nowDecimal(),
        mealOrders: dto.mealOrders
          ? {
              create: dto.mealOrders.map((meal) => ({
                mealId: meal.mealId,
                quantity: meal.quantity,
              })),
            }
          : undefined,
        seats: dto.seatId ? { connect: { id: dto.seatId } } : undefined,
      },
      include: {
        flight: true,
        mealOrders: true,
        seats: true,
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Booking created successfully',
      data: booking,
    };
  }

  async findAll() {
    const bookings = await this.prisma.booking.findMany({
      include: {
        flight: true,
        seats: true,
        mealOrders: true,
      },
    });
    return { resultCode: '00', resultMessage: 'Success', list: bookings };
  }

  async bookSeats(data: CreateBookingDto) {
    const { passengerId, flightId, seatId } = data;
    if (!Array.isArray(seatId) || seatId.length === 0) {
      throw new BadRequestException('seatIds must be a non-empty');
    }

    const availableSeats = await this.prisma.seat.findMany({
      where: {
        id: { in: seatId },
        flightId: flightId,
        bookingId: null,
      },
    });

    if (availableSeats.length !== seatId.length) {
      throw new BadRequestException(
        'One or more selected seats are not available or do not exist.',
      );
    }

    const passenger = await this.prisma.passenger.findUnique({
      where: { id: passengerId }, //role: 'USER'
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
    try {
      return this.prisma.$transaction(async (tx) => {
        const availableSeats = await tx.seat.findMany({
          where: {
            id: { in: seatId },
            flightId,
            bookingId: null,
          },
        });

        if (availableSeats.length !== seatId.length) {
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
          where: { id: { in: seatId } },
          data: { bookingId: booking.id, isBooked: true },
        });

        return {
          resultCode: '00',
          resultMessage: 'Success.',
          data: booking,
        };
      });
    } catch (error) {
      console.error('Booking error:', error);
      throw error;
    }
  }

  async searchBooking(dto: SearchBookingDto) {
    const {
      from,
      to,
      departDate,
      returnDate,
      flightType,
      cabinClass,
      flightNo,
      aircraftCode,
      status,
      minPrice,
      maxPrice,
      terminal,
      minDelayMinutes,
      maxDelayMinutes,
      includeCancelled = false,
    } = dto;

    const whereCondition: Prisma.BookingWhereInput = {
      flight: {
        ...(from && { departureAirport: from.toUpperCase() }),
        ...(to && { arrivalAirport: to.toUpperCase() }),
        ...(flightNo && { flightNo: { contains: flightNo.toUpperCase() } }),
        ...(aircraftCode && { aircraftCode: aircraftCode.toUpperCase() }),
        ...(status && { status: status.toUpperCase() }),
        ...(terminal && { terminal: { contains: terminal.toUpperCase() } }),
        ...(minPrice !== undefined && { priceEconomy: { gte: minPrice } }),
        ...(maxPrice !== undefined && { priceEconomy: { lte: maxPrice } }),
        ...(minPrice !== undefined && { priceBusiness: { gte: minPrice } }),
        ...(maxPrice !== undefined && { priceBusiness: { lte: maxPrice } }),
        ...(minPrice !== undefined && { priceFirst: { gte: minPrice } }),
        ...(maxPrice !== undefined && { priceFirst: { lte: maxPrice } }),
        ...(minDelayMinutes !== undefined && {
          delayMinutes: { gte: minDelayMinutes },
        }),
        ...(maxDelayMinutes !== undefined && {
          delayMinutes: { lte: maxDelayMinutes },
        }),
        ...(!includeCancelled && { isCancelled: false }),
        ...(departDate && {
          scheduledDeparture: {
            gte: new Prisma.Decimal(departDate),
            lte: new Prisma.Decimal(departDate + 86399999),
          },
        }),
      },
      ...(cabinClass && {
        seats: {
          type: cabinClass,
        },
      }),
    };

    // lấy chiều đi
    const outbound = await this.prisma.booking.findMany({
      where: whereCondition,
      include: {
        flight: {
          include: {
            departureAirportRel: true,
            arrivalAirportRel: true,
            aircraft: true,
          },
        },
        seats: true,
      },
    });

    // mặc định inbound rỗng
    let inbound: (Booking & {
      flight: Flight & {
        aircraft: Aircraft;
        arrivalAirportRel: Airport;
        departureAirportRel: Airport;
      };
      seats: Seat | null;
    })[] = [];

    // nếu là khứ hồi thì mới query inbound
    if (flightType === 'roundtrip' && returnDate) {
      inbound = await this.prisma.booking.findMany({
        where: {
          flight: {
            departureAirport: to?.toUpperCase(),
            arrivalAirport: from?.toUpperCase(),
            scheduledDeparture: {
              gte: new Prisma.Decimal(returnDate),
              lte: new Prisma.Decimal(returnDate + 86399999),
            },
          },
        },
        include: {
          flight: {
            include: {
              departureAirportRel: true,
              arrivalAirportRel: true,
              aircraft: true,
            },
          },
          seats: true,
        },
      });
    }

    return {
      resultCode: '00',
      resultMessage: 'Thành công',
      data: {
        outbound,
        inbound,
      },
    };
  }

  async getFlightSeats(flightId: number) {
    const flight = await this.prisma.flight.findUnique({
      where: { flightId: flightId },
      include: {
        seats: {
          orderBy: [{ seatRow: 'asc' }, { seatNumber: 'asc' }],
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
