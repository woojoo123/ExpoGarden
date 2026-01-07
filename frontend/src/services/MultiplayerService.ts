import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface PlayerPosition {
  userId: number;
  nickname: string;
  x: number;
  y: number;
  charIndex: number;
  hallId: number;
  timestamp: string;
  type: 'JOIN' | 'LEAVE' | 'UPDATE';
}

export class MultiplayerService {
  private client: Client | null = null;
  private hallId: number | null = null;
  private userId: number | null = null;
  private nickname: string = '';
  private charIndex: number = 0;
  private lastPositionSent: number = 0;
  private readonly THROTTLE_MS = 100; // 100ms마다 위치 전송

  connect(
    hallId: number,
    userId: number,
    nickname: string,
    charIndex: number,
    initialX: number,
    initialY: number,
    onPlayerUpdate: (position: PlayerPosition) => void
  ) {
    this.hallId = hallId;
    this.userId = userId;
    this.nickname = nickname;
    this.charIndex = charIndex;

    this.client = new Client({
      webSocketFactory: () => new SockJS('/api/ws'),
      debug: (str) => {
        console.log('[Multiplayer STOMP]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[MultiplayerService] Connected to WebSocket for hall', hallId, 'userId:', userId);
        
        // 홀별 플레이어 위치 구독
        const subscription = this.client?.subscribe(`/topic/hall.${hallId}`, (message: IMessage) => {
          try {
            console.log('[MultiplayerService] Raw message received:', {
              destination: message.headers.destination,
              body: message.body,
              command: message.command,
            });
            
            const position: PlayerPosition = JSON.parse(message.body);
            console.log('[MultiplayerService] Received position update:', {
              type: position.type,
              userId: position.userId,
              myUserId: this.userId,
              nickname: position.nickname,
              x: position.x,
              y: position.y,
            });
            
            // 자신의 메시지는 무시
            if (position.userId !== this.userId) {
              console.log('[MultiplayerService] Processing other player update');
              onPlayerUpdate(position);
            } else {
              console.log('[MultiplayerService] Ignoring own message');
            }
          } catch (error) {
            console.error('[MultiplayerService] Error parsing message:', error, message.body);
          }
        });
        
        console.log('[MultiplayerService] Subscribed to /topic/hall.' + hallId, subscription);

        // 입장 메시지 전송
        console.log('[MultiplayerService] Sending join message...');
        this.sendJoinMessage(initialX, initialY);
      },
      onStompError: (frame) => {
        console.error('[MultiplayerService] STOMP error:', frame);
      },
      onWebSocketError: (event) => {
        console.error('[MultiplayerService] WebSocket error:', event);
      },
      onDisconnect: () => {
        console.log('[MultiplayerService] Disconnected from WebSocket');
      },
    });

    this.client.activate();
  }

  private sendJoinMessage(x: number, y: number) {
    if (!this.client || !this.hallId || this.userId === null) {
      console.warn('[MultiplayerService] Cannot send join message:', {
        hasClient: !!this.client,
        hallId: this.hallId,
        userId: this.userId,
      });
      return;
    }

    const joinMessage = {
      userId: this.userId,
      nickname: this.nickname,
      x: x,
      y: y,
      charIndex: this.charIndex,
      type: 'JOIN' as const,
    };

    console.log('[MultiplayerService] Sending join message:', joinMessage);

    this.client.publish({
      destination: `/app/player.join.${this.hallId}`,
      body: JSON.stringify(joinMessage),
    });
  }

  sendPosition(x: number, y: number) {
    if (!this.client || !this.hallId || this.userId === null) {
      return;
    }

    // Throttle: 100ms마다만 전송
    const now = Date.now();
    if (now - this.lastPositionSent < this.THROTTLE_MS) {
      return;
    }
    this.lastPositionSent = now;

    if (!this.client.connected) {
      console.warn('[MultiplayerService] Client not connected, cannot send position');
      return;
    }

    this.client.publish({
      destination: `/app/player.position.${this.hallId}`,
      body: JSON.stringify({
        userId: this.userId,
        nickname: this.nickname,
        x: x,
        y: y,
        charIndex: this.charIndex,
        type: 'UPDATE',
      }),
    });
  }

  disconnect() {
    if (this.client && this.hallId && this.userId !== null) {
      // 퇴장 메시지 전송
      this.client.publish({
        destination: `/app/player.leave.${this.hallId}`,
        body: JSON.stringify({
          userId: this.userId,
          nickname: this.nickname,
          type: 'LEAVE',
        }),
      });

      // 잠시 대기 후 연결 종료 (퇴장 메시지가 전송될 시간 확보)
      setTimeout(() => {
        if (this.client) {
          this.client.deactivate();
          this.client = null;
        }
      }, 100);
    } else {
      if (this.client) {
        this.client.deactivate();
        this.client = null;
      }
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

