import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.loginUser(dto);
  }
  @Post('logout')
  async logout(@Body() dto: { id: number; token: string }) {
    return this.authService.logout(dto.id, dto.token);
  }
  @Post('change-password')
  async changePassword(@Body() dto: { userId: number; newPassword: string }) {
    return this.authService.changePassword(dto.userId, dto.newPassword);
  }

  @Post('setmfa')
  async setupMfa(@Body() body: { userId: number; userId: number }) {
    return this.authService.generateMfaSecret(body.userId);
    // return {
    //   message: 'Scan QR code với Google Authenticator',
    //   qrCode: result.qrCodeDataURL,
    //   secret: result.secret, // lưu tạm nếu muốn backup
    // };
  }

  //   @Post('mfa')
  // async handleMfa(@Body() body: { email?: string; password?: string; userId?: number }) {
  //   let user;

  //   if (body.userId) {
  //     // Reset MFA
  //     user = await this.userService.findOne(body.userId);
  //     if (!user) throw new BadRequestException('User không tồn tại');
  //     const mfaSetup = await this.authService.generateMfaSecret(user.id);
  //     return {
  //       message: 'MFA đã được reset, scan QR code mới',
  //       qrCode: mfaSetup.qrCodeDataURL,
  //     };
  //   } else {
  //     // Login + đăng ký MFA
  //     if (!body.email || !body.password)
  //       throw new BadRequestException('Email và password bắt buộc');

  //     user = await this.authService.validateUser(body.email, body.password);
  //     if (!user) throw new BadRequestException('Email hoặc mật khẩu không đúng');

  //     if (!user.mfaSecretKey) {
  //       // Chưa có MFA → tạo mới
  //       const mfaSetup = await this.authService.generateMfaSecret(user.id);
  //       return {
  //         mfaRequired: true,
  //         message: 'Quét QR code để bật MFA',
  //         qrCode: mfaSetup.qrCodeDataURL,
  //       };
  //     }

  //     // Nếu MFA đã bật → yêu cầu nhập code
  //     return { mfaRequired: true, message: 'Nhập code MFA', email: user.email };
  //   }
  // }

  // ✅ Logout: lấy userId từ token, xóa session hiện tại + cập nhật lastLoginDate
  // @UseGuards(JwtAuthGuard)
}
