import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Aircraft, Flight } from 'generated/prisma';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import { AirportDto } from './dto/create-airport.dto';
import { BaseResponseDto } from 'src/baseResponse/response.dto';

@Injectable()
export class FlightsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Flight, 'flightId'>,
  ): Promise<BaseResponseDto<Partial<Flight>>> {
    try {
      const flight = await this.prisma.flight.create({ data });
      return {
        resultCode: '00',
        resultMessage: 'Thành công',
        data: flight,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: error.message || 'Failed to create flight',
      };
    }
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
        list: [],
      };
    }
  }

  async findOne(flightId: number) {
    const flight = await this.prisma.flight.findUnique({
      where: { flightId },
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
      if (error instanceof NotFoundException) throw error;
      return { resultCode: '99', resultMessage: 'Failed to update flight' };
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
      if (error instanceof NotFoundException) throw error;
      return { resultCode: '99', resultMessage: 'Failed to delete flight' };
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
  async createAircraft(data: Aircraft) {
    try {
      return await this.prisma.aircraft.create({ data });
    } catch (error) {
      return { resultCode: '01', resultMessage: 'Aircraft already exists' };
    }
  }
  // 1. Lấy tất cả máy bay
  async getAllAircraft() {
    return await this.prisma.aircraft.findMany();
  }

  // 2. Lấy tất cả sân bay
  async getAllAirports() {
    return await this.prisma.airport.findMany();
  }

  // 3. Tạo mới Airport
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
}
