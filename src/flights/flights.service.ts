import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  Flight,
  FlightDiscount,
  FlightStatusType,
  FlightType,
  Prisma,
  TerminalType,
} from 'generated/prisma';
import { CreateAirportDto, UpdateAirportDto } from './dto/create-airport.dto';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { SearchFlightDto } from './dto/search.flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { CreateFlightDto } from './dto/create-flight.dto';
import { FlightResponseDto } from './dto/flight-response.dto';
import { nowDecimal } from 'src/common/helpers/format';
import {
  CreateAircraftDto,
  UpdateAircraftDto,
} from './dto/create-aircraft.dto';
import {
  CreateTerminalDto,
  UpdateTerminalDto,
} from './dto/create-terminal.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import * as QRCode from 'qrcode';
import {
  CreateFlightDiscountDto,
  CreateMultiFlightDiscountDto,
  UpdateFlightDiscountDto,
} from './dto/create-flight-discount.dto';

@Injectable()
export class FlightsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateFlightDto,
  ): Promise<BaseResponseDto<FlightResponseDto>> {
    try {
      const flight = await this.prisma.flight.create({ data: { ...data } });
      const formattedFlight = {
        ...flight,
        scheduledArrival: flight.scheduledArrival
          ? new Prisma.Decimal(flight.scheduledArrival)
          : null,
        scheduledDeparture: flight.scheduledDeparture
          ? new Prisma.Decimal(flight.scheduledDeparture)
          : null,
      };

      return {
        resultCode: '00',
        resultMessage: 'Thành công',
        data: formattedFlight,
      };
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async createMany(data: CreateFlightDto[]) {
    try {
      if (!data || data.length === 0) {
        return {
          resultCode: '05',
          resultMessage: 'No flight data provided',
          list: [],
        };
      }

      const tasks = data.map(async (item) => {
        try {
          if (!item.flightNo) {
            return {
              code: item.flightNo || '(empty)',
              errorCode: '05',
              errorMessage: 'Missing required field: flightNo',
            };
          }

          const existingAircraft = await this.prisma.aircraft.findUnique({
            where: { code: item.flightNo },
          });

          if (existingAircraft) {
            return {
              code: item.flightNo,
              errorCode: '01',
              errorMessage: `Aircraft with code ${item.flightNo} already exists`,
            };
          }

          const existingFlight = await this.prisma.flight.findUnique({
            where: { flightNo: item.flightNo },
          });

          if (existingFlight) {
            return {
              code: item.flightNo,
              errorCode: '02',
              errorMessage: `Flight ${item.flightNo} already exists`,
            };
          }

          await this.prisma.flight.create({
            data: { ...item },
          });

          return {
            code: item.flightNo,
            errorCode: '00',
            errorMessage: 'Flight created successfully',
          };
        } catch (error) {
          console.error(` Error creating flight ${item.flightNo}:`, error);
          return {
            code: item.flightNo,
            errorCode: '99',
            errorMessage: `Unexpected error while creating flight ${item.flightNo}`,
          };
        }
      });

      const results = await Promise.all(tasks);

      const hasError = results.some((r) => r.errorCode !== '00');

      return {
        resultCode: hasError ? '01' : '00',
        resultMessage: hasError
          ? 'Some flights failed to create'
          : 'All flights created successfully',
        list: results,
      };
    } catch (error) {
      console.error(' Batch creation failed:', error);
      return {
        resultCode: '99',
        resultMessage: 'Critical error during batch flight creation',
        list: [],
      };
    }
  }

  async searchFlights(dto: SearchFlightDto) {
    const {
      from,
      to,
      departDate,
      returnDate,
      flightType,
      aircraftCode,
      status,
      minPrice,
      maxPrice,
      terminal,
      flightNo,
      minDelayMinutes,
      maxDelayMinutes,
      includeCancelled = false,
    } = dto;

    // Build where condition cho outbound flights
    const outboundWhere: Prisma.FlightWhereInput = {
      // Điều kiện cơ bản
      ...(from && { departureAirport: from.toUpperCase() }),
      ...(to && { arrivalAirport: to.toUpperCase() }),

      // Các điều kiện optional từ dữ liệu của bạn
      ...(flightNo && { flightNo: { contains: flightNo.toUpperCase() } }),
      ...(flightType && { flightType: flightType.toUpperCase() as FlightType }),
      ...(status && { status: status.toUpperCase() }),
      ...(aircraftCode && { aircraftCode: aircraftCode.toUpperCase() }),
      // ...(gate && { gate: { contains: gate.toUpperCase() } }),
      // ...(terminal && { terminal: { contains: terminal.toUpperCase() } }),

      // Điều kiện price
      ...(minPrice !== undefined && { priceEconomy: { gte: minPrice } }),
      ...(maxPrice !== undefined && { priceEconomy: { lte: maxPrice } }),
      ...(minPrice !== undefined && { priceBusiness: { gte: minPrice } }),
      ...(maxPrice !== undefined && { priceBusiness: { lte: maxPrice } }),
      ...(minPrice !== undefined && { priceFirst: { gte: minPrice } }),
      ...(maxPrice !== undefined && { priceFirst: { lte: maxPrice } }),

      // Điều kiện delay minutes
      ...(minDelayMinutes !== undefined && {
        delayMinutes: { gte: minDelayMinutes },
      }),
      ...(maxDelayMinutes !== undefined && {
        delayMinutes: { lte: maxDelayMinutes },
      }),

      // Điều kiện cancelled
      ...(!includeCancelled && { isCancelled: false }),

      // Điều kiện ngày nếu có
      ...(departDate && {
        scheduledDeparture: {
          gte: new Prisma.Decimal(departDate),
          lte: new Prisma.Decimal(departDate + 86399999),
        },
      }),
    };

    // Include các relation
    const includeRelations: Prisma.FlightInclude = {
      departureAirportRel: {
        select: {
          code: true,
        },
      },
      arrivalAirportRel: {
        select: {
          code: true,
        },
      },
      aircraft: {
        select: {
          code: true,
        },
      },
      // seats: {
      //   where: {
      //     isAvailable: true,
      //     ...(cabinClass && {
      //       type: SeatType[cabinClass.toUpperCase() as keyof typeof SeatType],
      //     }),
      //   },
      // },
    };

    // Tìm outbound flights
    const outbound = await this.prisma.flight.findMany({
      where: outboundWhere,
      include: includeRelations,
      orderBy: {
        scheduledDeparture: 'asc',
      },
    });

    // Nếu là oneway hoặc không có returnDate
    if (flightType === 'oneway' || !returnDate) {
      return {
        resultCode: '00',
        resultMessage: 'Thành công',
        data: {
          outbound: outbound,
          inbound: null,
        },
      };
    }

    // Tìm inbound flights cho roundtrip
    const inboundWhere: Prisma.FlightWhereInput = {
      ...outboundWhere,
      departureAirport: to.toUpperCase(),
      arrivalAirport: from.toUpperCase(),
      ...(returnDate && {
        scheduledDeparture: {
          gte: new Prisma.Decimal(returnDate),
          lte: new Prisma.Decimal(returnDate + 86399999),
        },
      }),
    };

    const inbound = await this.prisma.flight.findMany({
      where: inboundWhere,
      include: includeRelations,
      orderBy: {
        scheduledDeparture: 'asc',
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Thành công',
      data: {
        outbound: outbound ? inbound : [],
        inbound: inbound,
      },
    };
  }

  async findAll(): Promise<BaseResponseDto<FlightResponseDto>> {
    try {
      const flights = await this.prisma.flight.findMany({
        include: {
          aircraft: true,
          departureAirportRel: true,
          arrivalAirportRel: true,
          meals: {
            select: { id: true },
          },
          flightStatuses: true,
          _count: {
            select: {
              meals: true,
              bookings: true,
              gateAssignments: true,
              flightStatuses: true,
              seats: true,
            }, // đếm số seats
          },
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Thành công',
        list: flights,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: 'Lỗi hệ thống',
      };
    }
  }

  async findOne(flightId: number): Promise<BaseResponseDto<Flight>> {
    const flight = await this.prisma.flight.findUnique({
      where: { flightId: flightId },
      include: {
        aircraft: true,
        arrivalAirportRel: true,
        departureAirportRel: true,
      },
    });

    if (!flight) {
      return {
        resultCode: '01',
        resultMessage: `Flight with ID ${flightId} not found`,
      };
    }

    return {
      resultCode: '00',
      resultMessage: `Flight with ID ${flightId} is found`,
      data: flight,
    };
  }

  async findFlightInfo(flightId: number): Promise<BaseResponseDto<Flight>> {
    const flight = await this.prisma.flight.findUnique({
      where: { flightId: flightId },
      include: {
        aircraft: true,
        arrivalAirportRel: true,
        departureAirportRel: true,
        meals: {
          select: {
            mealId: true,
            flightId: true,
            meal: true,
          },
        },
        seats: true,
        _count: {
          select: {
            seats: true,
            meals: true,
          },
        },
        flightStatuses: true,
      },
    });

    if (!flight) {
      return { resultCode: '01', resultMessage: `Flight not found` };
    }

    return {
      resultCode: '00',
      resultMessage: `Flight with ID ${flightId} is found`,
      data: {
        ...flight,
      },
    };
  }

  async updateFlight(flightId: number, data: Partial<UpdateFlightDto>) {
    try {
      const hasFlight = await this.findOne(flightId);
      if (!hasFlight) {
        return {
          resultCode: '01',
          resultMessage: 'No flight',
        };
      }
      const updateData = {
        flightNo: data.flightNo,
        flightType: data.flightType,
        departureAirport: data.departureAirport,
        arrivalAirport: data.arrivalAirport,
        status: data.status,
        aircraftCode: data.aircraftCode,
        actualDeparture: data.actualDeparture
          ? new Prisma.Decimal(data.actualDeparture)
          : undefined,
        actualArrival: data.actualArrival
          ? new Prisma.Decimal(data.actualArrival)
          : undefined,
        priceEconomy: data.priceEconomy,
        priceBusiness: data.priceBusiness,
        priceFirst: data.priceFirst,
        gateId: data.gateId,
        terminal: data.terminal,
        isCancelled: data.isCancelled,
        delayMinutes: data.delayMinutes,
        delayReason: data.delayReason,
        cancellationReason: data.cancellationReason,
      };

      // if (data.isCancelled || data.delayMinutes) {
      //   // todo
      // }

      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined),
      );

      await this.prisma.flight.update({
        where: { flightId },
        data: filteredData,
      });

      return {
        resultCode: '00',
        resultMessage: 'Đã update toàn bộ chuyến bay thành công',
      };
    } catch (error) {
      console.error('errr', error);
      throw error;
    }
  }

  async deleteAll() {
    try {
      await this.prisma.flight.deleteMany({});
      return {
        resultCode: '00',
        resultMessage: 'Đã xoá toàn bộ chuyến bay thành công',
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: error.message || 'Xoá toàn bộ flights thất bại',
      };
    }
  }

  async deleteManyFlightIds(ids: number[]) {
    try {
      console.log('ids', ids);
      if (typeof ids === 'string') {
        try {
          ids = JSON.parse(ids);
        } catch {
          ids = [];
        }
      }
      if (!ids || ids.length === 0) {
        return {
          resultCode: '01',
          resultMessage: 'Không có chuyến bay nào được chọn',
        };
      }
      const validIds = ids.filter((id) => typeof id === 'number');

      if (validIds.length === 0) {
        return {
          resultCode: '01',
          resultMessage: 'Không có chuyến bay hợp lệ để xoá',
        };
      }

      await Promise.all(
        validIds.map((id: number) =>
          this.prisma.flight.deleteMany({ where: { flightId: id } }),
        ),
      );

      return {
        resultCode: '00',
        resultMessage: 'Đã xoá các chuyến bay được chọn thành công',
      };
    } catch (error) {
      console.error('err', error);
      return {
        resultCode: '99',
        resultMessage: error.message || 'Xoá các chuyến bay thất bại',
      };
    }
  }

  async findAllFlightWithStatus() {
    try {
      const flights = await this.prisma.flight.findMany({
        select: {
          flightId: true,
          flightNo: true,
          flightStatuses: true,
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Lấy danh sách ID chuyến bay thành công',
        list: flights,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: error.message || 'Xoá toàn bộ flights thất bại',
      };
    }
  }

  async findAllMainInfoFlight() {
    try {
      const flights = await this.prisma.flight.findMany({
        select: {
          flightId: true,
          flightNo: true,
          aircraftCode: true,
          arrivalAirport: true,
          departureAirport: true,
          gate: {
            select: {
              id: true,
            },
          },
          priceBusiness: true,
          priceEconomy: true,
          priceFirst: true,
          flightType: true,
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Lấy danh sách chuyến bay thành công',
        list: flights,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: error.message || 'Xoá toàn bộ flights thất bại',
      };
    }
  }

  async cancelFlight(flightId: number) {
    try {
      const existingFlight = await this.prisma.flight.findUnique({
        where: { flightId },
        include: { flightStatuses: true },
      });

      if (!existingFlight) {
        return {
          resultCode: '01',
          resultMessage: 'Flight not found!!!',
        };
      }

      await this.prisma.flight.update({
        where: { flightId },
        data: { isCancelled: true },
      });

      if (
        existingFlight.flightStatuses &&
        existingFlight.flightStatuses.length > 0
      ) {
        const latestStatusId = existingFlight.flightStatuses[0].id;

        await this.prisma.flightStatus.update({
          where: { id: latestStatusId },
          data: { status: 'CANCELLED' },
        });
      } else {
        return {
          resultCode: '02',
          resultMessage: 'Flight Status not found!!!',
        };
      }

      return {
        resultCode: '00',
        resultMessage: 'Flight cancelled successfully!',
      };
    } catch (error) {
      console.error(' Cancel flight error:', error);
      return {
        resultCode: '99',
        resultMessage: 'Internal server error!',
        error: error.message,
      };
    }
  }

  async createAircraft(data: CreateAircraftDto) {
    try {
      const res = await this.prisma.aircraft.create({ data });
      return {
        resultCode: '00',
        resultMessage: 'Aircraft creaty success!!!',
        data: res,
      };
    } catch (error) {
      return { resultCode: '01', resultMessage: 'Aircraft already exists' };
    }
  }

  async createBatchAircraft(createBatchAircraftDto: CreateAircraftDto[]) {
    try {
      if (!createBatchAircraftDto || createBatchAircraftDto.length === 0) {
        return {
          resultCode: '05',
          resultMessage: 'No aircraft data provided',
          data: [],
        };
      }

      const tasks = createBatchAircraftDto.map(async (aircraftData) => {
        try {
          if (
            !aircraftData.code ||
            !aircraftData.model ||
            !aircraftData.range
          ) {
            return {
              code: aircraftData.code || '(empty)',
              errorCode: '05',
              errorMessage: 'Missing required fields',
            };
          }

          const duplicateAircraftCode = await this.prisma.aircraft.findUnique({
            where: { code: aircraftData.code },
          });

          if (duplicateAircraftCode) {
            return {
              code: aircraftData.code,
              errorCode: '01',
              errorMessage: `Aircraft with code ${aircraftData.code} already exists`,
            };
          }

          await this.prisma.aircraft.create({ data: aircraftData });

          return {
            resultCode: '00',
            resultMessage: 'Aircraft created successfully',
            code: aircraftData.code,
          };
        } catch (error) {
          return {
            code: aircraftData.code,
            errorCode: '02',
            errorMessage: `Failed to create aircraft ${aircraftData.code}`,
          };
        }
      });

      const results = await Promise.all(tasks);

      return {
        resultCode: '00',
        resultMessage: 'Batch aircraft creation completed',
        list: results,
      };
    } catch (error) {
      return {
        resultCode: '09',
        resultMessage: 'Unexpected error: ' + error,
        data: [],
      };
    }
  }

  async createBoardingPass(data: {
    ticketId: number;
    flightId: number;
    issuedAt: number; // hoặc Decimal
    gateId: string;
    boardingTime: number; // hoặc Decimal
  }) {
    return this.prisma.boardingPass.create({
      data: {
        ticketId: data.ticketId,
        flightId: data.flightId,
        issuedAt: data.issuedAt,
        gateId: data.gateId,
        // gate: data.gate,
        // boardingTime: data.boardingTime,
      },
    });
  }

  async createTicket(data: {
    ticketNo: string;
    passengerId: string;
    flightId: number;
    seatClass: string;
    seatNo: string;
    bookedAt: number; // hoặc Decimal
  }) {
    return this.prisma.ticket.create({
      data: {
        ticketNo: data.ticketNo,
        passengerId: data.passengerId,
        flightId: data.flightId,
        // seatClass: data.seatClass,
        // seatNo: data.seatNo,
        // bookedAt: data.bookedAt,
      },
    });
  }

  async findAllTicket(): Promise<BaseResponseDto<TicketResponseDto>> {
    const tickets = await this.prisma.ticket.findMany({
      include: {
        boardingPass: true,
        baggage: true,
        passenger: {
          omit: {
            isEmailVerified: true,
            lastLoginDate: true,
          },
        },
        flight: {
          omit: {
            cancellationReason: true,
            delayReason: true,
            delayMinutes: true,
          },
        },
      },
    });
    const mapped = tickets.map((t) => ({
      ...t,
      // bookedAt: Number(t.),
      flight: t.flight
        ? {
            ...t.flight,
          }
        : null,
      passenger: t.passenger
        ? {
            ...t.passenger,
            id: t.passenger.id,
            fullName: t.passenger.fullName,
            email: t.passenger.email,
            phone: t.passenger.phone,
            passport: t.passenger.passport,
            role: t.passenger.role,
            status: t.passenger.status,
            otpCode: t.passenger.otpCode ?? undefined, // <-- chuyển null → undefined
            otpExpire: t.passenger.otpExpire?.toNumber(),
          }
        : null,
      boardingPass: t.boardingPass
        ? {
            ...t.boardingPass,
            // seatNo: t.seatNo,
            issuedAt: Number(t.boardingPass.issuedAt),
            // boardingTime: Number(t.boardingPass.boardingTime),
          }
        : null,
      baggage: t.baggage.map((b) => ({
        ...b,
        checkedAt: Number(b.checkedAt),
        weight: Number(b.weight),
      })),
    }));
    return {
      resultCode: '00',
      resultMessage: 'Ticket list success !!',
      list: mapped,
    };
  }

  async findTicketByPassengerID(
    id: string,
  ): Promise<BaseResponseDto<TicketResponseDto>> {
    // Lấy danh sách ticket của hành khách
    try {
      const tickets = await this.prisma.ticket.findMany({
        where: { passengerId: id },
        include: {
          flight: true,
          boardingPass: true,
          payments: true,
        },
      });

      // Nếu không có vé nào
      if (!tickets || tickets.length === 0) {
        return {
          resultCode: '01',
          resultMessage: 'No tickets found for this passenger.',
          list: [],
        };
      }

      // 2️Cập nhật mã QR cho từng vé (chỉ khi chưa có)
      for (const t of tickets) {
        // chỉ sinh QR mới nếu chưa có
        if (!t.qrCodeImage) {
          const qrData = `http://localhost:5173/ticket/${t.id}/verify`;
          const qrCodeImage = await QRCode.toDataURL(qrData);

          await this.prisma.ticket.update({
            where: { id: t.id },
            data: { qrCodeImage },
          });
        }
      }

      // 3 Lấy lại vé (để có cả mã QR)
      const updatedTickets = await this.prisma.ticket.findMany({
        where: { passengerId: id },
        include: {
          flight: {
            include: {
              flightStatuses: {
                select: {
                  id: true,
                  flightId: true,
                  status: true,
                },
              },
            },
          },
          passenger: true,
          boardingPass: true,
        },
      });

      // 4️Map dữ liệu ra DTO
      const mapped = updatedTickets.map((t) => ({
        ...t,
        // bookedAt: Number(t.bookedAt),
        flight: t.flight
          ? {
              ...t.flight,

              flightStatuses: t.flight.flightStatuses.map((fs) => ({
                ...fs,
              })),
            }
          : null,
        passenger: t.passenger
          ? {
              ...t.passenger,
              id: t.passenger.id,
              fullName: t.passenger.fullName,
              email: t.passenger.email,
              phone: t.passenger.phone,
              passport: t.passenger.passport,
              role: t.passenger.role,
              status: t.passenger.status,
              otpCode: t.passenger.otpCode ?? undefined, // <-- chuyển null → undefined
              otpExpire: t.passenger.otpExpire?.toNumber(),
              lastLoginDate: t.passenger.lastLoginDate?.toNumber(),
            }
          : null,
        boardingPass: t.boardingPass
          ? {
              ...t.boardingPass,
              // seatNo: t.seatNo,
              issuedAt: Number(t.boardingPass.issuedAt),
              // boardingTime: Number(t.boardingPass.boardingTime),
            }
          : null,
      }));

      return {
        resultCode: '00',
        resultMessage: 'Ticket list success !!',
        list: mapped,
      };
    } catch (error) {
      console.error('err', error);
      return {
        resultCode: '99',
        resultMessage: 'Ticket list success !!',
        list: [],
      };
    }
  }

  async findOneTicketByPassengerID(
    id: string,
    ticketNo: string,
  ): Promise<BaseResponseDto<TicketResponseDto>> {
    try {
      const ticket = await this.prisma.ticket.findFirst({
        where: { passengerId: id, ticketNo },
        include: {
          flight: {
            include: {
              flightStatuses: true,
            },
          },
          boardingPass: true,
        },
      });

      if (!ticket) {
        return {
          resultCode: '01',
          resultMessage: 'No tickets found for this passenger.',
          list: [],
        };
      }

      // Map dữ liệu ra DTO
      const mapped: TicketResponseDto = {
        ...ticket,
        // bookedAt: Number(ticket.bookedAt),
        flight: ticket.flight
          ? {
              ...ticket.flight,
              flightStatuses:
                ticket.flight.flightStatuses?.map((fs) => ({
                  ...fs,
                })) || [],
            }
          : null,
        boardingPass: ticket.boardingPass
          ? {
              ...ticket.boardingPass,
              // seatNo: ticket.seatNo, // lấy từ ticket
              issuedAt: Number(ticket.boardingPass.issuedAt),
              // boardingTime: Number(ticket.boardingPass.boardingTime),
            }
          : null,
      };

      return {
        resultCode: '00',
        resultMessage: 'Ticket query success !!',
        list: [mapped],
      };
    } catch (error) {
      console.error('err', error);
      return {
        resultCode: '99',
        resultMessage: 'Ticket query failed !!',
        list: [],
      };
    }
  }

  async createBaggage(data: {
    ticketId: number;
    flightId: number;
    weight: number;
    status: string; // CHECKED_IN / LOADED / CLAIMED / LOST
    checkedAt: number; // hoặc Decimal
  }) {
    return this.prisma.baggage.create({
      data: {
        ticketId: data.ticketId,
        flightId: data.flightId,
        weight: data.weight,
        status: data.status,
        checkedAt: data.checkedAt,
      },
    });
  }

  async getAllAircraft() {
    const res = await this.prisma.aircraft.findMany({
      select: {
        code: true,
        model: true,
        range: true,
        flights: {
          select: {
            flightId: true,
            flightNo: true,
          },
        },
      },
    });
    return { resultCode: '00', resultMessage: 'Aircraft', list: res };
  }

  async findAircraftById(code: string) {
    const aircraft = await this.prisma.aircraft.findUnique({
      where: { code },
    });

    if (!aircraft) {
      return {
        resultCode: '00',
        resultMessage: `Aircraft with code ${code} not found`,
      };
    }

    return aircraft;
  }

  async updateAircraft(code: string, updateAircraftDto: UpdateAircraftDto) {
    try {
      return await this.prisma.aircraft.update({
        where: { code },
        data: updateAircraftDto,
      });
    } catch (error) {
      return {
        resultCode: '00',
        resultMessage: `Aircraft with code ${code} not found`,
      };
    }
  }

  async removeAircraft(code: string) {
    try {
      await this.prisma.aircraft.delete({
        where: { code },
      });
      return {
        resultCode: '00',
        resultMessage: `Aircraft with code ${code} has been delete`,
      };
    } catch (error) {
      return {
        resultCode: '09',
        resultMessage: `Aircraft with code ${code} not found`,
      };
    }
  }

  async getAllAirports() {
    try {
      const res = await this.prisma.airport.findMany();
      return { resultCode: '00', resultMessage: 'Airport', list: res };
    } catch (error) {
      return { resultCode: '01', resultMessage: 'Error Airport' };
    }
  }

  async createFlightDiscount(dto: CreateFlightDiscountDto) {
    return this.prisma.flightDiscount.create({
      data: {
        discountCodeId: dto.discountCodeId,
        flightId: dto.flightId,
        createdAt: nowDecimal(), // nếu Decimal lưu timestamp
      },
      include: {
        discountCode: true,
        flight: true,
      },
    });
  }

  async findAllFlightDiscount() {
    return this.prisma.flightDiscount.findMany({
      include: {
        discountCode: true,
        flight: true,
      },
    });
  }

  async findFlightDiscountByID(id: number) {
    return this.prisma.flightDiscount.findUnique({
      where: { id },
      include: {
        discountCode: true,
        flight: true,
      },
    });
  }

  async updateFlightDiscount(id: number, dto: UpdateFlightDiscountDto) {
    return this.prisma.flightDiscount.update({
      where: { id },
      data: {
        discountCodeId: dto.discountCodeId,
        flightId: dto.flightId,
      },
      include: {
        discountCode: true,
        flight: true,
      },
    });
  }

  async removeFlightDiscount(id: number) {
    return this.prisma.flightDiscount.delete({
      where: { id },
    });
  }

  async createBatch(dto: CreateMultiFlightDiscountDto) {
    const { flightIds, discountCodeIds } = dto;

    const created: FlightDiscount[] = [];

    for (const flightId of flightIds) {
      for (const discountCodeId of discountCodeIds) {
        try {
          const flightDiscount = await this.prisma.flightDiscount.create({
            data: {
              flightId,
              discountCodeId,
              createdAt: nowDecimal(), // lưu timestamp
            },
          });
          created.push(flightDiscount);
        } catch (err) {
          // nếu trùng unique, skip
          if (
            err?.code === 'P2002' &&
            err?.meta?.target?.includes('discountCodeId_flightId')
          ) {
            console.warn(
              `Duplicate flightDiscount: flight ${flightId}, code ${discountCodeId}`,
            );
            continue;
          } else {
            throw err;
          }
        }
      }
    }

    return created;
  }

  async getAllCode() {
    try {
      const resAirport = await this.prisma.airport.findMany({
        select: {
          code: true,
          name: true,
          city: true,
          country: true,
        },
      });
      const resAircraft = await this.prisma.aircraft.findMany({
        select: {
          code: true,
          range: true,
          model: true,
        },
      });

      const formattedResAirport = resAirport.map((a) => ({
        ...a,
        value: `${a.name} - ${a.city} - ${a.country}`,
      }));

      const formattedResAircraft = resAircraft.map((a) => ({
        ...a,
        value: `${a.range} - ${a.model}`,
      }));

      return {
        resultCode: '00',
        resultMessage: 'Success',
        data: {
          aircraft: formattedResAircraft,
          airport: formattedResAirport,
        },
      };
    } catch (error) {
      return { resultCode: '01', resultMessage: 'Error Airport' };
    }
  }

  async createBatchAirport(createBatchAirportDto: CreateAirportDto[]) {
    try {
      if (!createBatchAirportDto || createBatchAirportDto.length === 0) {
        return {
          resultCode: '05',
          resultMessage: 'No airport data provided',
          data: [],
        };
      }

      const tasks = createBatchAirportDto.map(async (airportData) => {
        try {
          if (
            !airportData.code ||
            !airportData.city ||
            !airportData.name ||
            !airportData.country
          ) {
            return {
              code: airportData.code || '(empty)',
              errorCode: '05',
              errorMessage: 'Missing required fields',
            };
          }

          const duplicateAirportCode = await this.prisma.airport.findUnique({
            where: { code: airportData.code },
          });

          if (duplicateAirportCode) {
            return {
              code: airportData.code,
              errorCode: '01',
              errorMessage: `Aircraft with code ${airportData.code} already exists`,
            };
          }

          await this.prisma.airport.create({
            data: {
              ...airportData,
              createdAt: nowDecimal(),
            },
          });

          return {
            code: airportData.code,
            errorCode: '00',
            errorMessage: 'Airport created successfully',
          };
        } catch (error) {
          return {
            code: airportData.code,
            errorCode: '02',
            errorMessage: `Failed to create airport ${airportData.code}`,
          };
        }
      });

      const results = await Promise.all(tasks);

      return {
        resultCode: '00',
        resultMessage: 'Batch airport creation completed',
        list: results,
      };
    } catch (error) {
      return {
        resultCode: '09',
        resultMessage: 'Unexpected error: ' + error,
        data: [],
      };
    }
  }

  async createAirport(data: CreateAirportDto) {
    try {
      const existingAirport = await this.prisma.airport.findUnique({
        where: { code: data.code },
      });
      if (existingAirport) {
        return {
          resultCode: '01',
          resultMessage: `Airport code ${data.code} đã tồn tại`,
        };
      }

      const res = await this.prisma.airport.create({
        data: {
          code: data.code,
          name: data.name,
          city: data.city,
          country: data.country,
          createdAt: nowDecimal(),
        },
      });
      return {
        resultCode: '00',
        resultMessage: 'Thành công',
        list: res,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: 'Không thể tạo airport, xem log để biết chi tiết!',
      };
    }
  }

  async removeAirport(code: string) {
    try {
      return await this.prisma.airport.delete({
        where: { code },
      });
    } catch (error) {
      console.log('error', error);
    }
  }

  async getCityFromAirportCode() {
    const flights = await this.prisma.flight.findMany({
      select: {
        departureAirportRel: {
          select: {
            city: true,
          },
        },
        arrivalAirportRel: {
          select: {
            city: true,
          },
        },
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Danh sách code máy bay',
      list: flights,
    };
  }

  async updateAirport(code: string, updateAirportDto: UpdateAirportDto) {
    try {
      await this.prisma.airport.update({
        where: { code },
        data: {
          ...updateAirportDto,
          updatedAt: nowDecimal(),
        },
      });
      return {
        resultCode: '00',
        resultMessage: 'Success',
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: error.message,
      };
    }
  }

  async getAllAircraftBasic() {
    const res = await this.prisma.aircraft.findMany({
      select: {
        code: true,
        range: true,
        model: true,
        flights: {
          select: {
            flightNo: true,
          },
        },
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Danh sách code máy bay',
      list: res,
    };
  }

  async getSeatsByAircraftId(aircraftId: string) {
    const res = await this.prisma.flight.findMany({
      where: { aircraftCode: aircraftId },
      select: {
        flightId: true,
        flightNo: true,
        seats: {
          select: {
            id: true,
            seatRow: true,
            seatNumber: true,
            type: true,
            isBooked: true,
          },
        },
      },
    });

    return { resultCode: '00', resultMessage: 'Danh sách ghế', data: res };
  }

  async creatManyTerminal(dto: CreateTerminalDto[]) {
    try {
      const codes = dto.map((t) => t.code);

      const existing = await this.prisma.terminal.findMany({
        where: {
          code: { in: codes },
        },
        select: { code: true },
      });

      if (existing.length > 0) {
        return {
          resultCode: '01',
          resultMessage: `Failed create. Duplicate codes: ${existing
            .map((e) => e.code)
            .join(', ')}`,
        };
      }
      const res = await this.prisma.terminal.createMany({
        data: dto.map((t) => ({
          ...t,
          type: t.type as TerminalType, // ép về enum Prisma
          createdAt: nowDecimal(),
          updatedAt: nowDecimal(),
        })),
        skipDuplicates: true,
      });
      return {
        resultCode: '00',
        resultMessage: 'Success create many terminal',
        list: res,
      };
    } catch (error) {
      console.error('e', error);
      throw error;
    }
  }

  async findAllTerminal() {
    const res = await this.prisma.terminal.findMany({
      include: {
        airport: true,
        gates: {
          include: {
            assignments: true,
          },
        },

        facilities: true,
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Success find many terminal',
      list: res,
    };
  }

  async createFlightStatus(data: {
    flightId: number;
    status: string;
    description?: string;
  }) {
    const res = await this.prisma.flightStatus.create({
      data: {
        flightId: data.flightId,
        status: data.status as FlightStatusType,
        description: data.description,
        updatedAt: nowDecimal(),
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Create flight status success',
      data: res,
    };
  }

  async updateFlightStatus(id: number, data: { status?: string }) {
    try {
      const res = await this.prisma.flightStatus.findFirst({
        where: { id },
      });
      if (!res) {
        return {
          resultCode: '01',
          resultMessage: 'Update flight status not found',
        };
      }
      await this.prisma.flightStatus.update({
        where: { id },
        data: { status: data.status as FlightStatusType },
      });
      return {
        resultCode: '00',
        resultMessage: 'Update flight status success',
      };
    } catch (error) {
      console.error('errr', error);
    }
  }

  async findOneTerminal(id: string) {
    const terminal = await this.prisma.terminal.findUnique({
      where: { id },
      include: {
        airport: true,
        gates: true,
        facilities: true,
      },
    });

    if (!terminal) {
      return {
        resultCode: '00',
        resultMessage: `Terminal with id ${id} not found`,
      };
    }
    return { resultCode: '00', resultMessage: 'Success' };
  }

  async updateTerminal(id: string, updateTerminalDto: UpdateTerminalDto) {
    try {
      return await this.prisma.terminal.update({
        where: { id },
        data: {
          ...updateTerminalDto,
          updatedAt: nowDecimal(),
        },
      });
    } catch (error) {
      throw error;
      // throw new NotFoundException(`Terminal with id ${id} not found`);
    }
  }

  async removeTerminal(id: string) {
    try {
      return await this.prisma.terminal.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
      // throw new NotFoundException(`Terminal with id ${id} not found`);
    }
  }

  async findByAirportCode(airportCode: string) {
    return this.prisma.terminal.findMany({
      where: { airportId: airportCode },
      include: {
        gates: true,
        facilities: true,
      },
    });
  }
}
