import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PassengerService } from './passenger.service';
import { CreatePassengerDto, UpdatePassengerDto } from './dto/register_user';

@Controller('sys/passengers')
export class PassengerController {
  constructor(private readonly passengerService: PassengerService) {}

  @Post()
  create(@Body() dto: CreatePassengerDto) {
    return this.passengerService.create(dto);
  }

  @Get()
  findAll() {
    return this.passengerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.passengerService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePassengerDto) {
    return this.passengerService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.passengerService.remove(+id);
  }
}
