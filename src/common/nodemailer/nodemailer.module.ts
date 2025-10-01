import { Module } from '@nestjs/common';
import { MailService } from './nodemailer.service';
import { PrismaModule } from 'src/prisma.module';
import { MailController } from './nodemailer.controller';

@Module({
  imports: [PrismaModule],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
