import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface ChatNotification {
  boothId: number;
  messageId: string;
  username: string;
  messagePreview: string;
  timestamp: string;
}

export class ChatNotificationService {
  private client: Client | null = null;
  private connectedUserId: number | null = null;

  connect(userId: number, onNotification: (notification: ChatNotification) => void) {
    if (this.connectedUserId === userId && this.client?.active) return;

    this.disconnect();
    this.connectedUserId = userId;

    this.client = new Client({
      webSocketFactory: () => new SockJS('/api/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.client?.subscribe(`/topic/owner.${userId}`, (message: IMessage) => {
          const payload: ChatNotification = JSON.parse(message.body);
          onNotification(payload);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP notification error:', frame);
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.connectedUserId = null;
  }
}
