// mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const info = await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
    return {
      info,
    };
  }

  //   async sendMailToMany(toList: string[], subject: string, text: string, html?: string) {
  //   return await this.transporter.sendMail({
  //     from: process.env.EMAIL_USER,
  //     to: toList.join(', '), // convert string[] -> "a@gmail.com, b@gmail.com"
  //     subject,
  //     text,
  //     html,
  //   });
  // }

  async sendMailToMany(
    toList: string[],
    subject: string,
    text: string,
    html?: string,
  ) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toList.join(', '),
      subject,
      text,
      html,
    });
    return {
      resultCode: '00',
      resultMessage: 'Send successfully',
    };
  }

  async sendMailWithCcAndBcc(
    toList: string[],
    subject: string,
    text: string,
    html?: string,
    ccList: string[] = [],
    bccList: string[] = [],
  ) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toList.join(', '),
      cc: ccList.length > 0 ? ccList.join(', ') : undefined,
      bcc: bccList.length > 0 ? bccList.join(', ') : undefined,
      subject,
      text,
      html,
    });

    return {
      resultCode: '00',
      resultMessage: 'Send successfully',
    };
  }
}
