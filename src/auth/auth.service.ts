import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from 'generated/prisma';
import { nowDecimal, TEN_DAYS } from 'src/common/helpers/base.helper';

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
      userId: user.id,
    };
  }

  // async loginUser(dto: LoginDto) {
  //   const { email, password } = dto;

  //   const user = await this.prisma.user.findUnique({
  //     where: { email },
  //     include: { sessions: true },
  //   });

  //   if (!user) throw new BadRequestException('Tài khoản chưa đăng ký!');

  //   const isPasswordValid = await bcrypt.compare(password, user.password);
  //   if (!isPasswordValid) throw new BadRequestException('Mật khẩu không đúng!');

  //   // Tạo token mới
  //   const payload = { sub: user.id, email: user.email, role: user.role };
  //   const accessToken = await this.jwtService.signAsync(payload);

  //   // Nếu user đã có 2 session => xoá session cũ nhất
  //   // Nếu user đã có 2 session => xoá session cũ nhất
  //   // if (user.sessions.length >= 2) {
  //   //   const oldest = user.sessions.sort(
  //   //     (a, b) => Number(a.createdAt ?? 0) - Number(b.createdAt ?? 0),
  //   //   )[0];

  //   //   await this.prisma.userSession.delete({ where: { id: oldest.id } });
  //   // }
  //   if (user.sessions.length >= 2) {
  //     const oldest = user.sessions.sort(
  //       (a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0),
  //     )[0];

  //     if (oldest) {
  //       await this.prisma.userSession.delete({ where: { id: oldest.id } });
  //     }
  //   }

  //   // Lưu session mới
  //   await this.prisma.userSession.create({
  //     data: {
  //       userId: user.id,
  //       token: accessToken,
  //       createdAt: nowDecimal(), // ✅ luôn set
  //     },
  //   });

  //   return {
  //     resultCode: '00',
  //     resultMessage: 'Đăng nhập thành công!',
  //     accessToken,
  //     user: {
  //       id: user.id,
  //       email: user.email,
  //       name: user.name,
  //       role: user.role,
  //     },
  //   };
  // }

  async loginUser(dto: LoginDto) {
    try {
      const { email, password } = dto;

      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { sessions: true }, // cần để lấy danh sách session
      });

      if (!user) throw new BadRequestException('Tài khoản chưa đăng ký!');

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        throw new BadRequestException('Mật khẩu không đúng!');

      // Tạo token mới
      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = await this.jwtService.signAsync(payload);

      if (user.tempPassword) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { password: user.tempPassword, tempPassword: null },
        });
      }

      // Xoá session quá hạn (10 ngày)
      for (const s of user.sessions) {
        if (Date.now() - Number(s.createdAt || 0) > TEN_DAYS) {
          await this.prisma.userSession.delete({ where: { id: s.id } });
        }
      }

      // Nếu user còn ≥ 2 session hợp lệ → xoá session cũ nhất
      const validSessions = user.sessions.filter(
        (s) => Date.now() - Number(s.createdAt || 0) <= TEN_DAYS,
      );

      if (validSessions.length >= 2) {
        const oldest = validSessions.sort(
          (a, b) => Number(a.createdAt) - Number(b.createdAt),
        )[0];
        await this.prisma.userSession.delete({ where: { id: oldest.id } });
      }

      // Tạo token mới
      // const payload = { sub: user.id, email: user.email, role: user.role };
      // const accessToken = await this.jwtService.signAsync(payload);

      // Lưu session mới
      await this.prisma.userSession.create({
        data: {
          userId: user.id,
          token: accessToken,
          createdAt: nowDecimal(),
        },
      });
      // Lưu session mới
      // await this.prisma.userSession.create({
      //   data: {
      //     userId: user.id,
      //     token: accessToken,
      //     createdAt: new Prisma.Decimal(Date.now().toString()), // ✅ luôn có timestamp
      //   },
      // });

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
    } catch (err) {
      console.error('🔥 Lỗi loginUser:', err); // Log ra console để bắt đúng lỗi
      throw err; // Đẩy lỗi lại để NestJS xử lý
    }
  }

  async logout(userId: number, token: string) {
    const now = Date.now();

    // ✅ Xoá session hiện tại theo userId + token
    const deleted = await this.prisma.userSession.deleteMany({
      where: { userId, token },
    });

    if (deleted.count === 0) {
      throw new BadRequestException(
        'Phiên đăng nhập không tồn tại hoặc đã logout trước đó!',
      );
    }

    // ✅ Cập nhật lastLoginDate
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginDate: new Prisma.Decimal(now.toString()) },
    });

    return { resultCode: '00', message: 'Logout successful' };
  }
}
