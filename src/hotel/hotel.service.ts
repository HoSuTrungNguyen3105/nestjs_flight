import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateHotelDto } from './dto/create-multi-hotel.dto';
import { nowDecimal } from 'src/common/helpers/format';
import { generateRandomInHotelCode } from 'src/common/helpers/hook';

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
    return this.prisma.hotel.findMany();
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
