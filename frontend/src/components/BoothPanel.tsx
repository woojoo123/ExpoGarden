import React, { useState } from 'react';
import type { Booth } from '@/types';
import { ChatPanel } from './ChatPanel';

interface BoothPanelProps {
  booth: Booth;
  onClose: () => void;
}

export const BoothPanel: React.FC<BoothPanelProps> = ({ booth, onClose }) => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2>{booth.title}</h2>
          <div style={styles.headerButtons}>
            <button onClick={() => setShowChat(!showChat)} style={styles.chatBtn}>
              {showChat ? '📄 정보' : '💬 채팅'}
            </button>
            <button onClick={onClose} style={styles.closeBtn}>
              ✕
            </button>
          </div>
        </div>

        <div style={styles.content}>
          {showChat ? (
            <ChatPanel boothId={booth.id} boothTitle={booth.title} />
          ) : (
            <>
          {booth.thumbnailUrl && (
            <img src={booth.thumbnailUrl} alt={booth.title} style={styles.thumbnail} />
          )}

          <div style={styles.info}>
            <p style={styles.category}>
              <strong>카테고리:</strong> {booth.category}
            </p>
            <p style={styles.owner}>
              <strong>출품자:</strong> {booth.ownerNickname}
            </p>
          </div>

          {booth.summary && <p style={styles.summary}>{booth.summary}</p>}

          {booth.description && (
            <div style={styles.description}>
              <h3>상세 설명</h3>
              <p>{booth.description}</p>
            </div>
          )}

          {booth.tags && booth.tags.length > 0 && (
            <div style={styles.tags}>
              {booth.tags.map((tag, idx) => (
                <span key={idx} style={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {booth.media && booth.media.length > 0 && (
            <div style={styles.media}>
              <h3>미디어</h3>
              <div style={styles.mediaGrid}>
                {booth.media.map((m) => (
                  <div key={m.id} style={styles.mediaItem}>
                    {m.type === 'IMAGE' && (
                      <img src={m.url} alt={m.title} style={styles.mediaImage} />
                    )}
                    {m.type === 'VIDEO' && (
                      <iframe
                        src={m.url}
                        title={m.title}
                        style={styles.mediaVideo}
                        allowFullScreen
                      />
                    )}
                    {m.type === 'LINK' && (
                      <a href={m.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                        🔗 {m.title || m.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.actions}>
            <button onClick={() => alert('질문 기능 준비 중')} style={styles.actionBtn}>
              질문하기
            </button>
            <button onClick={() => alert('방명록 기능 준비 중')} style={styles.actionBtn}>
              방명록 남기기
            </button>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  headerButtons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  chatBtn: {
    padding: '8px 16px',
    backgroundColor: '#17a2b8',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
  },
  content: {
    padding: '20px',
    overflowY: 'auto',
  },
  thumbnail: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  info: {
    marginBottom: '16px',
  },
  category: {
    marginBottom: '8px',
  },
  owner: {
    marginBottom: '8px',
    color: '#666',
  },
  summary: {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '20px',
  },
  description: {
    marginBottom: '20px',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
  },
  tag: {
    backgroundColor: '#e9ecef',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '14px',
  },
  media: {
    marginBottom: '20px',
  },
  mediaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '12px',
  },
  mediaItem: {
    borderRadius: '8px',
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  mediaVideo: {
    width: '100%',
    height: '200px',
    border: 'none',
  },
  link: {
    display: 'block',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    textDecoration: 'none',
    color: '#007bff',
    borderRadius: '4px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  actionBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 500,
  },
};

