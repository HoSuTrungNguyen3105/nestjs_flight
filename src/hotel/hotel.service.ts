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
      const result = await this.prisma.hotel.createMany({
        data: data.map((item) => ({
          ...item,
          createdAt: nowDecimal(),
          updatedAt: nowDecimal(),
        })),

        skipDuplicates: true, // tránh lỗi nếu trùng name hoặc unique field
      });
      return {
        resultCode: '00',
        resultMessage: `Created ${result.count} hotels successfully`,
        data: {
          count: result.count,
        },
      };
    } catch (error) {
      console.error('err', error);
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
