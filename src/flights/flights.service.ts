import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Aircraft, Flight, Prisma, SeatType } from 'generated/prisma';
import { AirportDto, UpdateAirportDto } from './dto/create-airport.dto';
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

@Injectable()
export class FlightsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateFlightDto,
  ): Promise<BaseResponseDto<FlightResponseDto>> {
    try {
      const flightExists = await this.prisma.flight.findUnique({
        where: { flightId: data.flightId },
      });
      if (flightExists) {
        return {
          resultCode: '01',
          resultMessage: `Flight with ID ${data.flightId} already exists`,
        };
      }
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

  // async createMany(
  //   data: CreateFlightDto[],
  // ): Promise<BaseResponseDto<FlightResponseDto[]>> {
  //   try {
  //     const createdFlights: FlightResponseDto[] = [];

  //     for (const flightData of data) {
  //       const flightExists = await this.prisma.flight.findUnique({
  //         where: { flightNo: flightData.flightNo }, // nên check bằng flightNo thay vì flightId
  //       });

  //       if (flightExists) {
  //         console.warn(
  //           `Flight ${flightData.flightNo} already exists, skipping`,
  //         );
  //         continue;
  //       }

  //       const flight = await this.prisma.flight.create({
  //         data: { ...flightData },
  //       });

  //       const formattedFlight = {
  //         ...flight,
  //         scheduledArrival: flight.scheduledArrival
  //           ? new Prisma.Decimal(flight.scheduledArrival)
  //           : null,
  //         scheduledDeparture: flight.scheduledDeparture
  //           ? new Prisma.Decimal(flight.scheduledDeparture)
  //           : null,
  //       };

  //       createdFlights.push(formattedFlight);
  //     }

  //     return {
  //       resultCode: '00',
  //       resultMessage: 'Thêm nhiều chuyến bay thành công',
  //       data: createdFlights,
  //     };
  //   } catch (error) {
  //     console.error('error', error);
  //     throw error;
  //   }
  // }

  async createMany(
    data: CreateFlightDto[],
  ): Promise<BaseResponseDto<FlightResponseDto[]>> {
    try {
      const createdFlights: FlightResponseDto[] = [];

      for (const flightData of data) {
        const flightExists = await this.prisma.flight.findUnique({
          where: { flightId: flightData.flightId },
        });

        if (flightExists) {
          continue; // bỏ qua nếu flight đã tồn tại
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
          name: true,
          city: true,
          arrivals: true,
          country: true,
        },
      },
      arrivalAirportRel: {
        select: {
          code: true,
          name: true,
          city: true,
          arrivals: true,
          country: true,
        },
      },
      aircraft: {
        select: {
          code: true,
          model: true,
          range: true,
        },
      },
      seats: {
        where: {
          isAvailable: true,
          ...(cabinClass && {
            type: SeatType[cabinClass.toUpperCase() as keyof typeof SeatType],
          }),
        },
      },
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
          seats: true,
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

  async update(flightId: number, data: Partial<UpdateFlightDto>) {
    try {
      await this.findOne(flightId);

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
        gate: data.gate,
        terminal: data.terminal,
        isCancelled: data.isCancelled,
        delayMinutes: data.delayMinutes,
        delayReason: data.delayReason,
        cancellationReason: data.cancellationReason,
      };

      if (data.isCancelled || data.delayMinutes) {
        // todo
      }

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

  async delete(flightId: number) {
    try {
      const hasFlight = await this.findOne(flightId);
      if (!hasFlight) {
        return {
          resultCode: '01',
          resultMessage: `Flight with ID ${flightId} not found`,
        };
      }

      await this.prisma.flight.delete({ where: { flightId } });

      return {
        resultCode: '00',
        resultMessage: `Flight with ID ${flightId} successfully deleted`,
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
      return await this.prisma.aircraft.create({ data });
    } catch (error) {
      return { resultCode: '01', resultMessage: 'Aircraft already exists' };
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
    return { resultCode: '00', resultMessage: 'Aircraft', data: res };
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
      return await this.prisma.aircraft.delete({
        where: { code },
      });
    } catch (error) {
      return {
        resultCode: '00',
        resultMessage: `Aircraft with code ${code} not found`,
      };
    }
  }

  async getAllAirports() {
    try {
      const res = await this.prisma.airport.findMany();
      return { resultCode: '00', resultMessage: 'Airport', data: res };
    } catch (error) {
      return { resultCode: '01', resultMessage: 'Error Airport' };
    }
  }

  async createAirport(data: AirportDto) {
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
    return this.prisma.terminal.create({
      data: {
        ...createTerminalDto,
        createdAt: nowDecimal(),
        updatedAt: nowDecimal(),
      },
    });
  }

  async findAllTerminal() {
    return this.prisma.terminal.findMany({
      include: {
        airport: true,
        gates: true,
        facilities: true,
      },
    });
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

  async remove(id: string) {
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
