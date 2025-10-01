import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  Aircraft,
  Facility,
  FacilityType,
  Flight,
  Prisma,
  SeatType,
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
import {
  CreateFacilityDto,
  UpdateFacilityDto,
} from './dto/create-facility.dto';

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

  async createMany(
    data: CreateFlightDto[],
  ): Promise<BaseResponseDto<FlightResponseDto[]>> {
    try {
      const createdFlights: FlightResponseDto[] = [];

      for (const flightData of data) {
        const hasAircraft = await this.prisma.aircraft.findUnique({
          where: { code: flightData.aircraftCode },
        });
        if (!hasAircraft) {
          return {
            resultCode: '01',
            resultMessage: 'No aircraft',
          };
        }

        const hasTerminal = await this.prisma.terminal.findUnique({
          where: { code: flightData.terminal },
        });
        if (!hasTerminal) {
          return {
            resultCode: '01',
            resultMessage: 'No Terminal',
          };
        }

        const flightExists = await this.prisma.flight.findUnique({
          where: { flightNo: flightData.flightNo },
        });

        if (flightExists) {
          continue;
        }

        const flight = await this.prisma.flight.create({
          data: { ...flightData },
        });

        const formattedFlight = {
          ...flight,
          scheduledArrival: flight.scheduledArrival
            ? new Prisma.Decimal(flight.scheduledArrival)
            : null,
          scheduledDeparture: flight.scheduledDeparture
            ? new Prisma.Decimal(flight.scheduledDeparture)
            : null,
        };

        createdFlights.push(formattedFlight);
      }

      return {
        resultCode: '00',
        resultMessage: 'Tạo nhiều flight thành công',
        data: createdFlights,
      };
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async searchFlights(dto: SearchFlightDto) {
    const {
      from,
      to,
      departDate,
      returnDate,
      flightType,
      cabinClass,
      aircraftCode,
      status,
      minPrice,
      maxPrice,
      gate,
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
      ...(flightType && { flightType: flightType.toLowerCase() }),
      ...(status && { status: status.toUpperCase() }),
      ...(aircraftCode && { aircraftCode: aircraftCode.toUpperCase() }),
      // ...(gate && { gate: { contains: gate.toUpperCase() } }),
      ...(terminal && { terminal: { contains: terminal.toUpperCase() } }),

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
        meals: true,
        seats: true,
        flightStatuses: true,
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

  async cancelFlight(flightId: number) {
    return this.prisma.flight.update({
      where: { flightId },
      data: { isCancelled: true, status: 'CANCELLED' },
    });
  }

  async createAircraft(data: CreateAircraftDto) {
    try {
      const res = await this.prisma.aircraft.create({ data });
      return {
        resultCode: '01',
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
            code: aircraftData.code,
            errorCode: '00',
            errorMessage: 'Aircraft created successfully',
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

  async getAllCode() {
    try {
      const resAirport = await this.prisma.airport.findMany({
        select: {
          code: true,
        },
      });
      const resAircraft = await this.prisma.aircraft.findMany({
        select: {
          code: true,
        },
      });
      return {
        resultCode: '00',
        resultMessage: 'Success',
        data: {
          aircraft: resAircraft,
          airport: resAirport,
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
      return {
        resultCode: '99',
        resultMessage: error,
      };
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
      return await this.prisma.airport.update({
        where: { code },
        data: {
          ...updateAirportDto,
          updatedAt: nowDecimal(),
        },
      });
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

  async createTerminal(createTerminalDto: CreateTerminalDto) {
    const hasCreate = await this.prisma.terminal.findUnique({
      where: {
        code: createTerminalDto.code,
      },
    });
    if (hasCreate) {
      return {
        resultCode: '01',
        resultMessage: 'Failed create',
      };
    }
    const res = await this.prisma.terminal.create({
      data: {
        ...createTerminalDto,
        createdAt: nowDecimal(),
        updatedAt: nowDecimal(),
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Success create',
      data: res,
    };
  }

  async creatManyTerminal(dto: CreateTerminalDto[]) {
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
        status: data.status,
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

  async updateFlightStatus(
    id: number,
    data: { status?: string; description?: string },
  ) {
    const res = await this.prisma.flightStatus.update({
      where: { id },
      data: {
        ...data,
        updatedAt: nowDecimal(),
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Update flight status success',
      data: res,
    };
  }

  async findAllFlightStatus() {
    const res = await this.prisma.flightStatus.findMany({
      include: { flight: true },
    });
    return {
      resultCode: '00',
      resultMessage: 'Get all flight statuses success',
      data: res,
    };
  }

  async createFacility(data: CreateFacilityDto) {
    await this.prisma.facility.create({
      data: {
        ...data,
        createdAt: nowDecimal(),
        updatedAt: nowDecimal(),
      },
      include: {
        terminal: {
          include: {
            airport: true,
          },
        },
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Create facility thành công!',
    };
  }

  async deleteFacility(id: string) {
    await this.prisma.facility.delete({
      where: { id },
    });
    return {
      resultCode: '00',
      resultMessage: 'Delete facility thành công!',
    };
  }

  async getFacilitiesByTerminal(terminalId: string): Promise<Facility[]> {
    return this.prisma.facility.findMany({
      where: { terminalId },
      include: {
        terminal: true,
      },
    });
  }

  async getFacilitiesByType(type: FacilityType): Promise<Facility[]> {
    return this.prisma.facility.findMany({
      where: { type },
      include: {
        terminal: {
          include: {
            airport: true,
          },
        },
      },
    });
  }

  async getFacilities(params: {
    skip?: number;
    take?: number;
    where?: Prisma.FacilityWhereInput;
    include?: Prisma.FacilityInclude;
  }): Promise<Facility[]> {
    const { skip, take, where, include } = params;
    return this.prisma.facility.findMany({
      skip,
      take,
      where,
      include: include || {
        terminal: {
          include: {
            airport: true,
          },
        },
      },
    });
  }

  async getFacilityById(id: string): Promise<Facility | null> {
    return this.prisma.facility.findUnique({
      where: { id },
      include: {
        terminal: {
          include: {
            airport: true,
          },
        },
      },
    });
  }

  async updateFacility(
    id: string,
    data: UpdateFacilityDto,
  ): Promise<BaseResponseDto<Facility>> {
    const res = await this.prisma.facility.update({
      where: { id },
      data: {
        ...data,
        updatedAt: nowDecimal(),
      },
      include: {
        terminal: {
          include: {
            airport: true,
          },
        },
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Success',
      data: res,
    };
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
