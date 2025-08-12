import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from 'generated/prisma';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        userAlias: '',
        password: hashedPassword,
        name: dto.name,
        pictureUrl: dto.pictureUrl,
        rank: dto.rank ?? '',
        createdAt: new Prisma.Decimal(Date.now()), // milliseconds
        updatedAt: new Prisma.Decimal(Date.now()), // milliseconds
      },
    });

    return {
      message: 'Register success',
      userId: user,
    };
  }
  async loginUser(dto: LoginDto) {
    const { email, password } = dto;

    if (!email || !password) {
      throw new BadRequestException(
        'Vui lòng nhập đầy đủ thông tin tài khoản và mật khẩu!',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException('Tài khoản chưa đăng ký!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu không đúng!');
    }

    // Tạo token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      resultCode: '00',
      resultMessage: 'Đăng nhập thành công!',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
  // auth.service.ts
  // async logout(id: number) {
  //   await this.prisma.user.update({
  //     where: { id: id },
  //     // data: { refreshToken: null },
  //   });
  //   return {
  //     resultCode: '00',
  //     resultMessage: 'Đăng xuất thành công!',
  //   };
  // }
}
