import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
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
  // ✅ Logout: lấy userId từ token, xóa session hiện tại + cập nhật lastLoginDate
  // @UseGuards(JwtAuthGuard)
}
