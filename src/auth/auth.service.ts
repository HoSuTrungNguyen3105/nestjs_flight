import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, MfaLoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import {
  Passenger,
  Prisma,
  Role,
  RolePermission,
  User,
  UserSession,
} from 'generated/prisma';
import { decimalToDate, nowDecimal, TEN_DAYS } from 'src/common/helpers/format';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { MailService } from 'src/common/nodemailer/nodemailer.service';
import { Decimal } from 'generated/prisma/runtime/library';
import { generateOtp, hashPassword } from 'src/common/helpers/hook';
import { VerifyPasswordResponseDto } from './dto/verifypw.dto';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { PassengerDto } from 'src/flights/dto/ticket-response.dto';
import {
  ADMIN_PERMISSIONS,
  MONITOR_PERMISSIONS,
} from 'src/common/constants/permissions';

export type GetSession = {
  passengerId: string | null;
  userId: number | null;
  token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailer: MailService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const existingUser = await this.prisma.passenger.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        return { resultCode: '99', resultMessage: 'Email already registered' };
      }

      const { otp, hashedOtp, expireAt } = await generateOtp(5);

      const user = await this.prisma.passenger.create({
        data: {
          email: dto.email,
          password: await hashPassword(dto.password), // hash trước khi lưu
          phone: dto.phone,
          passport: '',
          fullName: dto.name ?? '',
          otpCode: hashedOtp,
          otpExpire: expireAt,
        },
      });

      try {
        await this.mailer.sendMail(
          dto.email,
          'Xác nhận tài khoản',
          `Xin chào ${dto.name ?? 'bạn'}, mã xác nhận của bạn là ${otp}`,
          `<p>Xin chào <b>${dto.name ?? 'bạn'}</b>,</p>
       <p>Mã xác nhận của bạn là: <b>${otp}</b></p>
       <p>Mã có hiệu lực trong 5 phút.</p>`,
        );
      } catch (err) {
        console.error('Gửi email thất bại:', err.message);
      }

      return {
        resultCode: '00',
        resultMessage: 'Đăng ký thành công!',
        data: {
          email: user.email,
          userId: user.id,
        },
      };
    } catch (error) {
      console.error('err', error);
    }
  }

  async verifyPasswordToAdmin(
    userId: number,
    password: string,
  ): Promise<BaseResponseDto<VerifyPasswordResponseDto>> {
    try {
      if (!userId || !password) {
        return {
          resultCode: '99',
          resultMessage: 'User and password not have output',
        };
      }

      const user = await this.prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { password: true },
      });

      if (!user) {
        return {
          resultCode: '01',
          resultMessage: 'User not found',
          data: {
            isValid: false,
          },
        };
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (isValid) {
        return {
          resultCode: '00',
          resultMessage: 'Password verified successfully',
          data: {
            isValid: true,
          },
        };
      } else {
        return {
          resultCode: '01',
          resultMessage: 'Invalid password',
          data: {
            isValid: false,
          },
        };
      }
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async verifyOtp(
    userId: string,
    type: 'ADMIN' | 'MONITOR' | 'ID,PW',
    otp: string,
  ) {
    try {
      if (!userId) {
        return {
          resultCode: '09',
          resultMessage: 'Thiếu thông tin người dùng',
        };
      }

      const isAdmin = type === 'ADMIN';
      const id = isAdmin ? Number(userId) : userId;

      let entity: User | Passenger | null = null;
      // 1️ Tìm người dùng / hành khách
      if (isAdmin) {
        entity = await this.prisma.user.findUnique({
          where: { id: Number(id) },
        });
      } else {
        entity = await this.prisma.passenger.findUnique({
          where: { id: id as string },
        });
      }
      if (!entity) {
        return { resultCode: '99', resultMessage: 'Không tìm thấy người dùng' };
      }

      // 2️Kiểm tra OTP tồn tại
      if (!entity.otpCode || !entity.otpExpire) {
        return {
          resultCode: '98',
          resultMessage: 'OTP không tồn tại hoặc đã được xác nhận',
        };
      }

      // 3️ Kiểm tra OTP hết hạn
      const expireDate = decimalToDate(entity.otpExpire);
      if (expireDate && expireDate < new Date()) {
        return { resultCode: '97', resultMessage: 'OTP đã hết hạn' };
      }

      // 4️ Kiểm tra mã OTP
      const isValid = await bcrypt.compare(otp, entity.otpCode);
      if (!isValid) {
        return { resultCode: '96', resultMessage: 'OTP không đúng' };
      }

      if (isAdmin) {
        await this.prisma.user.update({
          where: { id: Number(id) },
          data: { otpCode: null, otpExpire: null, isEmailVerified: 'Y' },
        });
      } else {
        await this.prisma.passenger.update({
          where: { id: id as string },
          data: { otpCode: null, otpExpire: null, isEmailVerified: 'Y' },
        });
      }

      // 6️ Trả về kết quả
      return {
        resultCode: '00',
        resultMessage: 'Xác thực OTP thành công',
        requireChangePassword: true,
        userId: isAdmin ? Number(userId) : userId,
      };
    } catch (error) {
      console.error(' Lỗi khi xác thực OTP:', error);
      return {
        resultCode: '95',
        resultMessage: 'Lỗi hệ thống khi xác thực OTP',
      };
    }
  }

  async logout(id: number | string) {
    try {
      let deleted;

      // Kiểm tra nếu id là number thì xóa phiên người dùng
      if (typeof id === 'number') {
        deleted = await this.prisma.userSession.deleteMany({
          where: { userId: id },
        });

        if (deleted.count === 0) {
          return {
            resultCode: '01',
            resultMessage:
              'Phiên đăng nhập người dùng không tồn tại hoặc đã logout trước đó!',
          };
        }

        // Cập nhật lastLoginDate cho user
        await this.prisma.user.update({
          where: { id },
          data: { lastLoginDate: nowDecimal() },
        });
      } else {
        // Nếu id là string thì xóa phiên passenger
        deleted = await this.prisma.userSession.deleteMany({
          where: { passengerId: id },
        });

        if (deleted.count === 0) {
          return {
            resultCode: '01',
            resultMessage:
              'Phiên đăng nhập passenger không tồn tại hoặc đã logout trước đó!',
          };
        }

        // Cập nhật lastLoginDate cho passenger
        await this.prisma.passenger.update({
          where: { id },
          data: { lastLoginDate: nowDecimal() },
        });
      }

      return { resultCode: '00', resultMessage: 'Logout successful' };
    } catch (error) {
      console.error('err', error);
      return {
        resultCode: '99',
        resultMessage: 'Logout failed',
      };
    }
  }

  async seedPermissions() {
    try {
      await this.prisma.rolePermission.upsert({
        where: { role: Role.ADMIN },
        update: { permissions: ADMIN_PERMISSIONS },
        create: {
          role: Role.ADMIN,
          permissions: ADMIN_PERMISSIONS,
          createdAt: nowDecimal(),
          updatedAt: nowDecimal(),
        },
      });

      await this.prisma.rolePermission.upsert({
        where: { role: Role.MONITOR },
        update: { permissions: MONITOR_PERMISSIONS },
        create: {
          role: Role.MONITOR,
          permissions: MONITOR_PERMISSIONS,
          createdAt: nowDecimal(),
          updatedAt: nowDecimal(),
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Permissions seeded successfully',
      };
    } catch (error) {
      console.error('Seed permissions error:', error);
      return {
        resultCode: '99',
        resultMessage: 'Failed to seed permissions',
      };
    }
  }

  private getDeviceInfo(userAgent: string): {
    device: string;
    browser: string;
  } {
    const ua = userAgent.toLowerCase();

    let device = 'Unknown Device';
    if (ua.includes('windows')) device = 'Windows';
    else if (ua.includes('mac os')) device = 'Mac';
    else if (ua.includes('android')) device = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) device = 'iOS';
    else if (ua.includes('linux')) device = 'Linux';

    let browser = 'Unknown Browser';
    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome'))
      browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('opera')) browser = 'Opera';

    return { device, browser };
  }

  async loginAdmin(dto: LoginDto) {
    try {
      const { email, password, authType } = dto;

      if (!email || !password) {
        return {
          resultCode: '99',
          resultMessage: 'Email và mật khẩu là bắt buộc!',
        };
      }

      // 1. Find user with sessions to optimize queries
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          role: true,
          password: true,
          authType: true,
          prevPassword: true,
          isEmailVerified: true,
          userAlias: true,
          accountLockYn: true,
          lastLoginDate: true,
          loginFailCnt: true,
          mfaEnabledYn: true,
          tempPassword: true,
          status: true,
          isDeleted: true,
          sessions: true,
        },
      });

      if (!user) {
        return {
          resultCode: '99',
          resultMessage:
            authType === 'ADMIN'
              ? 'Tài khoản chưa đăng ký account!'
              : 'Tài khoản không tồn tại!',
        };
      }

      // 2. Cleanup expired sessions first
      const now = Date.now();
      const expiredSessions = user.sessions.filter(
        (s) => now - Number(s.createdAt || 0) > TEN_DAYS,
      );

      if (expiredSessions.length > 0) {
        await this.prisma.userSession.deleteMany({
          where: { id: { in: expiredSessions.map((s) => s.id) } },
        });
      }

      // 3. Check active session count
      const activeSessionsCount = user.sessions.length - expiredSessions.length;
      if (activeSessionsCount >= 3) {
        return {
          resultCode: '99',
          resultMessage: 'Tài khoản đã đăng nhập tối đa 3 thiết bị!',
        };
      }

      // 4. Security Checks (Lock, Email, Temp Password)
      if (authType === 'ADMIN' || authType === 'MONITOR') {
        // Lock check
        console.log(authType);
        if (user.accountLockYn === 'Y') {
          const hasSendRequest = await this.prisma.unlockRequest.findFirst({
            where: { employeeId: user.id },
          });

          return {
            resultCode: '09',
            resultMessage: 'Tài khoản đã bị khóa!',
            userId: user.id,
            requireUnlock: !hasSendRequest,
          };
        }

        if (user.isEmailVerified === 'N') {
          return {
            resultCode: '09',
            resultMessage: 'Email chưa xác thực!',
            userId: user.id,
            requireVerified: true,
          };
        }

        console.log('tempPassword', user.tempPassword);

        // Temp password check
        if (user.tempPassword !== '') {
          const isTempPasswordValid = await bcrypt.compare(
            password,
            user.tempPassword,
          );

          if (isTempPasswordValid) {
            return {
              resultCode: '99',
              resultMessage: 'Bạn cần đổi mật khẩu trước khi đăng nhập!',
              requireChangePassword: true,
              userId: user.id,
            };
          }
          // If temp password doesn't match, continue to check real password below
        }
      }

      // 5. Verify Password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        if (authType === 'MONITOR' || authType === 'ADMIN') {
          const failResponse = await this.handleLoginFail(
            user.id,
            user.loginFailCnt,
          );

          if (failResponse?.resultCode === '09') {
            return failResponse;
          }

          const remain = 5 - (user.loginFailCnt + 1);
          return {
            resultCode: '99',
            resultMessage: `Mật khẩu không đúng! Bạn còn ${remain} lần thử.`,
          };
        }

        return {
          resultCode: '03',
          resultMessage: 'Mật khẩu không đúng!',
        };
      }

      // 6. Success - Update User
      if (authType === 'ADMIN' || authType === 'MONITOR') {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            loginFailCnt: 0,
            authType,
            lastLoginDate: nowDecimal(),
          },
        });
      }

      // 7. Generate Token & Create Session
      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = await this.jwtService.signAsync(payload);
      const deviceInfo = this.getDeviceInfo(dto.userAgent);

      await this.prisma.userSession.create({
        data: {
          userId: user.id,
          token: accessToken,
          createdAt: nowDecimal(),
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          location: dto.location,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
          isCurrent: true,
        },
      });

      // Update other sessions to not current (ADMIN only)
      if (authType === 'ADMIN') {
        await this.prisma.userSession.updateMany({
          where: {
            userId: user.id,
            token: { not: accessToken },
          },
          data: {
            isCurrent: false,
          },
        });
      }

      return {
        resultCode: '00',
        resultMessage:
          authType === 'ADMIN'
            ? 'Đăng nhập thành công!'
            : `Đăng nhập ${authType} thành công!`,
        accessToken,
        data: { id: user.id },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        resultCode: '99',
        resultMessage: 'Đăng nhập không thành công!',
      };
    }
  }

  async loginUser(dto: LoginDto) {
    try {
      const { email, password, authType } = dto;
      if (!email || !password) {
        return {
          resultCode: '99',
          resultMessage: 'Email và mật khẩu là bắt buộc!',
        };
      }

      if (authType === 'ID,PW') {
        const passenger = await this.prisma.passenger.findUnique({
          where: { email },
          include: { sessions: true },
        });

        if (!passenger)
          return {
            resultCode: '99',
            resultMessage: 'Tài khoản không tồn tại!',
          };

        const sessions = await this.prisma.userSession.count({
          where: { passengerId: passenger.id },
        });

        if (sessions >= 3) {
          return {
            resultCode: '99',
            resultMessage: 'Tài khoản đã đăng nhập tối đa 3 thiết bị!',
          };
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          passenger.password,
        );

        if (!isPasswordValid) {
          return {
            resultCode: '03',
            resultMessage: 'Mật khẩu không đúng!',
          };
        }

        const payload = {
          sub: passenger.id,
          email: passenger.email,
          role: passenger.role,
        };

        console.log('payload', payload);

        const accessToken = await this.jwtService.signAsync(payload);

        for (const s of passenger.sessions) {
          if (Date.now() - Number(s.createdAt || 0) > TEN_DAYS) {
            await this.prisma.userSession.delete({ where: { id: s.id } });
          }
        }

        const validSessions = passenger.sessions.filter(
          (s) => Date.now() - Number(s.createdAt || 0) <= TEN_DAYS,
        );

        // Giới hạn số session (ví dụ: tối đa 5 sessions)
        if (validSessions.length >= 5) {
          const oldest = validSessions.sort(
            (a, b) => Number(a.createdAt) - Number(b.createdAt),
          )[0];
          await this.prisma.userSession.delete({ where: { id: oldest.id } });
        }

        // Get device info
        const deviceInfo = this.getDeviceInfo(dto.userAgent);
        // const location = this.getLocationFromIp(dto.ipAddress);
        console.log('validSessions', validSessions);

        // Tạo session mới với đầy đủ thông tin
        await this.prisma.userSession.create({
          data: {
            // userId:undefined,
            passengerId: passenger.id,
            token: accessToken,
            createdAt: nowDecimal(), // Current timestamp in seconds
            device: deviceInfo.device,
            browser: deviceInfo.browser,
            location: dto.location,
            ipAddress: dto.ipAddress,
            userAgent: dto.userAgent,
            isCurrent: true, // Session hiện tại
          },
        });

        await this.prisma.passenger.update({
          where: {
            id: passenger.id,
          },
          data: {
            lastLoginDate: nowDecimal(),
          },
        });

        // Đánh dấu các session khác không phải current
        await this.prisma.userSession.updateMany({
          where: {
            passengerId: passenger.id,
            token: { not: accessToken },
          },
          data: {
            isCurrent: false,
          },
        });

        return {
          resultCode: '00',
          resultMessage: 'Đăng nhập thành công!',
          accessToken,
          data: { id: passenger.id },
        };
      }
    } catch (err) {
      console.error('Lỗi loginUser:', err);
      throw err;
    }
  }

  async getUserWithRelations(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        employeeNo: true,
        hireDate: true,
        phone: true,
        status: true,
        department: true,
        position: true,
        name: true,
        role: true,
        rank: true,
        lastLoginDate: true,
        transferAdmin: true,
        attendance: {
          select: {
            id: true,
            date: true,
            checkIn: true,
            checkOut: true,
            createdAt: true,
          },
        },
        leaveRequest: {
          select: {
            id: true,
            leaveType: true,
            startDate: true,
            endDate: true,
            status: true,
            decidedAt: true,
          },
        },
        unlockRequests: { select: { id: true, status: true, createdAt: true } },
        payrolls: {
          select: { id: true, month: true, year: true, netPay: true },
        },
      },
    });

    if (!user) {
      return {
        resultCode: '01',
        resultMessage: 'User not found',
      };
    }

    return {
      resultCode: '00',
      resultMessage: 'Success find data relation user!',
      data: user,
    };
  }

  async getPassengerRelations(passengerId: string) {
    const passenger = await this.prisma.passenger.findUnique({
      where: { id: passengerId },
      select: {
        id: true,
        fullName: true,
        email: true,
        bookings: {
          select: {
            id: true,
            flight: {
              select: {
                flightId: true,
                flightNo: true,
                scheduledDeparture: true,
              },
            },
            mealOrders: true,
          },
        },
        tickets: {
          select: {
            id: true,
            ticketNo: true,
            flight: { select: { flightId: true, flightNo: true } },
            boardingPass: {
              select: { id: true, gate: true },
            },
            baggage: { select: { id: true, weight: true, status: true } },
          },
        },
      },
    });

    if (!passenger)
      return { resultCode: '01', resultMessage: 'Passenger not found' };

    return { resultCode: '00', resultMessage: 'Success', data: passenger };
  }

  async getFlightRelations(flightId: number) {
    const flight = await this.prisma.flight.findUnique({
      where: { flightId },
      select: {
        flightId: true,
        flightNo: true,
        departureAirport: true,
        arrivalAirport: true,
        scheduledDeparture: true,
        scheduledArrival: true,
        actualDeparture: true,
        actualArrival: true,
        gateId: true,
        tickets: {
          select: {
            id: true,
            ticketNo: true,
            passenger: { select: { id: true, fullName: true, email: true } },
            boardingPass: {
              select: { id: true, gate: true },
            },
            baggage: { select: { id: true, weight: true, status: true } },
          },
        },
        boardingPasses: {
          select: {
            id: true,
            ticketId: true,
            gate: true,
            // boardingTime: true,
          },
        },
        baggage: {
          select: {
            id: true,
            ticketId: true,
            weight: true,
            status: true,
            checkedAt: true,
          },
        },
        seats: {
          select: { id: true, seatNumber: true, isBooked: true },
        },
        meals: { select: { id: true, mealId: true, meal: true } },
        flightStatuses: {
          select: {
            id: true,
            status: true,
            description: true,
            updatedAt: true,
          },
        },
        gateAssignments: {
          select: {
            id: true,
            gateId: true,
            assignedAt: true,
            releasedAt: true,
          },
        },
      },
    });

    if (!flight) return { resultCode: '01', resultMessage: 'Flight not found' };
    return { resultCode: '00', resultMessage: 'Success', data: flight };
  }

  async logoutAllOtherSessions(userId: number): Promise<BaseResponseDto> {
    // Tìm session hiện tại
    const currentSession = await this.prisma.userSession.findFirst({
      where: {
        userId,
        isCurrent: true,
      },
    });

    if (!currentSession) {
      return { resultCode: '01', resultMessage: 'Current session not found' };
    }

    // Xóa tất cả sessions khác
    await this.prisma.userSession.deleteMany({
      where: {
        userId,
        id: {
          not: currentSession.id,
        },
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Logged out from all other sessions successfully',
    };
  }

  async logoutSession(
    passengerId: string | null,
    userId: number | null,
    sessionId: number,
  ): Promise<BaseResponseDto> {
    console.log('res', passengerId, userId, sessionId);
    // 1️ Kiểm tra input hợp lệ
    if (!userId && !passengerId) {
      return {
        resultCode: '01',
        resultMessage: 'Missing userId or passengerId',
      };
    }

    // 2️ Xây điều kiện tìm session động
    const whereClause = {
      id: sessionId,
      ...(userId ? { userId } : {}),
      ...(passengerId ? { passengerId } : {}),
    };

    const session = await this.prisma.userSession.findFirst({
      where: whereClause,
    });

    // 3️ Kiểm tra session tồn tại
    if (!session) {
      return {
        resultCode: '02',
        resultMessage: 'Session not found',
      };
    }

    if (session.isCurrent) {
      return {
        resultCode: '03',
        resultMessage: 'Cannot logout current session',
      };
    }

    // 5️ Xóa session
    await this.prisma.userSession.delete({ where: { id: sessionId } });

    // 6️ Trả kết quả thành công
    return {
      resultCode: '00',
      resultMessage: 'Session logged out successfully',
    };
  }

  async getAdminSessions(
    userId: number,
  ): Promise<BaseResponseDto<UserSession>> {
    try {
      const sessions = await this.prisma.userSession.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Success',
        list: sessions,
      };
    } catch (error) {
      console.error('err', error);
      return {
        resultCode: '09',
        resultMessage: 'Success',
        list: [],
      };
    }
  }

  async getPassengerSessions(
    passengerId: string,
  ): Promise<BaseResponseDto<UserSession>> {
    try {
      const sessions = await this.prisma.userSession.findMany({
        where: {
          passengerId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Success',
        list: sessions,
      };
    } catch (error) {
      console.error('err', error);
      return {
        resultCode: '00',
        resultMessage: 'Success',
        list: [],
      };
    }
  }

  async getSessionsById(data: GetSession) {
    const { passengerId, userId, token } = data;

    if ((!passengerId || passengerId === '') && !userId) {
      return {
        resultCode: '01',
        resultMessage: 'Phải truyền employeeId hoặc userId.',
      };
    }

    if (passengerId && userId) {
      return {
        resultCode: '02',
        resultMessage:
          'Chỉ được truyền 1 trong 2: employeeId hoặc userId (không được truyền cả hai).',
      };
    }

    // 2️Xây dựng where clause động
    const whereClause: Partial<GetSession> = {};
    if (passengerId) whereClause.passengerId = passengerId;
    if (userId) whereClause.userId = userId;
    if (token) whereClause.token = token;

    try {
      // 3️Truy vấn dữ liệu
      const session = await this.prisma.userSession.findFirst({
        where: whereClause,
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // 4️Trả kết quả
      if (!session) {
        return {
          resultCode: '03',
          resultMessage: 'Không tìm thấy session nào.',
          data: {
            requireLogout: true,
          },
        };
      }

      return {
        resultCode: '00',
        resultMessage: 'Lấy session thành công.',
        data: session,
      };
    } catch (error) {
      console.error('Lỗi khi lấy session:', error);
      return {
        resultCode: '99',
        resultMessage: 'Đã xảy ra lỗi trong quá trình lấy session.',
      };
    }
  }

  async getFacilityRelations(facilityId: string) {
    const facility = await this.prisma.facility.findUnique({
      where: { id: facilityId },
      select: {
        id: true,
        name: true,
        type: true,
        location: true,
        openingHours: true,
        terminal: {
          select: {
            id: true,
            code: true,
            name: true,
            airport: {
              select: { code: true, name: true, city: true, country: true },
            },
          },
        },
      },
    });

    if (!facility)
      return { resultCode: '01', resultMessage: 'Facility not found' };
    return { resultCode: '00', resultMessage: 'Success', data: facility };
  }

  async resetTempPassword(userId: number, tempPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        resultCode: '01',
        resultMessage: 'Không tìm thấy user!',
      };
    }

    const hashPassword = await bcrypt.hash(tempPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: '', tempPassword: hashPassword },
    });

    return {
      resultCode: '00',
      resultMessage: 'Đã reset lại mật khẩu tạm!',
    };
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
      resultCode: '00',
      resultMessage: 'Lấy danh sách yêu cầu mở khóa thành công!',
      list: res,
    };
  }

  async setMfa(user: { email: string }) {
    try {
      const hasRegisterEmail = await this.prisma.passenger.findUnique({
        where: { email: user.email },
      });

      if (!hasRegisterEmail) {
        return {
          resultCode: '09',
          resultMessage: 'Khong phai email da dang ki truoc do',
        };
      }
      const secret = speakeasy.generateSecret({
        name: `MyApp (${user.email})`,
      });

      let existingPassenger = await this.prisma.passenger.findUnique({
        where: { email: user.email },
      });

      if (existingPassenger && existingPassenger.mfaEnabledYn === 'Y') {
        return {
          resultCode: '00',
          resultMessage: 'MFA đã được kích hoạt cho user này',
          data: {
            hasVerified: 'Y',
            secret: existingPassenger.mfaSecretKey,
            qrCodeDataURL: null,
          },
        };
      }

      if (!existingPassenger) {
        existingPassenger = await this.prisma.passenger.create({
          data: {
            email: user.email,
            password: '', // tạm
            passport: '',
            phone: '',
            fullName: '',
            mfaSecretKey: secret.base32,
            mfaEnabledYn: 'N',
          },
        });
      } else {
        await this.prisma.passenger.update({
          where: { id: existingPassenger.id },
          data: {
            mfaSecretKey: secret.base32,
            mfaEnabledYn: 'N',
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
      console.error(' Lỗi tạo MFA:', err);
      throw err;
    }
  }

  async setMfaForAdmin(user: { email: string }) {
    try {
      const hasRegisterEmail = await this.prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!hasRegisterEmail) {
        return {
          resultCode: '09',
          resultMessage: 'Khong phai email da dang ki truoc do',
        };
      }
      const secret = speakeasy.generateSecret({
        name: `MyApp (${user.email})`,
      });

      let existingPassenger = await this.prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingPassenger && existingPassenger.mfaEnabledYn === 'Y') {
        return {
          resultCode: '00',
          resultMessage: 'MFA đã được kích hoạt cho account này',
          data: {
            hasVerified: 'Y',
            secret: existingPassenger.mfaSecretKey,
            qrCodeDataURL: null,
          },
        };
      }

      if (!existingPassenger) {
        existingPassenger = await this.prisma.user.create({
          data: {
            email: user.email,
            password: '', // tạm
            name: '',
            createdAt: nowDecimal(),
            updatedAt: nowDecimal(),
            // passport: '',
            // phone: '',
            // fullName: '',
            mfaSecretKey: secret.base32,
            mfaEnabledYn: 'N',
          },
        });
      } else {
        await this.prisma.user.update({
          where: { id: existingPassenger.id },
          data: {
            mfaSecretKey: secret.base32,
            mfaEnabledYn: 'N',
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
      console.error(' Lỗi tạo MFA:', err);
      throw err;
    }
  }

  async verifyMfaSetup(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.mfaSecretKey) {
      return {
        resultCode: '01',
        resultMessage: 'User chưa khởi tạo MFA',
      };
    }

    const verified = this.verifyMfaCode(user.mfaSecretKey, code);

    // console.log('email', email, code);
    if (!verified) {
      return {
        resultCode: '99',
        resultMessage: 'Mã MFA không hợp lệ',
      };
    }

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

  async changeEmailPassenger(id: string, newEmail: string) {
    // Sử dụng findFirst để tìm theo email và id cùng lúc
    const passenger = await this.prisma.passenger.findFirst({
      where: { id },
    });

    const hasDuplicateEmailPassenger = await this.prisma.passenger.findFirst({
      where: { email: newEmail },
    });

    if (hasDuplicateEmailPassenger) {
      return {
        resultCode: '01',
        resultMessage: 'Passenger co email da dang ki',
      };
    }

    if (!passenger) {
      return {
        resultCode: '01',
        resultMessage: 'Passenger không tồn tại hoặc không hợp lệ',
      };
    }

    if (passenger.accountLockYn === 'Y') {
      return {
        resultCode: '02',
        resultMessage: 'Passenger đang bị khóa',
      };
    }

    // Tạo OTP
    const { otp, hashedOtp, expireAt } = await generateOtp(5);

    // Cập nhật email và OTP vào DB
    await this.prisma.passenger.update({
      where: { id: passenger.id },
      data: {
        email: newEmail,
        otpCode: hashedOtp,
        otpExpire: expireAt,
      },
    });

    // Gửi mail
    try {
      await this.mailer.sendMail(
        newEmail,
        'Xác nhận tài khoản',
        `Xin chào ${passenger.fullName ?? 'bạn'}, mã xác nhận của bạn là ${otp}`,
        `<p>Xin chào <b>${passenger.fullName ?? 'bạn'}</b>,</p>
       <p>Mã xác nhận của bạn là: <b>${otp}</b></p>
       <p>Mã có hiệu lực trong 5 phút.</p>`,
      );
    } catch (err) {
      console.error('Gửi email thất bại:', err.message);
    }

    return {
      resultCode: '00',
      resultMessage:
        'Cập nhật email passenger thành công , vui long xac nhan gmail moi da tao',
      requireVerified: true,
    };
  }

  async verifyOtpToAccessEmail(id: string, otp: string) {
    try {
      if (!id) {
        return {
          resultCode: '09',
          resultMessage: 'Thiếu thông tin người dùng',
        };
      }

      const entity = await this.prisma.passenger.findUnique({
        where: { id },
      });

      if (!entity) {
        return { resultCode: '99', resultMessage: 'Không tìm thấy người dùng' };
      }

      // 2️Kiểm tra OTP tồn tại
      if (!entity.otpCode || !entity.otpExpire) {
        return {
          resultCode: '98',
          resultMessage: 'OTP không tồn tại hoặc đã được xác nhận',
        };
      }

      // 3️ Kiểm tra OTP hết hạn
      const expireDate = decimalToDate(entity.otpExpire);

      if (expireDate && expireDate < new Date()) {
        return { resultCode: '97', resultMessage: 'OTP đã hết hạn' };
      }

      // 4️ Kiểm tra mã OTP
      const isValid = await bcrypt.compare(otp, entity.otpCode);
      if (!isValid) {
        return { resultCode: '96', resultMessage: 'OTP không đúng' };
      }

      await this.prisma.passenger.update({
        where: { id: id as string },
        data: { otpCode: null, otpExpire: null, isEmailVerified: 'Y' },
      });

      return {
        resultCode: '00',
        resultMessage: 'Xác thực OTP thành công',
      };
    } catch (error) {
      console.error(' Lỗi khi xác thực OTP:', error);
      return {
        resultCode: '95',
        resultMessage: 'Lỗi hệ thống khi xác thực OTP',
      };
    }
  }

  async mfaLogin(dto: MfaLoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user)
        return { resultCode: '01', resultMessage: 'Tài khoản không tồn tại' };

      if (user.accountLockYn === 'Y') {
        return {
          resultCode: '02',
          resultMessage: 'Tài khoản đang bị khóa',
          requireUnlock: true,
        };
      }

      if (!user.mfaSecretKey) {
        return { resultCode: '01', resultMessage: 'Tài khoản chưa bật MFA' };
      }
      const verified = this.verifyMfaCode(user.mfaSecretKey, dto.code);

      if (!verified) {
        return {
          resultCode: '99',
          resultMessage: 'Mã MFA không đúng hoặc đã hết hạn',
        };
      }

      const payload = { sub: user.id, email: user.email, role: user.role };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '2h',
      });

      console.log('payload', payload);
      console.log('accessToken', accessToken);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginDate: nowDecimal(),
          authType: dto.authType,
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
      console.error('Lỗi mfaLogin:', err);
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

  private async handleLoginFail(id: number, loginFailCnt: number) {
    const newFailCnt = loginFailCnt + 1;

    if (newFailCnt >= 5) {
      await this.prisma.user.update({
        where: { id },
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
    }

    await this.prisma.user.update({
      where: { id },
      data: { loginFailCnt: newFailCnt },
    });

    return { resultCode: '99' }; // Trả về mặc định
  }

  async sendVerificationEmail(id: number) {
    try {
      const { otp, hashedOtp, expireAt } = await generateOtp(6);
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        console.error('Không tìm thấy user');
        return {
          resultCode: '01',
          resultMessage: 'Không tìm thấy user để gửi email xác nhận',
        };
      }

      if (!user.email) {
        return {
          resultCode: '02',
          resultMessage: 'User chưa có email để gửi OTP',
        };
      }

      await this.prisma.user.update({
        where: { id },
        data: {
          otpCode: hashedOtp,
          otpExpire: expireAt,
          updatedAt: nowDecimal(),
        },
      });

      try {
        const subject = 'Xác nhận tài khoản';
        const text = `Xin chào ${user?.name ?? 'bạn'}, mã xác nhận của bạn là: ${otp}`;
        const html = `
      <h3>Welcome ${user?.name}</h3>
      <p>Cảm ơn bạn đã đăng ký. Mã xác nhận của bạn là:</p>
      <h2 style="color:#2e6c80">${otp}</h2>
      <p>Mã này sẽ hết hạn sau 5 phút. Nếu không phải bạn, vui lòng bỏ qua email này.</p>
    `;

        await this.mailer.sendMail(user?.email || '', subject, text, html);
      } catch (error) {
        console.error('err0r', error);
      }
      return {
        resultCode: '00',
        resultMessage: 'Đã gửi OTP xác thực đến email của bạn',
        requireVerified: true, //todo
      };
    } catch (error) {
      console.error('error', error);
      throw error;
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

    await this.mailer.sendMail(
      email,
      'Mật khẩu tạm thời của bạn',
      `Mật khẩu tạm thời của bạn là: ${tempPassword}`,
    );

    return {
      resultCode: '00',
      resultMessage: 'Đã gửi mật khẩu tạm qua email',
    };
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

  async disabledMfaLogin(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return { resultCode: '01', resultMessage: 'Id không tồn tại' };
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        mfaEnabledYn: 'N',
        mfaSecretKey: null,
        authType: 'ID,PW',
        updatedAt: nowDecimal(),
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Đã vô hiệu hóa MFA',
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

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Decimal(Date.now() + 1000 * 60 * 15); // 15 phút

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenExpires: expiresAt,
      },
    });

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

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
        return { resultCode: '01', resultMessage: 'Thiếu userId' };
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { resultCode: '01', resultMessage: 'User không tồn tại' };
      }

      if (newPassword !== confirmPassword) {
        return {
          resultCode: '02',
          resultMessage: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
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

      return { resultCode: '00', resultMessage: 'Đổi mật khẩu thành công' };
    } catch (err) {
      console.error(' Lỗi change password:', err);
      throw err;
    }
  }

  async changePasswordInProfile(
    userId: number,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    try {
      if (!userId) {
        return { resultCode: '01', resultMessage: 'Thiếu userId' };
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { resultCode: '01', resultMessage: 'User không tồn tại' };
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return {
          resultCode: '02',
          resultMessage: 'Mật khẩu hiện tại không đúng',
        };
      }

      if (newPassword !== confirmPassword) {
        return {
          resultCode: '03',
          resultMessage: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
        };
      }

      if (newPassword.length < 8) {
        return {
          resultCode: '04',
          resultMessage: 'Mật khẩu phải ít nhất 8 ký tự',
        };
      }
      if (!/[A-Z]/.test(newPassword)) {
        return {
          resultCode: '05',
          resultMessage: 'Phải có ít nhất 1 chữ hoa',
        };
      }
      if (!/[a-z]/.test(newPassword)) {
        return {
          resultCode: '06',
          resultMessage: 'Phải có ít nhất 1 chữ thường',
        };
      }
      if (!/[0-9]/.test(newPassword)) {
        return {
          resultCode: '07',
          resultMessage: 'Phải có ít nhất 1 chữ số',
        };
      }
      if (!/[^A-Za-z0-9]/.test(newPassword)) {
        return {
          resultCode: '08',
          resultMessage: 'Phải có ít nhất 1 ký tự đặc biệt',
        };
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return {
          resultCode: '09',
          resultMessage: 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          prevPassword: user.password, // Lưu hash cũ (đúng)
          password: hashedPassword, // Gán hash mới
          tempPassword: null, // Nên để null thay vì chuỗi rỗng
          isEmailVerified: 'Y',
        },
      });

      return { resultCode: '00', resultMessage: 'Đổi mật khẩu thành công' };
    } catch (err) {
      console.error('Lỗi change password:', err);
      throw err;
    }
  }

  async updateBatchPasswordToPassenger(password: string) {
    try {
      if (!password) {
        return {
          resultCode: '99',
          resultMessage: 'password not have output',
        };
      }

      const hashedPassword = await hashPassword(password);

      await this.prisma.passenger.updateMany({
        data: { password: hashedPassword },
      });
      return { resultCode: '00', resultMessage: 'Update successful' };
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async getPassengerInfo(id: string): Promise<BaseResponseDto<PassengerDto>> {
    try {
      const passenger = await this.prisma.passenger.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          isEmailVerified: true,
          fullName: true,
          passport: true,
          accountLockYn: true,
          lastLoginDate: true,
          status: true,
          phone: true,
        },
      });

      if (!passenger) {
        return {
          resultCode: '01',
          resultMessage: 'Không tìm thấy người dùng',
        };
      }

      const safePassenger: PassengerDto = {
        ...passenger,
        lastLoginDate: passenger.lastLoginDate
          ? (passenger.lastLoginDate as Decimal).toNumber()
          : undefined,
      };

      return {
        resultCode: '00',
        resultMessage: 'Lấy thông tin người dùng thành công!',
        data: safePassenger,
      };
    } catch (error) {
      console.error('err', error);
      return {
        resultCode: '99',
        resultMessage: 'Có lỗi xảy ra khi lấy thông tin người dùng',
      };
    }
  }

  // Get permissions by category (optional feature)
  // async getPermissionsByCategory(category: string): Promise<BaseResponseDto<RolePermission>> {
  //   const res = await this.prisma.rolePermission.findMany({
  //     where: {
  //       description: {
  //         contains: category,
  //       },
  //     },
  //   });
  // }

  // // Update user permissions (optional feature)
  // async updateUserPermissions(
  //   userId: number,
  //   permissions: string[],
  // ): Promise<void> {
  //   await this.prisma.user.update({
  //     where: { id: userId },
  //     data: {
  //       permissions: {
  //         set: permissions.map((perm) => ({ name: perm })),
  //       },
  //     },
  //   });
  // }
}
