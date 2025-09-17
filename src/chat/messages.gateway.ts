import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@Injectable()
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private connectedClients = new Map<string, number>();

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client connecting: ${client.id}`);

      // Lấy token từ query parameters hoặc handshake auth
      const token = client.handshake.auth.token;

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Xác thực JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const userId = payload.sub;

      if (!userId) {
        this.logger.warn(`Client ${client.id} has invalid token`);
        client.disconnect();
        return;
      }

      // Lưu thông tin user
      this.connectedClients.set(client.id, userId);
      client.join(`user_${userId}`);

      this.logger.log(`User ${userId} connected with client ${client.id}`);

      // Gửi sự kiện xác nhận kết nối thành công
      client.emit('connection_success', { userId });
    } catch (error) {
      this.logger.error(
        `Authentication failed for client ${client.id}:`,
        error,
      );
      client.emit('connection_error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedClients.get(client.id);
    if (userId) {
      this.logger.log(`User ${userId} disconnected`);
      this.connectedClients.delete(client.id);
    } else {
      this.logger.log(`Unknown client disconnected: ${client.id}`);
    }
  }

  // Kiểm tra user đã đăng nhập
  private getUserIdFromClient(client: Socket): number | null {
    const userId = this.connectedClients.get(client.id);
    if (!userId) {
      client.emit('error', { message: 'User not authenticated' });
      return null;
    }
    return userId;
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(client: Socket, data: any) {
    const userId = this.getUserIdFromClient(client);
    if (!userId) return;

    // Kiểm tra người gửi có phải là user đang đăng nhập không
    if (data.senderId !== userId) {
      client.emit('error', { message: 'Unauthorized: senderId mismatch' });
      return;
    }

    this.logger.log(`User ${userId} sent message to ${data.receiverId}`);

    // Xử lý tin nhắn và broadcast
    this.broadcastNewMessage(data);
  }

  broadcastNewMessage(message: any) {
    const { senderId, receiverId } = message;

    this.server.to(`user_${senderId}`).emit('new_message', message);
    this.server.to(`user_${receiverId}`).emit('new_message', message);

    this.logger.log(`Message broadcasted to users: ${senderId}, ${receiverId}`);
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(client: Socket, data: { receiverId: number }) {
    const userId = this.getUserIdFromClient(client);
    if (!userId) return;

    this.server.to(`user_${data.receiverId}`).emit('user_typing', {
      senderId: userId,
      typing: true,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(client: Socket, data: { receiverId: number }) {
    const userId = this.getUserIdFromClient(client);
    if (!userId) return;

    this.server.to(`user_${data.receiverId}`).emit('user_typing', {
      senderId: userId,
      typing: false,
    });
  }

  // API để lấy danh sách user online
  @SubscribeMessage('get_online_users')
  handleGetOnlineUsers(client: Socket) {
    const userId = this.getUserIdFromClient(client);
    if (!userId) return;

    const onlineUsers = Array.from(this.connectedClients.values());
    client.emit('online_users', onlineUsers);
  }
}
