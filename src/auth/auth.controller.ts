import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, MfaLoginDto } from './dto/login.dto';
import { VerifyPasswordDto } from './dto/verifypw.dto';

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

  @Post('verify-password/:id')
  // @UseGuards(JwtAuthGuard)
  async verifyPasswordToAdmin(
    @Param('id') id: number,
    @Body('password') password: string,
  ) {
    return this.authService.verifyPasswordToAdmin(id, password);
  }

  // @Post('login/:token')
  // async loginAdmin(@Body() dto: LoginDto) {
  //   return this.authService.loginUser(dto);
  // }
  @Post('logout')
  async logout(@Body() dto: { id: number; token: string }) {
    return this.authService.logout(dto.id, dto.token);
  }
  @Post('forgot-password')
  async forgotPassword(@Body() dto: { email: string }) {
    return this.authService.forgotPassword(dto.email);
  }
  @Post('change-password')
  async changePassword(
    @Body()
    dto: {
      userId: number;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    return this.authService.changePassword(
      dto.userId,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  @Post('forgot-password-with-mfa')
  async forgotPasswordWithMfa(@Body() dto: { email: string; mfaCode: string }) {
    return this.authService.forgotPasswordWithMfa(dto.email, dto.mfaCode);
  }

  @Post('setmfa')
  async setupMfa(@Body() body: { email: string }) {
    return this.authService.setMfa({
      email: body.email,
    });
  }
  @Get('checkMfaSettingYn')
  async checkMfaYn(@Body() body: { email: string }) {
    return this.authService.checkMfaSettingYn(body.email);
  }

  @Post('verifymfa')
  async verifyMfa(@Body() body: { email: string; code: string }) {
    return this.authService.verifyMfaSetup(body.email, body.code);
  }

  @Post('resetmfa')
  async resetMfa(@Body() body: { userId: number }) {
    return this.authService.resetMfa(body.userId);
  }

  @Post('verifyOtp')
  async verifyOtp(@Body() body: { userId: number; otp: string }) {
    return this.authService.verifyOtp(body.userId, body.otp);
  }

  @Post('loginmfa')
  async mfaLogin(@Body() body: MfaLoginDto) {
    return this.authService.mfaLogin(body);
  }

  @Get('unlock-requests')
  async getUnlockRequests() {
    return this.authService.getAllUnlockRequests();
  }
}
