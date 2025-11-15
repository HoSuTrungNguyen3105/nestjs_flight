import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/common/nodemailer/nodemailer.module';
import { UsersService } from 'src/users/users.service';
import { JwtStrategy } from 'src/common/mfa/jwt-strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersService, PrismaService],
})
export class AuthModule {}
