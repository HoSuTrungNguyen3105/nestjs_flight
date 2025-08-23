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
        include: { sessions: true },
      });

      if (!user) throw new BadRequestException('Tài khoản chưa đăng ký!');

      // Nếu tài khoản đã bị khóa
      if (user.accountLockYn === 'Y') {
        throw new BadRequestException('Tài khoản đã bị khóa!');
      }

      // Nếu user có tempPassword thì check theo tempPassword trước
      // if (user.tempPassword) {
      //   const isTempPasswordValid = await bcrypt.compare(
      //     password,
      //     user.tempPassword,
      //   );
      //   if (!isTempPasswordValid) {
      //     // ❌ Sai mật khẩu → tăng loginFailCnt
      //     await this.handleLoginFail(user);
      //     throw new BadRequestException('Mật khẩu tạm không đúng!');
      //   }

      //   return {
      //     resultCode: '99',
      //     resultMessage: 'Bạn cần đổi mật khẩu trước khi đăng nhập!',
      //     requireChangePassword: true,
      //     userId: user.id,
      //   };
      // }

      // Nếu có tempPassword thì check
      if (user.tempPassword && user.tempPassword !== '') {
        const isTempPasswordValid = await bcrypt.compare(
          password,
          user.tempPassword,
        );
        if (!isTempPasswordValid) {
          await this.handleLoginFail(user);
          throw new BadRequestException('Mật khẩu tạm không đúng!');
        }

        return {
          resultCode: '99',
          resultMessage: 'Bạn cần đổi mật khẩu trước khi đăng nhập!',
          requireChangePassword: true,
          userId: user.id,
        };
      }

      // Check password gốc
      if (!user.password || user.password === '') {
        throw new BadRequestException('Tài khoản chưa có mật khẩu hợp lệ!');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await this.handleLoginFail(user);
        throw new BadRequestException('Mật khẩu không đúng!');
      }

      // if (user.isEmailVerified === 'N') {
      //   throw new BadRequestException('Email chưa được xác thực!');
      // }

      // Bình thường thì check password gốc
      // const isPasswordValid = await bcrypt.compare(password, user.password);
      // if (!isPasswordValid) {
      //   // ❌ Sai mật khẩu → tăng loginFailCnt
      //   await this.handleLoginFail(user);
      //   throw new BadRequestException('Mật khẩu không đúng!');
      // }

      // ✅ Đúng mật khẩu → reset loginFailCnt
      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginFailCnt: 0 },
      });

      // ✅ Nếu pass hợp lệ → cấp token
      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = await this.jwtService.signAsync(payload);

      // Xử lý session như cũ
      for (const s of user.sessions) {
        if (Date.now() - Number(s.createdAt || 0) > TEN_DAYS) {
          await this.prisma.userSession.delete({ where: { id: s.id } });
        }
      }

      const validSessions = user.sessions.filter(
        (s) => Date.now() - Number(s.createdAt || 0) <= TEN_DAYS,
      );

      if (validSessions.length >= 2) {
        const oldest = validSessions.sort(
          (a, b) => Number(a.createdAt) - Number(b.createdAt),
        )[0];
        await this.prisma.userSession.delete({ where: { id: oldest.id } });
      }

      await this.prisma.userSession.create({
        data: {
          userId: user.id,
          token: accessToken,
          createdAt: nowDecimal(),
        },
      });

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
      console.error('🔥 Lỗi loginUser:', err);
      throw err;
    }
  }

  // Helper xử lý khi sai mật khẩu
  private async handleLoginFail(user: any) {
    const newFailCnt = user.loginFailCnt + 1;

    if (newFailCnt >= 5) {
      // ❌ Tự động khóa tài khoản
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginFailCnt: newFailCnt,
          accountLockYn: 'Y',
        },
      });
      throw new BadRequestException(
        'Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần!',
      );
    } else {
      // chỉ tăng loginFailCnt
      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginFailCnt: newFailCnt },
      });
    }
  }

  async changePassword(userId: number, newPassword: string) {
    try {
      if (!userId) {
        throw new BadRequestException('Thiếu userId');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId }, // ✅ đảm bảo userId có giá trị
      });

      if (!user) {
        throw new BadRequestException('User không tồn tại');
      }

      // ✅ Hash password trước khi lưu
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          tempPassword: '',
          isEmailVerified: 'Y',
        }, // ✅ xoá tempPassword sau khi đổi
      });

      return { resultCode: '00', message: 'Đổi mật khẩu thành công' };
    } catch (err) {
      console.error('🔥 Lỗi change password:', err);
      throw err;
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
