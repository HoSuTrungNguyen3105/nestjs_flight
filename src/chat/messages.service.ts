import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { PrismaService } from 'src/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { nowDecimal } from 'src/common/helpers/format';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => MessagesGateway))
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    try {
      const { content, senderId, receiverId } = createMessageDto;
      if (senderId === receiverId) {
        return {
          resultCode: '01',
          resultMessage: 'Duplicated User',
        };
      }
      const hasSenderAccount = await this.prisma.user.findUnique({
        where: {
          id: senderId,
        },
      });

      const hasReceiverAccount = await this.prisma.user.findUnique({
        where: {
          id: receiverId,
        },
      });
      if (!hasSenderAccount || !hasReceiverAccount) {
        return {
          resultCode: '02',
          resultMessage: 'Created failed - user not found',
        };
      }

      const message = await this.prisma.message.create({
        data: {
          content,
          senderId,
          receiverId,
          createdAt: nowDecimal(),
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
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
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
          {
            AND: [{ senderId: user1Id }, { receiverId: user2Id }],
          },
          {
            AND: [{ senderId: user2Id }, { receiverId: user1Id }],
          },
        ],
      },
      orderBy: {
        createdAt: 'desc', // sắp xếp mới nhất trước
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
    return {
      resultCode: '00',
      resultMessage: 'Find successfully',
      list: res,
    };
  }

  async findReceivedMessages(userId: number) {
    try {
      const res = await this.prisma.message.findMany({
        where: {
          receiverId: userId,
        },
        orderBy: {
          createdAt: 'desc', // sắp xếp mới nhất trước
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return {
        resultCode: '00',
        resultMessage: 'Find successfully',
        list: res,
      };
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async getConversations(userId: number) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    const conversations = new Map<
      number,
      { userId: number; name: string; lastMessage: string }
    >();

    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          userId: otherUser.id,
          name: otherUser.name,
          lastMessage: msg.content,
        });
      }
    }

    return {
      resultCode: '00',
      resultMessage: 'Find successfully',
      list: Array.from(conversations.values()),
    };
  }

  async findSenderMessages(userId: number) {
    const hasSender = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!hasSender) {
      return {
        resultCode: '02',
        resultMessage: 'Find failed',
      };
    }
    const res = await this.prisma.message.findMany({
      where: {
        senderId: userId,
      },
      orderBy: {
        createdAt: 'desc', // sắp xếp mới nhất trước
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    // const list = res.map((m) => ({
    //   ...m,
    //   createdAt: m.createdAt.toString(), // Decimal -> string
    // }));
    return {
      resultCode: '00',
      resultMessage: 'Find successfully',
      list: res,
    };
  }
}
