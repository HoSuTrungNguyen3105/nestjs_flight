import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { Flight } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';

@Controller('sys/flights')
export class FlightsController {
  constructor(private readonly flightService: FlightsService) {}

  @Post()
  create(@Body() data: Omit<Flight, 'flightId'>) {
    return this.flightService.create(data);
  }

  @Get()
  async findAll(): Promise<BaseResponseDto<Flight>> {
    const data = await this.flightService.findAll();
    return {
      resultCode: '00',
      resultMessage: 'Thành công',
      list: data,
    };
  }

  @Get(':flightId')
  findOne(@Param('flightId') id: string) {
    return this.flightService.findOne(+id);
  }

  @Patch(':flightId')
  update(@Param('flightId') id: string, @Body() data: Partial<Flight>) {
    return this.flightService.update(+id, data);
  }

  @Delete(':flightId')
  remove(@Param('flightId') id: string) {
    return this.flightService.delete(+id);
  }
}
