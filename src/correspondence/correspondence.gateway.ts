import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import {
  Server,
  Socket,
} from 'socket.io';

import { CorrespondenceService } from './correspondence.service';

import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  namespace: '/correspondence',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class CorrespondenceGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly correspondenceService: CorrespondenceService,
  ) {}

  // =========================================================
  // CONNECTION
  // =========================================================

  handleConnection(
    client: Socket,
  ) {
    console.log(
      `Correspondence socket connected: ${client.id}`,
    );
  }

  // =========================================================
  // DISCONNECT
  // =========================================================

  handleDisconnect(
    client: Socket,
  ) {
    console.log(
      `Correspondence socket disconnected: ${client.id}`,
    );
  }

  // =========================================================
  // JOIN THREAD
  // =========================================================

  @SubscribeMessage('join_thread')
  async joinThread(
    @ConnectedSocket() client: Socket,

    @MessageBody()
    data: {
      thread_id: number;
      user_id: number;
    },
  ) {
    const threadId =
      Number(data.thread_id);

    const userId =
      Number(data.user_id);

    await this.correspondenceService.getThread(
      threadId,
      userId,
    );

    const room =
      this.getThreadRoom(threadId);

    await client.join(room);

    client.emit('joined_thread', {
      success: true,
      thread_id: threadId,
    });

    return {
      success: true,
      message: 'Joined conversation',
    };
  }

  // =========================================================
  // LEAVE THREAD
  // =========================================================

  @SubscribeMessage('leave_thread')
  async leaveThread(
    @ConnectedSocket() client: Socket,

    @MessageBody()
    data: {
      thread_id: number;
    },
  ) {
    const room =
      this.getThreadRoom(
        Number(data.thread_id),
      );

    await client.leave(room);

    return {
      success: true,
      message: 'Left conversation',
    };
  }

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  @SubscribeMessage('send_message')
  async sendMessage(
    @ConnectedSocket() client: Socket,

    @MessageBody()
    data: {
      user_id: number;
      sender_type:
        | 'admin'
        | 'employer'
        | 'applicant'
        | 'system';

      message: SendMessageDto;
    },
  ) {
    const result =
      await this.correspondenceService.sendMessage(
        Number(data.user_id),
        data.message,
      );

    const room =
      this.getThreadRoom(
        data.message.thread_id,
      );

    this.server
      .to(room)
      .emit('new_message', result);

    return {
      success: true,
      data: result,
    };
  }

  // =========================================================
  // TYPING
  // =========================================================

  @SubscribeMessage('typing')
  async typing(
    @ConnectedSocket() client: Socket,

    @MessageBody()
    data: {
      thread_id: number;
      user_id: number;
      is_typing: boolean;
    },
  ) {
    const room =
      this.getThreadRoom(
        Number(data.thread_id),
      );

    client.to(room).emit('user_typing', {
      user_id: Number(data.user_id),
      thread_id: Number(data.thread_id),
      is_typing: data.is_typing,
    });

    return {
      success: true,
    };
  }

  // =========================================================
  // READ MESSAGE
  // =========================================================

  @SubscribeMessage('mark_read')
  async markRead(
    @ConnectedSocket() client: Socket,

    @MessageBody()
    data: {
      thread_id: number;
      user_id: number;
      message_id: number;
    },
  ) {
    const result =
      await this.correspondenceService.markAsRead(
        Number(data.thread_id),
        Number(data.user_id),
        Number(data.message_id),
      );

    const room =
      this.getThreadRoom(
        Number(data.thread_id),
      );

    client.to(room).emit(
      'messages_read',
      {
        user_id: Number(data.user_id),
        message_id: Number(data.message_id),
        thread_id: Number(data.thread_id),
      },
    );

    return result;
  }

  // =========================================================
  // ROOM
  // =========================================================

  private getThreadRoom(
    threadId: number,
  ): string {
    return `correspondence_thread_${threadId}`;
  }
}