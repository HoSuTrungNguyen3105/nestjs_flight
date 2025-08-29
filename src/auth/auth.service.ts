import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, MfaLoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from 'generated/prisma';
import { nowDecimal, TEN_DAYS } from 'src/common/helpers/base.helper';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { MailService } from 'src/common/nodemailer/nodemailer.service';
import { Decimal } from 'generated/prisma/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailer: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.passenger.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      return { resultCode: '99', resultMessage: 'Email already registered' };
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Tạo passenger
    const passenger = await this.prisma.passenger.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        phone: dto.phone,
        passport: dto.passport,
        createdAt: nowDecimal(),
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Đăng ký thành công!',
      data: passenger.id,
    };
  }

  async loginUser(dto: LoginDto) {
    try {
      const { email, password } = dto;

      if (!email || !password) {
        return {
          resultCode: '99',
          resultMessage: 'Email và mật khẩu là bắt buộc!',
        };
      }

      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { sessions: true },
      });

      if (!user)
        return { resultCode: '99', resultMessage: 'Tài khoản chưa đăng ký!' };

      // Nếu tài khoản đã bị khóa
      if (user.accountLockYn === 'Y') {
        return {
          resultCode: '09',
          resultMessage: 'Tài khoản đã bị khóa!',
          userId: user.id,
          requireUnlock: true,
        };
      }

      if (user.tempPassword && user.tempPassword !== '') {
        const isTempPasswordValid = await bcrypt.compare(
          password,
          user.tempPassword,
        );
        if (!isTempPasswordValid) {
          await this.handleLoginFail(user);
          return {
            resultCode: '99',
            resultMessage: 'Mật khẩu tạm không đúng!',
          };
        }

        return {
          resultCode: '99',
          resultMessage: 'Bạn cần đổi mật khẩu trước khi đăng nhập!',
          requireChangePassword: true,
          userId: user.id,
        };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        await this.handleLoginFail(user);
        return { resultCode: '99', resultMessage: 'Mật khẩu không đúng!' };
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginFailCnt: 0 },
      });

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = await this.jwtService.signAsync(payload);

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
        data: { id: user.id },
      };
    } catch (err) {
      console.error('🔥 Lỗi loginUser:', err);
      throw err;
    }
  }

  async getAllUnlockRequests() {
    const res = await this.prisma.unlockRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return {
      responseCode: '00',
      responseMessage: 'Lấy danh sách yêu cầu mở khóa thành công!',
      data: res,
    };
  }
  async setMfa(user: { email: string }) {
    try {
      const secret = speakeasy.generateSecret({
        name: `MyApp (${user.email})`,
      });

      let existingUser = await this.prisma.user.findUnique({
        where: { email: user.email },
      });

      // Nếu user đã tồn tại và đã bật MFA thì trả về luôn
      if (existingUser && existingUser.mfaEnabledYn === 'Y') {
        return {
          resultCode: '00',
          resultMessage: 'MFA đã được kích hoạt cho user này',
          data: {
            hasVerified: 'Y',
            secret: existingUser.mfaSecretKey,
            qrCodeDataURL: null,
          },
        };
      }

      if (!existingUser) {
        existingUser = await this.prisma.user.create({
          data: {
            email: user.email,
            password: '', // tạm
            userAlias: '',
            name: '',
            pictureUrl: '',
            rank: '',
            createdAt: new Prisma.Decimal(Date.now()),
            updatedAt: new Prisma.Decimal(Date.now()),
            mfaSecretKey: secret.base32,
            mfaEnabledYn: 'N', // 👈 chưa bật ngay
          },
        });
      } else {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            mfaSecretKey: secret.base32,
            mfaEnabledYn: 'N',
            updatedAt: new Prisma.Decimal(Date.now()),
          },
        });
      }

      const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

      return {
        resultCode: '00',
        resultMessage: 'Khởi tạo MFA thành công, hãy xác thực code',
        data: {
          hasVerified: 'N',
          secret: secret.base32,
          qrCodeDataURL,
        },
      };
    } catch (err) {
      console.error('🔥 Lỗi tạo MFA:', err);
      throw err;
    }
  }
  async verifyMfaSetup(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.mfaSecretKey) {
      throw new Error('User chưa khởi tạo MFA');
    }

    const verified = this.verifyMfaCode(user.mfaSecretKey, code);

    if (!verified) {
      return {
        resultCode: '99',
        resultMessage: 'Mã MFA không hợp lệ',
      };
    }

    // Nếu ok → bật MFA
    await this.prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabledYn: 'Y' },
    });

    return {
      resultCode: '00',
      resultMessage: 'Xác thực MFA thành công, MFA đã được bật',
    };
  }

  verifyMfaCode(secret: string, code: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2,
    });
  }

  async mfaLogin(dto: MfaLoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');

      if (user.accountLockYn === 'Y') {
        throw new UnauthorizedException('Tài khoản đang bị khóa');
      }

      if (!user.mfaSecretKey) {
        throw new BadRequestException('Tài khoản chưa bật MFA');
      }
      const verified = this.verifyMfaCode(user.mfaSecretKey, dto.code);

      if (!verified) {
        throw new UnauthorizedException('Mã MFA không đúng hoặc đã hết hạn');
      }

      const payload = { sub: user.id, email: user.email, role: user.role };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '2h',
      });

      // cập nhật lần đăng nhập gần nhất
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginDate: nowDecimal(), // nếu dùng DateTime trong schema
          loginFailCnt: 0,
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Đăng nhập MFA thành công',
        accessToken,
        data: { id: user.id },
      };
    } catch (err) {
      console.error('🔥 Lỗi mfaLogin:', err);
      throw err;
    }
  }

  async resetMfa(userId: number) {
    try {
      const secret = speakeasy.generateSecret({
        name: `MyApp (${userId})`,
      });

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { mfaSecretKey: secret.base32, mfaEnabledYn: 'Y' },
      });

      const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

      return {
        resultCode: '00',
        resultMessage: 'Reset MFA thành công',
        data: {
          secret: secret.base32,
          qrCodeDataURL,
        },
      };
    } catch (err) {
      console.error('Lỗi resetMfa:', err);
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
      return {
        resultCode: '09',
        resultMessage:
          'Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần!',
      };
    } else {
      // chỉ tăng loginFailCnt
      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginFailCnt: newFailCnt },
      });
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { resultCode: '01', resultMessage: 'Email không tồn tại' };
    }

    const tempPassword = crypto.randomBytes(3).toString('hex');

    const hashedTemp = await bcrypt.hash(tempPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        tempPassword: hashedTemp,
      },
    });

    // Gửi email
    await this.mailer.sendMail(
      email,
      'Mật khẩu tạm thời của bạn',
      `Mật khẩu tạm thời của bạn là: ${tempPassword}`,
    );

    return { resultCode: '00', message: 'Đã gửi mật khẩu tạm qua email' };
  }

  async checkMfaSettingYn(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { resultCode: '01', resultMessage: 'Email không tồn tại' };
    }

    if (!user.mfaSecretKey || user.mfaEnabledYn !== 'Y') {
      return { resultCode: '04', resultMessage: 'Tài khoản chưa bật MFA' };
    }

    return {
      resultCode: '00',
      resultMessage: 'Da xac thuc mfa',
    };
  }

  async forgotPasswordWithMfa(email: string, mfaCode: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { resultCode: '01', resultMessage: 'Email không tồn tại' };
    }

    const verified = this.verifyMfaCode(user.mfaSecretKey as string, mfaCode);

    if (!verified) {
      return { resultCode: '05', resultMessage: 'Mã MFA không đúng' };
    }

    // ✅ Bước 2: tạo reset token (hoặc password tạm)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Decimal(Date.now() + 1000 * 60 * 15); // 15 phút

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        // resetToken,
        resetTokenExpires: expiresAt,
      },
    });

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    // ✅ Bước 3: gửi email reset link
    await this.mailer.sendMail(
      email,
      'Đặt lại mật khẩu',
      `Vui lòng nhấn vào link này để đặt lại mật khẩu: ${resetLink}`,
    );

    return {
      resultCode: '00',
      resultMessage: 'Đã gửi link đặt lại mật khẩu qua email',
    };
  }

  async changePassword(
    userId: number,
    newPassword: string,
    confirmPassword: string,
  ) {
    try {
      if (!userId) {
        return { resultCode: '01', message: 'Thiếu userId' };
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { resultCode: '01', message: 'User không tồn tại' };
      }

      if (newPassword !== confirmPassword) {
        return {
          resultCode: '02',
          message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          tempPassword: '',
          isEmailVerified: 'Y',
        },
      });

      return { resultCode: '00', message: 'Đổi mật khẩu thành công' };
    } catch (err) {
      console.error('🔥 Lỗi change password:', err);
      throw err;
    }
  }

  async logout(userId: number, token: string) {
    const now = Date.now();
    const deleted = await this.prisma.userSession.deleteMany({
      where: { userId, token },
    });

    if (deleted.count === 0) {
      return {
        resultCode: '01',
        resultMessage: 'Phiên đăng nhập không tồn tại hoặc đã logout trước đó!',
      };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginDate: new Prisma.Decimal(now.toString()) },
    });

    return { resultCode: '00', message: 'Logout successful' };
  }
}
