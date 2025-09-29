import { Module } from '@nestjs/common';
import { EnumController } from './enum.controller';

@Module({
  controllers: [EnumController],
})
export class EnumModule {}
