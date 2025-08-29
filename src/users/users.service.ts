import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Role } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generatePassword } from './hooks/randompw';
import { UserResponseDto } from './dto/info-user-dto';
import { formatUserResponse, toEpochDecimal } from 'src/common/helpers/hook';
import { Decimal } from 'generated/prisma/runtime/library';
import { MailService } from 'src/common/nodemailer/nodemailer.service';
import { nowDecimal } from 'src/common/helpers/base.helper';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async randomPw() {
    const password = await generatePassword(true);
    return {
      resultCode: '00',
      data: password,
    };
  }

  async getAllUsers(): Promise<BaseResponseDto<Partial<UserResponseDto>>> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        pictureUrl: true,
        rank: true,
        role: true,
        authType: true,
        userAlias: true,
        loginFailCnt: true,
        accountLockYn: true,
        mfaEnabledYn: true,
        mfaSecretKey: true,
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách người dùng thành công!',
      list: users,
    };
  }

  // Lấy user theo ID
  async getUserById(
    id: number,
  ): Promise<BaseResponseDto<Partial<UserResponseDto>>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        pictureUrl: true,
        rank: true,
        role: true,
        authType: true,
        isEmailVerified: true,
        mfaEnabledYn: true,
        userAlias: true,
        accountLockYn: true,
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách người dùng thành công!',
      data: user, // dùng list thay vì data vì là mảng
    };
  }

  async getUserInfo(
    id: number,
  ): Promise<BaseResponseDto<Partial<UserResponseDto>>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        pictureUrl: true,
        rank: true,
        role: true,
        authType: true,
        isEmailVerified: true,
        mfaEnabledYn: true,
        userAlias: true,
        accountLockYn: true,
        loginFailCnt: true,
        lastLoginDate: true,
        createdAt: true,
        updatedAt: true,
        // transferAdminId: true,
        transferAdmin: true,
        sessions: {
          select: {
            id: true,
            createdAt: true,
            userId: true,
          },
        },
      },
    });

    if (!user) {
      return {
        resultCode: '01',
        resultMessage: 'Không tìm thấy người dùng',
        data: null,
      };
    }

    // ✅ Convert Decimal -> number
    const safeUser: UserResponseDto = {
      ...user,
      createdAt: (user.createdAt as Decimal).toNumber(),
      updatedAt: (user.updatedAt as Decimal).toNumber(),
      lastLoginDate: user.lastLoginDate
        ? (user.lastLoginDate as Decimal).toNumber()
        : undefined,
    };

    return {
      resultCode: '00',
      resultMessage: 'Lấy thông tin người dùng thành công!',
      data: safeUser,
    };
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async requestTransfer(data: {
    userId: number;
    fromUserId: number;
    toUserId: number;
  }) {
    return this.prisma.transferAdmin.create({
      data: {
        ...data,
        requestedAt: nowDecimal(),
        status: 'PENDING',
      },
    });
  }

  async approveTransfer(userId: number) {
    try {
      const transfer = await this.prisma.transferAdmin.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!transfer) {
        throw new NotFoundException(
          `Không tìm thấy Transfer với userId = ${userId}`,
        );
      }

      const [updatedTransfer, updatedUser] = await this.prisma.$transaction([
        this.prisma.transferAdmin.update({
          where: { userId },
          data: {
            status: 'APPROVED',
            approvedAt: new Date().getTime().toString(),
          },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { role: 'ADMIN' },
        }),
      ]);

      return {
        resultCode: '00',
        message: '✅ Transfer approved thành công',
        transfer: updatedTransfer,
        user: updatedUser,
      };
    } catch (error) {
      console.error('🔥 Error approving transfer:', error);
      throw error;
    }
  }

  async rejectTransfer(userId: number) {
    try {
      const transfer = await this.prisma.transferAdmin.findUnique({
        where: { userId }, // 👈 tìm theo userId
      });

      if (!transfer) {
        throw new NotFoundException(
          `Không tìm thấy Transfer với userId = ${userId}`,
        );
      }

      return await this.prisma.transferAdmin.update({
        where: { userId },
        data: { status: 'REJECTED' },
      });
    } catch (error) {
      console.error('🔥 Error rejecting transfer:', error);
      throw error; // để Postman nhận được lỗi chi tiết
    }
  }

  async findAllUserRequests() {
    try {
      const transt = this.prisma.transferAdmin.findMany({
        include: {
          user: {
            select: {
              id: true,
              transferAdmin: true,
              role: true,
            },
          },
        },
      });
      return transt;
    } catch (error) {
      console.error('Error finding all user requests:', error);
      throw new InternalServerErrorException('Error finding all user requests');
    }
  }

  async createUserByAdmin(
    dto: CreateUserDto,
  ): Promise<BaseResponseDto<UserResponseDto | null>> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email đã tồn tại');
    }

    const defaultPassword = dto.password ?? generatePassword(true);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        tempPassword: hashedPassword,
        name: dto.name ?? '',
        pictureUrl: '',
        rank: '',
        role: dto.role as Role,
        authType: 'ID,PW',
        userAlias: '',
        createdAt: toEpochDecimal(), // lưu Decimal
        updatedAt: toEpochDecimal(),
      },
    });

    // Gửi email thông báo (nếu lỗi thì log, không throw)
    try {
      await this.mailService.sendMail(
        dto.email, // ✅ gửi đến email người dùng vừa tạo
        'Tài khoản của bạn đã được tạo',
        `Xin chào ${dto.name ?? 'bạn'},\n\nTài khoản của bạn đã được tạo thành công.\nMật khẩu mặc định: ${defaultPassword}`,
        `<p>Xin chào <b>${dto.name ?? 'bạn'}</b>,</p>
       <p>Tài khoản của bạn đã được tạo thành công.</p>
       <p><b>Mật khẩu mặc định:</b> ${defaultPassword}</p>
       <p>Vui lòng đăng nhập và đổi mật khẩu ngay.</p>`,
      );
    } catch (err) {
      console.error('Gửi email thất bại:', err.message);
    }

    return {
      resultCode: '00',
      resultMessage: 'Tạo người dùng thành công!',
      data: formatUserResponse(user), // ✅ format đúng kiểu DTO
    };
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // User gửi yêu cầu mở khóa
  async requestUnlock(userId: number, reason: string) {
    // Check xem user có request nào đang PENDING không
    const existing = await this.prisma.unlockRequest.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    if (existing) {
      return {
        resultCode: '99',
        resultMessage: 'Bạn đã gửi yêu cầu mở khóa, vui lòng chờ xử lý!',
      };
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user)
      return {
        resultCode: '99',
        resultMessage: 'User không tồn tại!',
      };

    if (user.accountLockYn !== 'Y') {
      return {
        resultCode: '99',
        resultMessage: 'Tài khoản chưa bị khóa, không cần mở khóa!',
      };
    }
    if (user.isEmailVerified !== 'Y') {
      return {
        resultCode: '99',
        resultMessage: 'Email chưa được xác thực, không thể mở khóa!',
      };
    }

    return this.prisma.unlockRequest.create({
      data: {
        userId,
        reason,
        createdAt: nowDecimal(),
      },
    });
  }

  // Admin duyệt mở khóa
  async approveUnlockRequest(requestId: number) {
    const req = await this.prisma.unlockRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });
    if (!req) throw new BadRequestException('Yêu cầu không tồn tại!');

    if (req.status !== 'PENDING') {
      throw new BadRequestException('Yêu cầu đã được xử lý!');
    }

    // Mở khóa user
    await this.prisma.user.update({
      where: { id: req.userId },
      data: {
        accountLockYn: 'N',
        loginFailCnt: 0,
      },
    });

    // Cập nhật trạng thái yêu cầu
    return this.prisma.unlockRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        approvedAt: nowDecimal(),
      },
    });
  }

  async approveAllUnlockRequests() {
    // Lấy tất cả request đang chờ
    const requests = await this.prisma.unlockRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: true },
    });

    if (requests.length === 0) {
      return {
        responseCode: '99',
        responseMessage: 'Không có yêu cầu nào cần xử lý!',
      };
    }

    // Chạy transaction để đảm bảo đồng bộ
    return this.prisma.$transaction(async (tx) => {
      // Mở khóa toàn bộ user liên quan
      for (const req of requests) {
        await tx.user.update({
          where: { id: req.userId },
          data: {
            accountLockYn: 'N',
            loginFailCnt: 0,
          },
        });

        await tx.unlockRequest.update({
          where: { id: req.id },
          data: {
            status: 'APPROVED',
            approvedAt: nowDecimal(),
          },
        });
      }

      return {
        responseCode: '00',
        responseMessage: `${requests.length} yêu cầu đã được duyệt và mở khóa.`,
      };
    });
  }

  // Admin từ chối
  async rejectUnlockRequest(requestId: number) {
    return this.prisma.unlockRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        approvedAt: nowDecimal(),
      },
    });
  }

  // Admin xem tất cả yêu cầu
  // async getAllUnlockRequests() {
  //   const res = await this.prisma.unlockRequest.findMany({
  //     include: { user: true },
  //     orderBy: { createdAt: 'desc' },
  //   });
  //   return {
  //     responseCode: '00',
  //     responseMessage: 'Lấy danh sách yêu cầu mở khóa thành công!',
  //     data: res,
  //   };
  // }

  async updateUserById(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        responseCode: '99',
        responseMessage: `User with ID ${id} not found`,
      };
    }

    // Kiểm tra role cũ và role mới
    const isRoleChangingToAdmin =
      updateUserDto.role === Role.ADMIN && user.role !== Role.ADMIN;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        name: updateUserDto.name,
        pictureUrl: updateUserDto.pictureUrl,
        rank: updateUserDto.rank,
        role: updateUserDto.role,
        userAlias: updateUserDto.userAlias,
        updatedAt: toEpochDecimal(),
      },
      select: {
        id: true,
        name: true,
        pictureUrl: true,
        rank: true,
        role: true,
        userAlias: true,
      },
    });

    // Nếu đổi role thành ADMIN thì tạo request TransferAdmin
    if (isRoleChangingToAdmin) {
      // Ví dụ: tìm 1 admin hiện tại để gán làm "toUserId"
      const existingAdmin = await this.prisma.user.findFirst({
        where: { role: Role.ADMIN, NOT: { id: updatedUser.id } },
        select: { id: true },
      });

      await this.prisma.transferAdmin.create({
        data: {
          userId: updatedUser.id,
          fromUserId: updatedUser.id,
          toUserId: existingAdmin ? existingAdmin.id : updatedUser.id,
          status: 'PENDING',
          requestedAt: toEpochDecimal(),
          approvedAt: null,
        },
      });
    }

    return {
      resultCode: '00',
      resultMessage: 'Cập nhật người dùng thành công!',
      data: updatedUser,
      result: isRoleChangingToAdmin
        ? 'Đã tạo request TransferAdmin'
        : 'Không có thay đổi role',
    };
  }

  // user.service.ts
  async deleteAllUsers() {
    await this.prisma.user.deleteMany({}); // Không truyền where -> xoá hết
    return {
      resultCode: '00',
      resultMessage: 'Xoá toàn bộ người dùng thành công!',
    };
  }

  async setAccountLockChange(
    id: number,
  ): Promise<BaseResponseDto<{ accountLockYn: string }>> {
    const current = await this.prisma.user.findUnique({
      where: { id },
      select: { accountLockYn: true },
    });
    if (!current) {
      return { resultCode: '01', resultMessage: 'User không tồn tại!' };
    }

    const newValue = current.accountLockYn === 'N' ? 'Y' : 'N';
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { accountLockYn: newValue },
      select: { accountLockYn: true },
    });

    return {
      resultCode: '00',
      resultMessage: `Đã đổi trạng thái accountLockYn từ ${current.accountLockYn} → ${updatedUser.accountLockYn} thành công!`,
      data: updatedUser,
    };
  }

  async delete(id: number) {
    try {
      const user = await this.prisma.user.delete({ where: { id } });
      return user;
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
}
