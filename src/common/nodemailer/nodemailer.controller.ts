import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { MailService } from './nodemailer.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('service/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-one')
  async sendOne(
    @Body() body: { to: string; subject: string; text: string; html?: string },
  ) {
    return await this.mailService.sendMail(
      body.to,
      body.subject,
      body.text,
      body.html,
    );
  }

  @Post('send-many')
  async sendMany(
    @Body()
    body: {
      toList: string[];
      subject: string;
      text: string;
      html?: string;
    },
  ) {
    return await this.mailService.sendMailToMany(
      body.toList,
      body.subject,
      body.text,
      body.html,
    );
  }

  @Post('send-cc-bcc')
  @UseInterceptors(AnyFilesInterceptor()) // nhận nhiều file
  async sendWithCcAndBcc(
    @Body()
    body: {
      toList: string[];
      ccList?: string[];
      bccList?: string[];
      subject: string;
      text: string;
      html?: string;
    },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const attachments =
      files?.map((file) => ({
        filename: file.originalname,
        path: file.path,
      })) || [];

    return await this.mailService.sendMailWithCcAndBcc(
      body.toList,
      body.subject,
      body.text,
      body.html,
      body.ccList || [],
      body.bccList || [],
      attachments,
    );
  }
}
