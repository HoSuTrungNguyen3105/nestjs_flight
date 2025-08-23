// mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './nodemailer.service';

@Module({
  providers: [MailService],
  exports: [MailService], // để dùng ở chỗ khác
})
export class MailModule {}
