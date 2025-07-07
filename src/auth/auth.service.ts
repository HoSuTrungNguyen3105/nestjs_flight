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
        password: hashedPassword,
        name: dto.name,
        firstname: dto.firstname,
        lastname: dto.lastname,
        pictureUrl: dto.pictureUrl,
        rank: dto.rank ?? '',
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

    // Nếu tài khoản bị khóa
    // if (user.isBlocked && user.blockExpires && new Date() < user.blockExpires) {
    //   const minutesLeft = Math.ceil(
    //     (new Date(user.blockExpires).getTime() - Date.now()) / 60000,
    //   );
    //   throw new UnauthorizedException(
    //     `Tài khoản bị khóa. Vui lòng thử lại sau ${minutesLeft} phút.`,
    //   );
    // }

    await bcrypt.compare(password, user.password);

    // if (!isPasswordCorrect) {
    //   const updated = await this.prisma.user.update({
    //     where: { email },
    //     data: {
    //       // loginAttempts: { increment: 1 },
    //       // isBlocked: user.loginAttempts + 1 >= 3 ? true : false,
    //       // blockExpires:
    //       //   user.loginAttempts + 1 >= 3
    //       //     ? new Date(Date.now() + 15 * 60 * 1000)
    //       //     : null,
    //     },
    //   });

    // throw new UnauthorizedException(
    //   `Sai mật khẩu! Bạn đã nhập sai ${updated.loginAttempts} lần.`,
    // );
    //}

    // Nếu đúng mật khẩu → reset các thông tin liên quan
    // await this.prisma.user.update({
    //   where: { email },
    //   data: {
    //     loginAttempts: 0,
    //     isBlocked: false,
    //     blockExpires: null,
    //     lastLogin: new Date(),
    //   },
    // });

    // Tạo token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Đăng nhập thành công!',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
