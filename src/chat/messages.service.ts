import { Injectable } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { PrismaService } from 'src/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private messagesGateway: MessagesGateway,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    const { content, senderId, receiverId } = createMessageDto;
    if (senderId === receiverId) {
      return {
        resultCode: '01',
        resultMessage: 'Duplicated User',
      };
    }
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        createdAt: new Date().getTime().toString(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            pictureUrl: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            pictureUrl: true,
            email: true,
          },
        },
      },
    });

    this.messagesGateway.broadcastNewMessage(message);

    return {
      resultCode: '00',
      resultMessage: 'Created successfully',
      data: message,
    };
  }

  async deleteMessage(id: number) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return {
        resultCode: '01',
        resultMessage: `Message with id ${id} not found`,
      };
    }

    await this.prisma.message.delete({
      where: { id },
    });

    return {
      resultCode: '00',
      resultMessage: `Message ${id} deleted successfully`,
    };
  }

  async findMessagesBetweenUsers(user1Id: number, user2Id: number) {
    const res = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            pictureUrl: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            pictureUrl: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Find successfully',
      list: res,
    };
  }

  async findReceivedMessages(userId: number) {
    const res = await this.prisma.message.findMany({
      where: {
        receiverId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            pictureUrl: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Find successfully',
      list: res,
    };
  }

  async findSenderMessages(userId: number) {
    const res = await this.prisma.message.findMany({
      where: {
        senderId: userId,
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            pictureUrl: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Find successfully',
      list: res,
    };
  }
}
