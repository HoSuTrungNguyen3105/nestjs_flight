import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, MfaLoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser, UserPayload } from 'src/baseResponse/response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('getUserSessions')
  async getUserSessions(@Body('userId') userId: number) {
    console.log('User ID từ body:', userId);
    const sessions = await this.authService.getUserSessions(userId);
    return sessions;
  }

  @Post('logoutSession/:sessionId')
  @UseGuards(AuthGuard('jwt'))
  async logoutSession(
    @GetUser() user: UserPayload,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    const userId = user.sub;
    const res = await this.authService.logoutSession(userId, sessionId);
    return res;
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login-admin')
  async loginAdmin(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto);
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

  @Post('change-password-in-profile')
  async changePasswordInProfile(
    @Body()
    dto: {
      userId: number;
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    return this.authService.changePasswordInProfile(
      dto.userId,
      dto.currentPassword,
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

  @Post('checkMfaSettingYn')
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

  @Post('disabledmfa')
  async disabledMfa(@Body() body: { userId: number }) {
    return this.authService.disabledMfaLogin(body.userId);
  }

  @Post('resetTempPassword')
  async resetTempPassword(
    @Body() body: { userId: number; tempPassword: string },
  ) {
    return this.authService.resetTempPassword(body.userId, body.tempPassword);
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

  @Post('sendEmailToVerification')
  async sendVerificationEmail(@Body() body: { id: number }) {
    const res = await this.authService.sendVerificationEmail(Number(body.id));
    return res;
  }

  @Get('getUserWithRelations/:id')
  async getUserDetail(@Param('id', ParseIntPipe) id: number) {
    const user = await this.authService.getUserWithRelations(id);
    return user;
  }

  @Get('getPassengerRelations/:id')
  async getPassengerRelations(@Param('id') id: string) {
    const user = await this.authService.getPassengerRelations(id);
    return user;
  }
  @Get('getFlightRelations/:id')
  async getFlightRelations(@Param('id', ParseIntPipe) id: number) {
    const user = await this.authService.getFlightRelations(id);
    return user;
  }

  @Get('getFacilityRelations/:id')
  async getFacilityRelations(@Param('id') id: string) {
    const user = await this.authService.getFacilityRelations(id);
    return user;
  }

  @Post('update-batch-password')
  async updateBatchPassword(@Body('password') password: string) {
    return await this.authService.updateBatchPasswordToPassenger(password);
  }

  @Post('find-passenger-info')
  findPassengerById(@Body('id') id: string) {
    return this.authService.getPassengerInfo(id);
  }

  @Post('logoutAllOtherSessions')
  @UseGuards(AuthGuard('jwt'))
  async logoutAllOtherSessions(@GetUser() user: UserPayload) {
    const userId = user.sub;
    console.log('refetchLogoutAllSessions', userId);
    const res = await this.authService.logoutAllOtherSessions(userId);
    return res;
  }
}
