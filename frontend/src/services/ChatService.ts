import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '@/types';

export class ChatService {
  private client: Client | null = null;
  private boothId: number | null = null;
  private username: string = '';

  connect(boothId: number, username: string, onMessageReceived: (message: ChatMessage) => void) {
    this.boothId = boothId;
    this.username = username;

    this.client = new Client({
      webSocketFactory: () => new SockJS('/api/ws'),
      debug: (str) => {
        console.log('[STOMP]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        
        // 부스별 채팅방 구독
        this.client?.subscribe(`/topic/booth.${boothId}`, (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          onMessageReceived(chatMessage);
        });

        // 입장 메시지 전송
        this.sendJoinMessage();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    this.client.activate();
  }

  private sendJoinMessage() {
    if (!this.client || !this.boothId) return;

    this.client.publish({
      destination: `/app/chat.join.${this.boothId}`,
      body: JSON.stringify({
        username: this.username,
        type: 'JOIN',
      }),
    });
  }

  sendMessage(message: string) {
    if (!this.client || !this.boothId || !message.trim()) return;

    this.client.publish({
      destination: `/app/chat.booth.${this.boothId}`,
      body: JSON.stringify({
        username: this.username,
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
