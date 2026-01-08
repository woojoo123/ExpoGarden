import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import type { Hall } from '@/types';
import { getBackgroundPathForHall } from '@/utils/hallMapping';

export const HallLobby: React.FC = () => {
  const navigate = useNavigate();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [boothCounts, setBoothCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    loadHalls();
  }, []);

  const loadHalls = async () => {
    try {
      // 전시 1의 모든 홀 로드
      const hallsResponse = await apiClient.getHalls(1);
      const hallsData = hallsResponse.data;
      setHalls(hallsData);

      // 각 홀의 부스 개수 조회
      const counts: Record<number, number> = {};
      await Promise.all(
        hallsData.map(async (hall) => {
          try {
            const boothsResponse = await apiClient.getBooths({
              exhibitionId: 1,
              hallId: hall.id,
              status: 'APPROVED',
            });
            counts[hall.id] = boothsResponse.data.content.length;
          } catch (error) {
            console.error(`Failed to load booths for hall ${hall.id}:`, error);
            counts[hall.id] = 0;
          }
        })
      );
      setBoothCounts(counts);
    } catch (error) {
      console.error('Failed to load halls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHallClick = (hallId: number) => {
    navigate(`/metaverse/${hallId}`);
  };

  if (loading) {
    return <div style={styles.loading}>로딩 중...</div>;
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <h1 style={styles.title}>🎮 ExpoGarden - 홀 선택</h1>
        <p style={styles.subtitle}>
          카테고리별 홀을 선택하여 메타버스에 입장하세요
        </p>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← 메인으로
        </button>
      </div>

      {/* 홀 그리드 */}
      <div style={styles.hallsGrid}>
        {halls.map((hall) => (
          <div
            key={hall.id}
            style={styles.hallCard}
            onClick={() => handleHallClick(hall.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
          >
            {/* 배경 이미지 */}
            <div style={styles.hallImageContainer}>
              <img
                src={getBackgroundPathForHall(hall.id)}
                alt={hall.name}
                style={styles.hallImage}
              />
              <div style={styles.hallOverlay}>
                <h2 style={styles.hallName}>{hall.name}</h2>
                <p style={styles.hallBoothCount}>
                  {boothCounts[hall.id] || 0}개 쇼룸
                </p>
              </div>
            </div>

            {/* 입장 버튼 */}
            <div style={styles.hallFooter}>
              <button style={styles.enterButton}>
                입장하기 →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 안내 */}
      <div style={styles.info}>
        <p style={styles.infoText}>
          💡 각 홀은 독립된 메타버스 공간입니다. 홀 내에서 다른 홀로 이동할 수도 있습니다.
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f0f0f',
    color: '#ffffff',
    padding: '40px 20px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
    position: 'relative',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '18px',
    color: '#a0a0a0',
    margin: 0,
  },
  backButton: {
    position: 'absolute',
    top: '0',
    left: '0',
    padding: '12px 24px',
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  hallsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
  },
  hallCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  hallImageContainer: {
    position: 'relative',
    width: '100%',
    height: '220px',
    overflow: 'hidden',
  },
  hallImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  hallOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '24px',
  },
  hallName: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#ffffff',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
  },
  hallBoothCount: {
    fontSize: '16px',
    color: '#e0e0e0',
    margin: 0,
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
  },
  hallFooter: {
    padding: '20px',
  },
  enterButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#5b4cdb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  info: {
    maxWidth: '800px',
    margin: '60px auto 0',
    padding: '24px',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    textAlign: 'center',
  },
  infoText: {
    fontSize: '16px',
    color: '#a0a0a0',
    margin: 0,
    lineHeight: '1.6',
  },
};

