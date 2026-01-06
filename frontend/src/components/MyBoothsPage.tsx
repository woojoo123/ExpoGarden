import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import type { Booth } from '@/types';

export const MyBoothsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // store에 user가 없지만 토큰이 있으면 사용자 정보 복원
      if (!user) {
        const tokens = localStorage.getItem('tokens');
        if (tokens) {
          try {
            const response = await apiClient.getMe();
            useStore.getState().setUser(response.data);
            await loadMyBooths();
          } catch (error) {
            // 토큰이 유효하지 않으면 메인으로
            navigate('/');
          }
        } else {
          navigate('/');
        }
      } else {
        await loadMyBooths();
      }
    };
    
    checkAuth();
  }, []);

  const loadMyBooths = async () => {
    try {
      setLoading(true);
      const currentUser = useStore.getState().user;
      // 내가 소유한 부스 조회 (상태 무관)
      const response = await apiClient.getBooths({});
      // 실제로는 /my/booths API가 필요하지만, 임시로 필터링
      setBooths(response.data.content.filter((b: Booth) => b.ownerUserId === currentUser?.id));
    } catch (error) {
      console.error('Failed to load booths:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: '#6c757d',
      SUBMITTED: '#ffc107',
      APPROVED: '#28a745',
      REJECTED: '#dc3545',
      ARCHIVED: '#6c757d',
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return <div style={styles.loading}>로딩 중...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>내 부스 관리</h1>
        <div>
          <button onClick={() => navigate('/')} style={styles.backBtn}>
            ← 전시장으로
          </button>
          <button onClick={() => navigate('/my/booths/new')} style={styles.createBtn}>
            + 새 부스 등록
          </button>
        </div>
      </div>

      {booths.length === 0 ? (
        <div style={styles.empty}>
          <p>등록된 부스가 없습니다.</p>
          <button onClick={() => navigate('/my/booths/new')} style={styles.emptyBtn}>
            첫 부스 등록하기
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {booths.map((booth) => (
            <div key={booth.id} style={styles.card}>
              {booth.thumbnailUrl && (
                <img src={booth.thumbnailUrl} alt={booth.title} style={styles.thumbnail} />
              )}
              <div style={styles.cardBody}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{booth.title}</h3>
                  <span style={{ ...styles.badge, backgroundColor: getStatusColor(booth.status) }}>
                    {booth.status}
                  </span>
                </div>
                <p style={styles.cardSummary}>{booth.summary}</p>
                <div style={styles.cardFooter}>
                  <button
                    onClick={() => navigate(`/my/booths/${booth.id}/edit`)}
                    style={styles.editBtn}
                  >
                    수정
                  </button>
                  {booth.status === 'DRAFT' && (
                    <button
                      onClick={() => handleSubmit(booth.id)}
                      style={styles.submitBtn}
                    >
                      제출
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  async function handleSubmit(boothId: number) {
    if (!confirm('이 부스를 승인 요청하시겠습니까?')) return;

    try {
      await fetch(`/api/booths/${boothId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tokens') ? JSON.parse(localStorage.getItem('tokens')!).accessToken : ''}`,
        },
      });
      alert('제출되었습니다!');
      loadMyBooths();
    } catch (error) {
      alert('제출 실패');
    }
  }
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '40px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  backBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    marginRight: '12px',
    cursor: 'pointer',
  },
  createBtn: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  emptyBtn: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  thumbnail: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },
  cardBody: {
    padding: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 500,
  },
  cardSummary: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '16px',
  },
  cardFooter: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

