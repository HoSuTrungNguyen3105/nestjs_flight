// mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './nodemailer.service';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
