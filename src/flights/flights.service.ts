import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Aircraft, Flight, Prisma, SeatType } from 'generated/prisma';
import { AirportDto } from './dto/create-airport.dto';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { SearchFlightDto } from './dto/SearchFlightDto';
import { Decimal } from 'generated/prisma/runtime/library';

@Injectable()
export class FlightsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Flight, 'flightId'>,
  ): Promise<BaseResponseDto<Partial<Flight>>> {
    try {
      const flight = await this.prisma.flight.create({ data: { ...data } });
      return {
        resultCode: '00',
        resultMessage: 'Thành công',
        data: flight,
      };
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async searchFlights(dto: SearchFlightDto) {
    const { from, to, departDate, returnDate, flightType } = dto;
    if (!departDate) {
      throw new Error('departDate is required');
    }
    const departDateObj = new Date(departDate);

    const departStart = new Decimal(departDateObj.setHours(0, 0, 0, 0));
    const departEnd = new Decimal(departDateObj.setHours(23, 59, 59, 999));

    const outbound = await this.prisma.flight.findMany({
      where: {
        departureAirport: from,
        arrivalAirport: to,
        scheduledDeparture: {
          gte: departStart,
          lte: departEnd,
        },
      },
      include: {
        seats: true,
      },
    });

    if (flightType === 'oneway') return { outbound };
    if (!returnDate) {
      throw new Error('returnDate is required');
    }
    const returnDateObj = new Date(returnDate);
    const returnStart = new Decimal(returnDateObj.setHours(0, 0, 0, 0));
    const returnEnd = new Decimal(returnDateObj.setHours(23, 59, 59, 999));

    const inbound = await this.prisma.flight.findMany({
      where: {
        departureAirport: to,
        arrivalAirport: from,
        scheduledDeparture: {
          gte: returnStart,
          lte: returnEnd,
        },
      },
      include: {
        seats: true,
      },
    });

    return { outbound, inbound };
  }

  async findAll() {
    try {
      const flights = await this.prisma.flight.findMany({
        include: {
          aircraft: true,
          departureAirportRel: true,
          arrivalAirportRel: true,
          meals: {
            select: { id: true },
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

  // async generateSeats(flightId: number) {
  //   const flight = await this.prisma.flight.findUnique({
  //     where: { flightId },
  //   });
  //   if (!flight) throw new Error('Flight not found');

  //   const rows = 30;
  //   const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

  //   const seats: Prisma.SeatCreateManyInput[] = [];

  //   for (let seatRow = 1; seatRow <= rows; seatRow++) {
  //     for (const col of columns) {
  //       let seatType: SeatType;
  //       if (seatRow <= 2) seatType = SeatType.VIP;
  //       else if (seatRow <= 10) seatType = SeatType.BUSINESS;
  //       else seatType = SeatType.ECONOMY;

  //       seats.push({
  //         seatRow,
  //         seatNumber: col,
  //         flightId,
  //         type: seatType,
  //         isBooked: false,
  //       });
  //     }
  //   }

  //   await this.prisma.seat.createMany({ data: seats });

  //   return {
  //     message: `Generated ${seats.length} seats for flight ${flightId}`,
  //     total: seats.length,
  //   };
  // }

  async findOne(flightId: number) {
    console.log('👉 flightId nhận vào:', flightId, typeof flightId);
    const flight = await this.prisma.flight.findUnique({
      where: { flightId: flightId },
      include: { aircraft: true },
    });

    if (!flight) {
      return {
        resultCode: '01',
        resultMessage: `Flight with ID ${flightId} not found`,
      };
    }

    return flight;
  }

  async update(flightId: number, data: Partial<Flight>) {
    try {
      await this.findOne(flightId);
      return await this.prisma.flight.update({
        where: { flightId },
        data,
      });
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

      return await this.prisma.flight.delete({ where: { flightId } });
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

  async createAircraft(data: Aircraft) {
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
    console.log('Data', res);
    return { resultCode: '00', resultMessage: 'Aircraft', data: res };
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
          coordinates: data.coordinates,
          timezone: data.timezone,
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
}
