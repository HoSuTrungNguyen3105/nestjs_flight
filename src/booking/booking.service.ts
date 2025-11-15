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
  FlightStatusType,
  Prisma,
  Seat,
  SeatType,
} from 'generated/prisma';
import { SearchBookingDto } from './dto/search-booking.dto';
import { CreateBaggageDto } from './dto/baggage.dto';
import { Decimal } from 'generated/prisma/runtime/library';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async createPseudoPassengers(passengers: CreatePassengerPseudoDto[]) {
    try {
      const emails = passengers.map((p) => p.email);

      const existing = await this.prisma.passenger.findMany({
        where: {
          email: { in: emails },
        },
        select: { email: true },
      });

      if (existing.length > 0) {
        return {
          resultCode: '01',
          resultMessage: `Passengers pseudo created failed! Duplicate emails: ${existing.map((e) => e.email).join(', ')}`,
        };
      }

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

  // async create(dto: CreateBookingDto) {
  //   const hasFlight = await this.prisma.flight.findUnique({
  //     where: {
  //       flightId: dto.flightId,
  //     },
  //   });

  //   if (!hasFlight) {
  //     return {
  //       resultCode: '01',
  //       resultMessage: 'Flight not found',
  //     };
  //   }

  //   const hasPassenger = await this.prisma.passenger.findUnique({
  //     where: {
  //       id: dto.passengerId,
  //     },
  //   });

  //   if (!hasPassenger) {
  //     return {
  //       resultCode: '02',
  //       resultMessage: 'Passenger not found',
  //     };
  //   }

  //   if (dto.mealOrders && dto.mealOrders.length > 0) {
  //     for (const meal of dto.mealOrders) {
  //       const hasMeal = await this.prisma.meal.findUnique({
  //         where: { id: meal.mealId },
  //       });
  //       if (!hasMeal) {
  //         return {
  //           resultCode: '03',
  //           resultMessage: `Meal with id ${meal.mealId} not found`,
  //         };
  //       }
  //     }
  //   }

  //   const booking = await this.prisma.booking.create({
  //     data: {
  //       passengerId: dto.passengerId,
  //       flightId: dto.flightId,
  //       bookingTime: nowDecimal(),
  //       mealOrders: dto.mealOrders
  //         ? {
  //             create: dto.mealOrders.map((meal) => ({
  //               mealId: meal.mealId,
  //               quantity: meal.quantity,
  //             })),
  //           }
  //         : undefined,
  //       seat: dto.seatId ? { connect: { id: dto.seatId } } : undefined,
  //     },
  //     include: {
  //       flight: {
  //         select: {
  //           flightId: true,
  //         },
  //       },
  //       mealOrders: {
  //         select: {
  //           id: true,
  //         },
  //       },
  //       seat: {
  //         select: {
  //           id: true,
  //         },
  //       },
  //     },
  //   });

  //   return {
  //     resultCode: '00',
  //     resultMessage: 'Booking created successfully',
  //     data: booking,
  //   };
  // }

  async findAll() {
    const bookings = await this.prisma.booking.findMany({
      include: {
        flight: true,
        seat: true,
        passenger: true,
        mealOrders: true,
      },
    });
    return { resultCode: '00', resultMessage: 'Success', list: bookings };
  }

  async deleteBooking(id: number) {
    const bookings = await this.prisma.booking.delete({
      where: {
        id: id,
      },
    });
    return { resultCode: '00', resultMessage: 'Success', list: bookings };
  }

  async findAllPassenger() {
    const bookings = await this.prisma.passenger.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        passport: true,
        phone: true,
        status: true,
        bookings: {
          select: {
            id: true,
          },
        },
      },
    });
    return { resultCode: '00', resultMessage: 'Success', list: bookings };
  }

  async findPassengerById(id: string) {
    try {
      const passenger = await this.prisma.passenger.findUnique({
        where: { id: id },
        omit: {
          password: true,
        },
        include: {
          bookings: {
            include: {
              seat: {
                select: {
                  id: true,
                  // type: true,
                  seatNumber: true,
                  seatRow: true,
                },
              },
              mealOrders: true,
              flight: true,
              // passenger: true,
            },
          },
        },
      });

      if (!passenger) {
        return {
          resultCode: '01',
          resultMessage: 'Passenger not found',
          data: null,
        };
      }

      return { resultCode: '00', resultMessage: 'Success', data: passenger };
    } catch (error) {
      console.error('error', error);
    }
  }

  async createBaggage(dto: CreateBaggageDto) {
    return this.prisma.baggage.create({
      data: dto,
    });
  }

  async findAllBaggage() {
    const res = await this.prisma.baggage.findMany({
      include: {
        flight: {
          select: {
            flightNo: true,
            priceBusiness: true,
            priceEconomy: true,
            priceFirst: true,
            flightType: true,
            gate: true,
          },
        },
        ticket: true,
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Baggage founded',
      list: res,
    };
  }

  async findOneBaggage(id: number) {
    const baggage = await this.prisma.baggage.findUnique({
      where: { id },
      include: { flight: true, ticket: true },
    });
    if (!baggage)
      return { resultCode: '01', resultMessage: 'Baggage not found' };

    return {
      resultCode: '00',
      resultMessage: 'Baggage has found',
      data: baggage,
    };
  }

  async bookSeats(data: CreateBookingDto & { discountCode?: string }) {
    const {
      passengerId,
      flightId,
      seatId,
      bookingCode,
      seatClass,
      seatNo,
      seatPrice: seatPriceInput,
      bookingTime,
      mealOrders,
      discountCode,
    } = data;

    try {
      // Kiểm tra đầu vào
      const seatIds = Array.isArray(seatId) ? seatId : [seatId];
      if (seatIds.length === 0) {
        throw new BadRequestException('Danh sách ghế không hợp lệ.');
      }

      // Hành khách & chuyến bay
      const [passenger, flight] = await Promise.all([
        this.prisma.passenger.findUnique({ where: { id: passengerId } }),
        this.prisma.flight.findUnique({ where: { flightId } }),
      ]);

      if (!passenger || !flight) {
        return {
          resultCode: '01',
          resultMessage: 'Không tìm thấy hành khách hoặc chuyến bay.',
        };
      }

      // Giá cơ bản
      let basePrice =
        seatClass === SeatType.BUSINESS
          ? flight.priceBusiness
          : flight.priceEconomy;

      let finalSeatPrice = seatPriceInput ?? basePrice;

      if (discountCode) {
        const flightDiscount = await this.prisma.flightDiscount.findFirst({
          where: { flightId, discountCode: { code: discountCode } },
          include: {
            discountCode: {
              select: { discountAmount: true, isPercentage: true },
            },
          },
        });

        if (!flightDiscount) {
          throw new BadRequestException(
            'Discount code không hợp lệ cho chuyến bay này',
          );
        }
        if (finalSeatPrice === null) {
          throw new BadRequestException('Không xác định được giá ghế.');
        }
        const discountAmount =
          flightDiscount.discountCode.discountAmount ?? new Decimal(0);
        const discountValue = discountAmount.toNumber();

        finalSeatPrice = flightDiscount.discountCode.isPercentage
          ? finalSeatPrice * (1 - discountValue / 100)
          : Math.max(finalSeatPrice - discountValue, 0);

        if (finalSeatPrice < 0) {
          finalSeatPrice = 0;
        }

        // Tính mealOrders nếu có
        if (mealOrders && mealOrders.length > 0) {
          const mealPrice = mealOrders.reduce(
            (sum, meal) => sum + (meal.price ?? 0) * (meal.quantity ?? 1),
            0,
          );
          finalSeatPrice += mealPrice;
        }
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const availableSeats = await tx.seat.findMany({
          where: {
            id: { in: seatIds },
            flightId,
            isBooked: false,
          },
        });

        if (availableSeats.length !== seatIds.length) {
          return {
            resultCode: '02',
            resultMessage: 'Một hoặc nhiều ghế đã được đặt trước.',
          };
        }

        const booking = await tx.booking.create({
          data: {
            passengerId,
            flightId,
            bookingCode: bookingCode || `BK-${nowDecimal()}`,
            seatClass: (seatClass as SeatType) ?? SeatType.ECONOMY,
            seatNo: seatNo || availableSeats.map((s) => s.seatNumber).join(','),
            seatPrice: finalSeatPrice,
            bookingTime: bookingTime || nowDecimal(),
            status: 'PENDING',
            seatId: seatIds.length === 1 ? seatIds[0] : null,
            // flight : flightId,
          },
        });

        await tx.seat.updateMany({
          where: { id: { in: seatIds } },
          data: { isBooked: true, isAvailable: false },
        });

        // Tạo ticket
        const tickets = await Promise.all(
          availableSeats.map((seat) =>
            tx.ticket.create({
              data: {
                ticketNo: `T-${Date.now()}-${seat.id}`,
                passengerId,
                flightId,
                bookingId: booking.id,
              },
            }),
          ),
        );

        return {
          resultCode: '00',
          resultMessage: 'Đặt chỗ thành công.',
          data: { booking, tickets },
        };
      });

      return result;
    } catch (error) {
      console.error('Lỗi khi đặt chỗ:', error);
      throw error;
    }
  }

  async createTicket(data: {
    ticketNo: string;
    passengerId: string;
    flightId: number;
  }) {
    return this.prisma.ticket.create({
      data: {
        ticketNo: data.ticketNo,
        passengerId: data.passengerId,
        flightId: data.flightId,
      },
    });
  }

  async searchBooking(dto: SearchBookingDto) {
    try {
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
          is: {
            ...(from && { departureAirport: from.toUpperCase() }),
            ...(to && { arrivalAirport: to.toUpperCase() }),
            ...(flightNo && { flightNo: { contains: flightNo.toUpperCase() } }),
            ...(aircraftCode && { aircraftCode: aircraftCode.toUpperCase() }),
            // ...(status && { status: status.toUpperCase() }),
            ...(terminal && { terminal: { contains: terminal.toUpperCase() } }),
            ...(minPrice !== undefined &&
              cabinClass === 'ECONOMY' && { priceEconomy: { gte: minPrice } }),
            ...(maxPrice !== undefined &&
              cabinClass === 'ECONOMY' && { priceEconomy: { lte: maxPrice } }),
            ...(minPrice !== undefined &&
              cabinClass === 'BUSINESS' && {
                priceBusiness: { gte: minPrice },
              }),
            ...(maxPrice !== undefined &&
              cabinClass === 'BUSINESS' && {
                priceBusiness: { lte: maxPrice },
              }),
            ...(minPrice !== undefined &&
              cabinClass === 'FIRST' && { priceFirst: { gte: minPrice } }),
            ...(maxPrice !== undefined &&
              cabinClass === 'FIRST' && { priceFirst: { lte: maxPrice } }),

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
        },
        ...(cabinClass && {
          seats: {
            type: cabinClass,
          },
        }),
        ...(status && {
          flight: {
            flightStatuses: {
              every: {
                status: status as FlightStatusType,
              },
            },
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
          seat: true,
        },
      });

      // mặc định inbound rỗng
      let inbound: (Booking & {
        flight: Flight & {
          aircraft: Aircraft;
          arrivalAirportRel: Airport;
          departureAirportRel: Airport;
        };
        seat: Seat | null;
      })[] = [];

      if (flightType === 'roundtrip' && returnDate) {
        inbound = await this.prisma.booking.findMany({
          where: {
            flight: {
              is: {
                departureAirport: to?.toUpperCase(),
                arrivalAirport: from?.toUpperCase(),
                scheduledDeparture: {
                  gte: new Prisma.Decimal(returnDate),
                  lte: new Prisma.Decimal(returnDate + 86399999),
                },
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
            seat: true,
          },
        });
      }

      console.log('outbound', outbound);
      console.log('inbound', inbound);

      return {
        resultCode: '00',
        resultMessage: 'Thành công',
        data: {
          outbound,
          inbound,
        },
      };
    } catch (error) {
      console.error('err', error);
    }
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
