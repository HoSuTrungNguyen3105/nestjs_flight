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
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Flight already exists with this flightNo');
      }
      throw new BadRequestException(error.message || 'Failed to create flight');
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
      console.error('🔥 Lỗi findAll flight:', error);
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
      throw new NotFoundException(`Flight with ID ${flightId} not found`);
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
      throw new BadRequestException('Failed to update flight');
    }
  }

  async delete(flightId: number) {
    try {
      // Kiểm tra tồn tại trước
      await this.findOne(flightId);

      return await this.prisma.flight.delete({ where: { flightId } });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to delete flight');
    }
  }

  async deleteAll() {
    try {
      await this.prisma.flight.deleteMany({});
      return {
        resultCode: '00',
        message: 'Đã xoá toàn bộ chuyến bay thành công',
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Xoá toàn bộ flights thất bại',
      );
    }
  }
  async createAircraft(data: Aircraft) {
    try {
      return await this.prisma.aircraft.create({ data });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Aircraft already exists');
      }
      throw new BadRequestException(
        error.message || 'Failed to create aircraft',
      );
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
      console.log('👉 DATA TRUYỀN VÀO SERVICE:', data);
      const res = await this.prisma.airport.create({
        data: {
          code: data.code,
          name: data.name,
          city: data.city,
          coordinates: data.coordinates,
          timezone: data.timezone,
        },
      });
      return res;
    } catch (error) {
      console.error('🔥 Lỗi createAirport:', error);

      if (error.code === 'P2002') {
        throw new ConflictException(`Airport code ${data.code} đã tồn tại`);
      }

      throw new InternalServerErrorException(
        'Không thể tạo airport, xem log để biết chi tiết!',
      );
    }
  }
}
