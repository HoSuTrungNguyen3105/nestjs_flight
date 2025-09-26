import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  constructor(
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
  ) {}
  private connectedClients = new Map<string, number>();

  handleConnection(client: Socket) {
    const token = client.handshake.auth.token || client.handshake.query.token;
    const userId = client.handshake.auth.userId;

    console.log('Client connected:', client.id);
    console.log('token connected:', token);
    console.log('userId connected:', userId);

    if (!token || !userId) {
      console.log('No token, disconnecting client:', client.id);
      client.disconnect(true); // true: close ngay lập tức
      return;
    }
    client.on('register_user', (userId: number) => {
      if (this.connectedClients.get(client.id) === userId) {
        return;
      }

      this.connectedClients.set(client.id, userId);
      client.join(`user_${userId}`);
      console.log(`User ${userId} joined room: user_${userId}`);
    });
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    const userId = this.connectedClients.get(client.id);
    if (userId) {
      console.log(`User ${userId} disconnected`);
      this.connectedClients.delete(client.id);
    }
  }

  broadcastNewMessage(message: any) {
    this.server.to(`user_${message.senderId}`).emit('new_message', message);
    this.server.to(`user_${message.receiverId}`).emit('new_message', message);
    console.log('Message broadcasted to rooms:', {
      senderRoom: `user_${message.senderId}`,
      receiverRoom: `user_${message.receiverId}`,
      messageId: message.id,
    });
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('handleMessage called', data);
    const authUserId = this.connectedClients.get(client.id);
    if (authUserId !== data.senderId) {
      client.emit('error', 'Unauthorized');
      return;
    }
    const newMessage = await this.messagesService.create(data);
    this.server
      .to(`user_${data.senderId}`)
      .to(`user_${data.receiverId}`)
      .emit('new_message', {
        id: newMessage.data?.id,
        content: newMessage.data?.content,
        createdAt: newMessage.data?.createdAt,
        sender: {
          id: newMessage.data?.sender.id,
          name: newMessage.data?.sender.name,
          pictureUrl: newMessage.data?.sender.pictureUrl,
          email: newMessage.data?.sender.email,
        },
        receiver: {
          id: newMessage.data?.receiver.id,
          name: newMessage.data?.receiver.name,
          pictureUrl: newMessage.data?.receiver.pictureUrl,
          email: newMessage.data?.receiver.email,
        },
      });
    console.log(' New message sent:', newMessage);
  }

  @SubscribeMessage('getConversations')
  async handleGetConversations(
    @MessageBody('userId') userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const data = await this.messagesService.getConversations(userId);
      client.emit('getConversationsResponse', data);
    } catch (error) {
      client.emit('getConversationsResponse', {
        resultCode: '99',
        resultMessage: 'Error: ' + error.message,
      });
    }
  }

  @SubscribeMessage('findMessagesBetweenUsers')
  async handleFindMessagesBetweenUsers(
    @MessageBody() payload: { user1Id: number; user2Id: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const data = await this.messagesService.findMessagesBetweenUsers(
        payload.user1Id,
        payload.user2Id,
      );

      client.emit('findMessagesBetweenUsers', {
        resultCode: '00',
        resultMessage: 'Success',
        data,
      });
    } catch (error) {
      client.emit('findMessagesBetweenUsers', {
        resultCode: '99',
        resultMessage: 'Error: ' + error.message,
      });
    }
  }
}
