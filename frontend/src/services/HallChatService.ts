import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface HallChatMessage {
  hallId: number;
  userId: number;
  nickname: string;
  message: string;
  timestamp: string;
  type: 'CHAT';
}

export class HallChatService {
  private client: Client | null = null;
  private hallId: number | null = null;
  private userId: number | null = null;
  private nickname: string = '';

  connect(
    hallId: number,
    userId: number,
    nickname: string,
    onMessageReceived: (message: HallChatMessage) => void
  ) {
    this.hallId = hallId;
    this.userId = userId;
    this.nickname = nickname;

    this.client = new Client({
      webSocketFactory: () => new SockJS('/api/ws'),
      debug: (str) => {
        console.log('[HallChat STOMP]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.client?.subscribe(`/topic/hall.chat.${hallId}`, (message: IMessage) => {
          const chatMessage: HallChatMessage = JSON.parse(message.body);
          onMessageReceived(chatMessage);
        });
      },
      onStompError: (frame) => {
        console.error('[HallChat] STOMP error:', frame);
      },
    });

    this.client.activate();
  }

  sendMessage(message: string) {
    if (!this.client || !this.hallId || this.userId === null || !message.trim()) return;

    this.client.publish({
      destination: `/app/chat.hall.${this.hallId}`,
      body: JSON.stringify({
        userId: this.userId,
        nickname: this.nickname,
        message: message.trim(),
        type: 'CHAT',
      }),
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}
