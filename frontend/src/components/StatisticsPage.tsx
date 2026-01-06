import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import type { Exhibition } from '@/types';

interface ExhibitionStats {
  exhibitionId: number;
  exhibitionTitle: string;
  totalViews: number;
  uniqueVisitors: number;
  totalBooths: number;
  topBooths: Array<{
    boothId: number;
    boothTitle: string;
    totalViews: number;
    uniqueVisitors: number;
  }>;
}

export const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useStore();
  
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<number | null>(null);
  const [stats, setStats] = useState<ExhibitionStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      alert('관리자 권한이 필요합니다');
      navigate('/');
      return;
    }

    loadExhibitions();
  }, [user]);

  useEffect(() => {
    const exhibitionIdParam = searchParams.get('exhibitionId');
    if (exhibitionIdParam) {
      setSelectedExhibitionId(Number(exhibitionIdParam));
    } else if (exhibitions.length > 0 && !selectedExhibitionId) {
      setSelectedExhibitionId(exhibitions[0].id);
    }
  }, [exhibitions, searchParams]);

  useEffect(() => {
    if (selectedExhibitionId) {
      loadStats(selectedExhibitionId);
    }
  }, [selectedExhibitionId]);

  const loadExhibitions = async () => {
    try {
      const response = await apiClient.getExhibitions();
      setExhibitions(response.data.content);
    } catch (error) {
      console.error('Failed to load exhibitions:', error);
    }
  };

  const loadStats = async (exhibitionId: number) => {
    setLoading(true);
    try {
      const response = await apiClient.getExhibitionStats(exhibitionId);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      alert('통계를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div style={styles.loading}>로딩 중...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📊 전시 통계 대시보드</h1>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← 전시장으로
        </button>
      </div>

      <div style={styles.filterSection}>
        <label style={styles.filterLabel}>전시 선택:</label>
        <select
          value={selectedExhibitionId || ''}
          onChange={(e) => setSelectedExhibitionId(Number(e.target.value))}
          style={styles.filterSelect}
        >
          {exhibitions.map((exhibition) => (
            <option key={exhibition.id} value={exhibition.id}>
              {exhibition.title}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👁️</div>
          <div style={styles.statValue}>{stats.totalViews.toLocaleString()}</div>
          <div style={styles.statLabel}>총 조회수</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statValue}>{stats.uniqueVisitors.toLocaleString()}</div>
          <div style={styles.statLabel}>고유 방문자</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏢</div>
          <div style={styles.statValue}>{stats.totalBooths.toLocaleString()}</div>
          <div style={styles.statLabel}>총 부스 수</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📈</div>
          <div style={styles.statValue}>
            {stats.uniqueVisitors > 0
              ? (stats.totalViews / stats.uniqueVisitors).toFixed(1)
              : '0'}
          </div>
          <div style={styles.statLabel}>평균 조회/방문자</div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🏆 인기 부스 TOP 10</h2>
        {stats.topBooths.length === 0 ? (
          <p style={styles.emptyMessage}>아직 통계 데이터가 없습니다.</p>
        ) : (
          <div style={styles.table}>
            <table style={styles.tableElement}>
              <thead>
                <tr>
                  <th style={styles.th}>순위</th>
                  <th style={styles.th}>부스명</th>
                  <th style={styles.th}>총 조회수</th>
                  <th style={styles.th}>고유 방문자</th>
                  <th style={styles.th}>평균 조회/방문자</th>
                </tr>
              </thead>
              <tbody>
                {stats.topBooths.map((booth, index) => (
                  <tr key={booth.boothId} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.rank(index + 1)}>{index + 1}</span>
                    </td>
                    <td style={styles.td}>
                      <strong>{booth.boothTitle}</strong>
                    </td>
                    <td style={styles.td}>{booth.totalViews.toLocaleString()}</td>
                    <td style={styles.td}>{booth.uniqueVisitors.toLocaleString()}</td>
                    <td style={styles.td}>
                      {(booth.totalViews / Math.max(booth.uniqueVisitors, 1)).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '40px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  backBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  filterLabel: {
    fontWeight: 500,
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '300px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  statIcon: {
    fontSize: '36px',
    marginBottom: '12px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '20px',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    padding: '40px',
  },
  table: {
    overflowX: 'auto',
  },
  tableElement: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontWeight: 600,
    borderBottom: '2px solid #dee2e6',
  },
  tr: {
    borderBottom: '1px solid #dee2e6',
  },
  td: {
    padding: '12px',
  },
  rank: (position: number): React.CSSProperties => ({
    display: 'inline-block',
    width: '30px',
    height: '30px',
    lineHeight: '30px',
    borderRadius: '50%',
    backgroundColor: position <= 3 ? '#ffc107' : '#e9ecef',
    color: position <= 3 ? '#fff' : '#333',
    fontWeight: 'bold',
  }),
};

