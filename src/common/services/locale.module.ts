import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { LocaleService } from './locale-countries.service';
import { LocaleController } from './locale.controller';

@Module({
  imports: [PrismaModule],
  providers: [LocaleService],
  controllers: [LocaleController],
  //   exports: [MailService],
})
export class LocaleModule {}
