import React, { useEffect, useState, useRef } from 'react';
import { ChatService } from '@/services/ChatService';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import type { ChatMessage } from '@/types';

interface ChatPanelProps {
  boothId: number;
  boothTitle: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ boothId, boothTitle }) => {
  const { user, clearUnreadChat } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatService] = useState(() => new ChatService());
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const username = user?.nickname || `게스트${Math.floor(Math.random() * 10000)}`;
    let isActive = true;
    setMessages([]);
    clearUnreadChat(boothId);

    const loadHistory = async () => {
      try {
        const response = await apiClient.getChatMessages(boothId);
        if (!isActive) return;
        const history = [...response.data.content].reverse();
        setMessages(history);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };

    loadHistory();

    chatService.connect(boothId, username, (message) => {
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, message];
      });
      clearUnreadChat(boothId);
    });

    setIsConnected(true);

    return () => {
      isActive = false;
      chatService.disconnect();
      setIsConnected(false);
    };
  }, [boothId, user, clearUnreadChat]);

  useEffect(() => {
    // 새 메시지가 오면 스크롤을 맨 아래로
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    chatService.sendMessage(inputMessage);
    setInputMessage('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>💬 실시간 채팅</h3>
        <span style={statusStyle(isConnected)}>
          {isConnected ? '● 연결됨' : '○ 연결 끊김'}
        </span>
      </div>

      <div style={styles.subtitle}>
        {boothTitle}
      </div>

      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyMessage}>
            <p>💬 첫 메시지를 남겨보세요!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={styles.messageWrapper}>
              {msg.type === 'JOIN' || msg.type === 'LEAVE' ? (
                <div style={styles.systemMessage}>
                  {msg.message}
                </div>
              ) : (
                <div style={styles.chatMessage}>
                  <div style={styles.messageHeader}>
                    <span style={styles.username}>{msg.username}</span>
                    <span style={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                  </div>
                  <div style={styles.messageContent}>{msg.message}</div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={styles.inputForm}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          style={styles.input}
          disabled={!isConnected}
        />
        <button
          type="submit"
          style={styles.sendButton}
          disabled={!isConnected || !inputMessage.trim()}
        >
          전송
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '500px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
  },
  subtitle: {
    padding: '8px 16px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    fontSize: '13px',
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    backgroundColor: '#f5f5f5',
  },
  emptyMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
    textAlign: 'center',
  },
  messageWrapper: {
    marginBottom: '12px',
  },
  systemMessage: {
    textAlign: 'center',
    padding: '8px',
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#007bff',
  },
  chatMessage: {
    backgroundColor: '#fff',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  username: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#007bff',
  },
  timestamp: {
    fontSize: '11px',
    color: '#999',
  },
  messageContent: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.4',
  },
  inputForm: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#fff',
    borderTop: '1px solid #dee2e6',
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
  },
};

const statusStyle = (isConnected: boolean): React.CSSProperties => ({
  fontSize: '12px',
  color: isConnected ? '#90EE90' : '#FFB6C1',
});
