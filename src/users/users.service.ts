import {
  ConflictException,
  Injectable,
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

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  // private readonly userRepository: Repository<User>{}// ✅ Repository ở đây nè anh
  async randomPw() {
    const password = await generatePassword(true);
    return {
      resultCode: '00',
      data: password, // dùng list thay vì data vì là mảng
    };
  }
  // Lấy tất cả user
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
        // createdAt: true,
        mfaSecretKey: true,
        // ❌ Không trả password và prevPassword
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách người dùng thành công!',
      list: users, // list là T[] nên ở đây T = Partial<User>
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
        // loginFailCnt: true,
        accountLockYn: true,
        // ❌ Không trả password và prevPassword
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
        transferAdminId: true,
        // ❌ không trả password, prevPassword trừ khi thực sự cần
        sessions: {
          select: {
            id: true,
            createdAt: true,
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
      // sessions: user.sessions.map((s) => ({
      //   ...s,
      //   createdAt: (s.createdAt as Decimal).toNumber(),
      //   lastActiveAt: s.lastActiveAt
      //     ? (s.lastActiveAt as Decimal).toNumber()
      //     : undefined,
      // })),
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
        requestedAt: new Date().getTime(),
        status: 'PENDING',
      },
    });
  }

  async approveTransfer(id: number) {
    return this.prisma.transferAdmin.update({
      where: { id },
      data: {
        approvedAt: new Date().getTime(),
        status: 'APPROVED',
      },
    });
  }

  async rejectTransfer(id: number) {
    return this.prisma.transferAdmin.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  async findAllUserRequests() {
    return this.prisma.transferAdmin.findMany({ include: { user: true } });
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
        password: '',
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

  async updateUserById(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
