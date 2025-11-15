import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateHotelDto, ResponseHotelDto } from './dto/create-multi-hotel.dto';
import { nowDecimal } from 'src/common/helpers/format';
import { generateRandomInHotelCode } from 'src/common/helpers/hook';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { UpdateEntireHotelDto } from './dto/update-hotel.dto';

@Injectable()
export class HotelService {
  constructor(private prisma: PrismaService) {}

  async createManyHotels(data: CreateHotelDto[]) {
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
          if (!item.hotelCode) {
            return {
              code: item.hotelCode || '(empty)',
              errorCode: '01',
              errorMessage: 'Missing required field: hotelCode',
            };
          }

          const existingFlight = await this.prisma.hotel.findUnique({
            where: { hotelCode: item.hotelCode },
          });

          if (existingFlight) {
            return {
              code: item.hotelCode,
              errorCode: '02',
              errorMessage: `Hotel ${item.hotelCode} already exists`,
            };
          }

          await this.prisma.hotel.create({
            data: { ...item, createdAt: nowDecimal(), updatedAt: nowDecimal() },
          });

          return {
            //  code: item.flightNo,
            errorCode: '00',
            errorMessage: 'Flight created successfully',
          };
        } catch (error) {
          console.error(` Error creating hotel ${item.hotelCode}:`, error);
          return {
            //  code: item.flightNo,
            errorCode: '99',
            errorMessage: `Unexpected error while creating hotel ${item.hotelCode}`,
          };
        }
      });

      const results = await Promise.all(tasks);

      const hasError = results.some((r) => r.errorCode !== '00');

      return {
        resultCode: hasError ? '01' : '00',
        resultMessage: hasError
          ? 'Some hotel failed to create'
          : 'All hotels created successfully',
        list: results,
      };
    } catch (error) {
      console.error(' Batch creation failed:', error);
      return {
        resultCode: '99',
        resultMessage: 'Critical error during batch hotel creation',
        list: [],
      };
    }
  }

  // Optional: get all hotels
  async getAllHotels() {
    const res = await this.prisma.hotel.findMany();
    const mapped = res.map((t) => ({
      ...t,
      createdAt: Number(t.createdAt),
      updatedAt: Number(t.updatedAt),
    }));
    return {
      resultCode: '00',
      resultMessage: `Find hotels successfully`,
      list: mapped,
    };
  }

  async updateHotelCode(id: number, code: string) {
    const existingHotel = await this.prisma.hotel.findUnique({
      where: { id },
    });

    if (!existingHotel) {
      return {
        resultCode: '01',
        resultMessage: 'Hotel not found',
      };
    }

    await this.prisma.hotel.update({
      where: { id },
      data: {
        hotelCode: code,
      },
    });
    return {
      resultCode: '00',
      resultMessage: `Update hotel code successfully`,
    };
  }

  async updateHotelByID(
    id: number,
    data: Partial<UpdateEntireHotelDto>, // hoặc CreateHotelDto nếu anh có DTO
  ): Promise<BaseResponseDto> {
    const existingHotel = await this.prisma.hotel.findUnique({
      where: { id },
    });

    if (!existingHotel) {
      return {
        resultCode: '01',
        resultMessage: 'Hotel not found',
      };
    }

    await this.prisma.hotel.update({
      where: { id },
      data,
    });

    return {
      resultCode: '00',
      resultMessage: 'Update hotel successfully',
    };
  }

  async getHotelByHotelCode(hotelCode?: string) {
    const res = await this.prisma.hotel.findUnique({
      where: {
        hotelCode,
      },
    });
    if (!res) {
      return { resultCode: '01', resultMessage: 'Hotel not found' };
    }
    const mapped = {
      ...res,
      createdAt: Number(res?.createdAt),
      updatedAt: Number(res?.updatedAt),
    };
    return {
      resultCode: '00',
      resultMessage: `Find hotel successfully`,
      data: mapped,
    };
  }

  async randomHotelCode() {
    const password = await generateRandomInHotelCode(9);
    return {
      resultCode: '00',
      resultMessage: 'Random thành công!',
      data: password,
    };
  }
}
