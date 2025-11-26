import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  Flight,
  FlightDiscount,
  FlightStatusType,
  FlightType,
  Prisma,
  SeatType,
  TerminalType,
} from 'generated/prisma';
import { CreateAirportDto, UpdateAirportDto } from './dto/create-airport.dto';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import {
  SearchFlightDto,
  SearchFlightFromPassengerDto,
} from './dto/search.flight.dto';
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
import { CreateDiscountDto } from './dto/create-discount.dto';
import { Decimal } from 'generated/prisma/runtime/library';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class FlightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
      // terminal,
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

  async getAvailableDates(airportCode: string) {
    const flights = await this.prisma.flight.findMany({
      where: {
        OR: [
          { departureAirport: airportCode },
          { arrivalAirport: airportCode },
        ],
      },
      select: {
        scheduledDeparture: true,
      },
    });

    // Convert Decimal -> Date -> chỉ lấy phần ngày
    const dates = flights.map((f) => {
      const num = Number(f.scheduledDeparture); // ví dụ: 20250110.123
      const str = num.toString().split('.')[0]; // "20250110"

      const year = Number(str.slice(0, 4));
      const month = Number(str.slice(4, 6)) - 1; // month index 0–11
      const day = Number(str.slice(6, 8));

      const d = new Date(year, month, day);

      const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' }); // "Tue"
      const dateShort = d.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      }); // "18 Nov"

      return {
        day: dayShort,
        date: dateShort,
        year: year,
      };
    });

    return {
      resultCode: '00',
      resultMessage: 'Success',
      list: dates,
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<BaseResponseDto<FlightResponseDto>> {
    try {
      const skip = (page - 1) * limit;
      const [flights, total] = await Promise.all([
        this.prisma.flight.findMany({
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                meals: true,
                seats: true,
              },
            },
          },
        }),
        this.prisma.flight.count(),
      ]);

      return {
        resultCode: '00',
        resultMessage: 'Thành công',
        list: flights,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: 'Lỗi hệ thống',
      };
    }
  }

  async findBestSellerFlightsWithDiscount(): Promise<
    BaseResponseDto<FlightResponseDto>
  > {
    try {
      const flights = await this.prisma.flight.findMany({
        where: {
          discounts: {
            some: {}, // Only flights with at least one discount
          },
        },
        include: {
          discounts: {
            include: {
              discountCode: true,
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
        orderBy: {
          bookings: {
            _count: 'desc',
          },
        },
        take: 5,
      });

      return {
        resultCode: '00',
        resultMessage: 'Top 5 best seller flights with discounts',
        list: flights,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: 'System error',
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

  async getFlightByMonth() {
    const flights = await this.prisma.flight.findMany({
      select: {
        aircraftCode: true,
        scheduledDeparture: true,
        isDomestic: true,
      },
    });

    const monthlyStats = flights.reduce(
      (acc, flight) => {
        const depTimestamp = Number(
          (flight.scheduledDeparture as Decimal).toNumber(),
        );
        const month = new Date(depTimestamp).toLocaleString('en-US', {
          month: 'short',
        });

        if (!acc[month]) {
          acc[month] = {
            month,
            domestic: 0,
            international: 0,
            aircrafts: new Set<string>(),
          };
        }

        if (flight.isDomestic) acc[month].domestic++;
        else acc[month].international++;

        acc[month].aircrafts.add(flight.aircraftCode);
        return acc;
      },
      {} as Record<
        string,
        {
          month: string;
          domestic: number;
          international: number;
          aircrafts: Set<string>;
        }
      >,
    );

    const res = await Object.values(monthlyStats).map((m) => ({
      ...m,
      aircrafts: Array.from(m.aircrafts),
    }));
    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách chuyến bay thành công',
      list: res,
    };
  }

  async createAircraft(data: CreateAircraftDto, file: Express.Multer.File) {
    try {
      const result = await this.cloudinaryService.uploadFile(file);
      const res = await this.prisma.aircraft.create({
        data: {
          ...data,
          imageAircraft: result.secure_url,
        },
      });
      return {
        resultCode: '00',
        resultMessage: 'Aircraft creaty success!!!',
        data: res,
      };
    } catch (error) {
      return { resultCode: '01', resultMessage: 'Aircraft already exists' };
    }
  }

  async createBatchAircraft(
    createBatchAircraftDto: CreateAircraftDto[],
    file: Express.Multer.File,
  ) {
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
            !aircraftData.range ||
            !aircraftData.totalSeats ||
            !aircraftData.manufacturer
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

          const result = await this.cloudinaryService.uploadFile(file);
          await this.prisma.aircraft.create({
            data: {
              ...aircraftData,
              imageAircraft: result.secure_url,
            },
          });

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
      },
    });
  }

  async findAllTicket(): Promise<BaseResponseDto<TicketResponseDto>> {
    const tickets = await this.prisma.ticket.findMany({
      include: {
        boardingPass: true,
        baggage: true,
        passenger: true,
        flight: {
          include: {
            flightStatuses: true,
          },
        },
      },
    });
    const mapped = tickets.map((t) => ({
      ...t,
      flight: t.flight
        ? {
            ...t.flight,
          }
        : null,
      passenger: t.passenger
        ? {
            ...t.passenger,
            otpCode: t.passenger.otpCode ?? undefined,
            otpExpire: t.passenger.otpExpire?.toNumber(),
            lastLoginDate: t.passenger.lastLoginDate?.toNumber(),
          }
        : null,
      boardingPass: t.boardingPass
        ? {
            ...t.boardingPass,
            issuedAt: Number(t.boardingPass.issuedAt),
          }
        : undefined,
      baggage: t.baggage
        ? {
            ...t.baggage,
            checkedAt: Number(t.baggage.checkedAt),
          }
        : undefined,
    }));

    return {
      resultCode: '00',
      resultMessage: 'Get all tickets success',
      list: mapped,
    };
  }

  async findTicketByPassengerID(
    id: string,
  ): Promise<BaseResponseDto<TicketResponseDto>> {
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

      for (const t of tickets) {
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
        select: {
          // chọn tất cả trường ở ticket bạn cần (thay đổi theo schema)
          id: true,
          ticketNo: true,
          passengerId: true,
          flightId: true,
          // relation flight + nested selects (dùng select với nested)
          flight: {
            select: {
              // kiểm tra tên trường trong schema: `id` hay `flightId`?
              flightId: true, // nếu có
              flightNo: true,
              flightType: true,
              departureAirport: true,
              arrivalAirport: true,
              scheduledDeparture: true,
              scheduledArrival: true,
              aircraftCode: true,
              // nested relation flightStatuses
              flightStatuses: {
                select: {
                  id: true,
                  // nếu DB không có flightId trong flightStatuses, ta sẽ map sau
                  flightId: true,
                  status: true,
                },
              },
              bookings: true,
              // gateId: true,
              // ... thêm các trường flight khác bạn cần
            },
          },
          boardingPass: {
            select: {
              id: true,
              issuedAt: true,
              ticket: true,
              ticketId: true,
              flightId: true,
              // ... các trường boardingPass bạn cần
            },
          },
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

  async searchFlightFromPassenger(search: SearchFlightFromPassengerDto) {
    console.log('search', search);
    const scheduledDepartureDate = search.scheduledDeparture
      ? new Decimal(search.scheduledDeparture).toNumber()
      : undefined;

    const scheduledArrivalDate = search.scheduledArrival
      ? new Decimal(search.scheduledArrival).toNumber()
      : undefined;

    const seatTypeEnum: SeatType | undefined = search.flightClass
      ? SeatType[search.flightClass.toUpperCase() as keyof typeof SeatType]
      : undefined;

    const flights = await this.prisma.flight.findMany({
      where: {
        departureAirport: search.departureAirport
          ? { contains: search.departureAirport.toLowerCase() }
          : undefined,
        arrivalAirport: search.arrivalAirport
          ? { contains: search.arrivalAirport.toLowerCase() }
          : undefined,
        scheduledDeparture: scheduledDepartureDate
          ? { gte: scheduledDepartureDate }
          : undefined,
        scheduledArrival: scheduledArrivalDate
          ? { lte: scheduledArrivalDate }
          : undefined,
      },
      include: {
        seats: {
          select: {
            id: true,
            seatNumber: true,
            isAvailable: true,
            isBooked: true,
          },
        },
        flightStatuses: true,
      },
      take: 10,
      skip: 0,
      // orderBy: {
      //   OR: [
      //     { scheduledDeparture: { gte: scheduledDepartureDate } },
      //     { scheduledArrival: { gte: scheduledArrivalDate } },
      //   ],
      // },
    });

    // Filter by status and calculate available seats
    const mappedFlights = flights
      .filter((f) => {
        if (f.flightStatuses && f.flightStatuses.length > 0) {
          // Sort by updatedAt desc to get latest status
          const sortedStatuses = f.flightStatuses.sort(
            (a, b) => Number(b.updatedAt) - Number(a.updatedAt),
          );
          const latestStatus = sortedStatuses[0].status;
          const excludedStatuses = [
            'ON_BOARD',
            'FINISHED',
            'ARRIVED',
            'CANCELLED',
          ];
          // Check if latestStatus is in excludedStatuses
          // Cast to string to compare if needed, or rely on enum
          if (excludedStatuses.includes(latestStatus as string)) {
            return false;
          }
        }
        return true;
      })
      .map((f) => {
        const availableSeatsCount = f.seats.filter(
          (s) => !s.isBooked && s.isAvailable,
        ).length;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { seats, flightStatuses, ...rest } = f;

        return {
          ...rest,
          availableSeats: availableSeatsCount,
        };
      });

    // Filter flights with enough seats
    const filteredFlights = mappedFlights.filter(
      (f) => f.availableSeats >= (search.passengers || 1),
    );

    return {
      resultCode: '00',
      resultMessage: 'Success',
      list: filteredFlights,
    };
  }

  async getFlightsByDate(airport: string, date: string) {
    const dateISO = new Date(date).toISOString().slice(0, 10);

    const flights = await this.prisma.flight.findMany({
      where: {
        OR: [{ departureAirport: airport }, { arrivalAirport: airport }],
      },
    });

    console.log('dateISO', dateISO);

    const filtered = flights.filter((f) => {
      const timestamp = Number(f.scheduledDeparture);
      const flightDate = new Date(timestamp * 1000) // *1000 vì JS Date dùng ms
        .toISOString()
        .slice(0, 10);
      console.log('flightDate', flightDate);

      return flightDate === dateISO;
    });

    flights.forEach((f) => {
      console.log('scheduledDeparture raw', f.scheduledDeparture.toString());
      console.log('Number', Number(f.scheduledDeparture));
      console.log(
        'Date',
        new Date(Number(f.scheduledDeparture) * 1000).toISOString(),
      );
    });

    return filtered;
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

  async findAircraftByCode(code: string) {
    const aircraft = await this.prisma.aircraft.findUnique({
      where: { code },
    });

    if (!aircraft) {
      return {
        resultCode: '01',
        resultMessage: `Aircraft with code ${code} not found`,
      };
    }

    return {
      resultCode: '00',
      resultMessage: `Aircraft with code ${code} has been found`,
      data: aircraft,
    };
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

  async getAllAirportIds() {
    try {
      const res = await this.prisma.airport.findMany({
        select: {
          code: true,
        },
      });
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

  async findFlightDiscountByFlightId(flightId: number) {
    const res = await this.prisma.flightDiscount.findMany({
      where: { flightId },
      include: {
        discountCode: true,
        flight: true,
      },
    });
    return res;
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

  async createDiscount(createDto: CreateDiscountDto) {
    // Kiểm tra code đã tồn tại
    const existing = await this.prisma.discountCode.findUnique({
      where: { code: createDto.code },
    });
    if (existing) {
      return {
        resultCode: '01',
        resultMessage: `Discount code ${createDto.code} already exists.`,
      };
    }

    if (
      createDto.isPercentage &&
      (!createDto.discountPercent || createDto.discountPercent <= 0)
    ) {
      return {
        resultCode: '02',
        resultMessage:
          'Discount percent must be greater than 0 when isPercentage is true.',
      };
    }

    if (
      !createDto.isPercentage &&
      (!createDto.discountAmount || createDto.discountAmount <= 0)
    ) {
      return {
        resultCode: '03',
        resultMessage:
          'Discount amount must be greater than 0 when isPercentage is false.',
      };
    }

    await this.prisma.discountCode.create({
      data: {
        code: createDto.code,
        description: createDto.description,
        discountAmount: createDto.discountAmount,
        discountPercent: createDto.discountPercent,
        isPercentage: createDto.isPercentage,
        active: createDto.active ?? true,
        usageLimit: createDto.usageLimit ?? 0,
        usedCount: 0,
        validFrom: createDto.validFrom,
        validTo: createDto.validTo,
        createdAt: nowDecimal(),
        updatedAt: nowDecimal(),
      },
    });

    return {
      resultCode: '00',
      resultMessage: `Discount code has created`,
    };
  }

  async createDiscounts(createDtos: CreateDiscountDto[]) {
    const results = await Promise.all(
      createDtos.map(async (dto) => {
        const existing = await this.prisma.discountCode.findUnique({
          where: { code: dto.code },
        });

        if (existing) {
          return {
            code: dto.code,
            resultCode: '01',
            resultMessage: `Discount code ${dto.code} already exists.`,
          };
        }

        if (
          dto.isPercentage &&
          (!dto.discountPercent || dto.discountPercent <= 0)
        ) {
          return {
            code: dto.code,
            resultCode: '02',
            resultMessage:
              'Discount percent must be > 0 when isPercentage is true.',
          };
        }

        if (
          !dto.isPercentage &&
          (!dto.discountAmount || dto.discountAmount <= 0)
        ) {
          return {
            code: dto.code,
            resultCode: '03',
            resultMessage:
              'Discount amount must be > 0 when isPercentage is false.',
          };
        }

        await this.prisma.discountCode.create({
          data: {
            code: dto.code,
            description: dto.description,
            discountAmount: dto.discountAmount,
            discountPercent: dto.discountPercent,
            isPercentage: dto.isPercentage,
            active: dto.active ?? true,
            usageLimit: dto.usageLimit ?? 0,
            usedCount: 0,
            validFrom: dto.validFrom,
            validTo: dto.validTo,
            createdAt: nowDecimal(),
            updatedAt: nowDecimal(),
          },
        });

        return {
          resultCode: '00',
          resultMessage: 'Discount code created successfully',
        };
      }),
    );

    return results;
  }

  async getAllDiscounts() {
    const res = await this.prisma.discountCode.findMany();
    return {
      resultCode: '00',
      resultMessage: `Discount code has found`,
      list: res,
    };
  }

  async getDiscountById(id: number) {
    const res = await this.prisma.discountCode.findUnique({ where: { id } });
    return {
      resultCode: '00',
      resultMessage: `Discount code with ID has found`,
      data: res,
    };
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

  async createBatchFlightDiscount(dto: CreateMultiFlightDiscountDto) {
    const { flightIds, discountCodeIds } = dto;

    const created: FlightDiscount[] = [];

    for (const flightId of flightIds) {
      for (const discountCodeId of discountCodeIds) {
        try {
          const flightDiscount = await this.prisma.flightDiscount.create({
            data: {
              flightId,
              discountCodeId,
              createdAt: nowDecimal(),
            },
          });
          created.push(flightDiscount);
        } catch (err) {
          console.error('err', err);
          throw err;
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
      console.error('err', error);
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
