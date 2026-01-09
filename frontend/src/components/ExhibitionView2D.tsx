import React, { useEffect, useState } from 'react';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import { BoothPanel } from '@/components/BoothPanel';
import { AdminPanel } from '@/components/AdminPanel';
import type { Exhibition, Hall, Booth } from '@/types';

export const ExhibitionView2D: React.FC = () => {
  const { sessionId } = useStore();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentExhibition, setCurrentExhibition] = useState<Exhibition | null>(null);
  const [currentHall, setCurrentHall] = useState<Hall | null>(null);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // 전시 목록 로드
  useEffect(() => {
    apiClient.getExhibitions('PUBLISHED').then((response) => {
      if (response.data.content.length > 0) {
        const firstExhibition = response.data.content[0];
        setCurrentExhibition(firstExhibition);
        loadHalls(firstExhibition.id);
      }
      setLoading(false);
    });
  }, []);

  // 홀 목록 로드
  const loadHalls = async (exhibitionId: number) => {
    const response = await apiClient.getHalls(exhibitionId);
    setHalls(response.data);
    if (response.data.length > 0) {
      const firstHall = response.data[0];
      setCurrentHall(firstHall);
      loadBooths(exhibitionId, firstHall.id);
    }
  };

  // 부스 목록 로드
  const loadBooths = async (exhibitionId: number, hallId: number) => {
    const response = await apiClient.getBooths({
      exhibitionId,
      hallId,
      status: 'APPROVED',
    });
    setBooths(response.data.content);

    // 트래킹: 홀 진입
    apiClient.trackEvent({
      exhibitionId,
      sessionId,
      action: 'ENTER_HALL',
      metadata: { hallId },
    });
  };

  const handleBoothClick = (booth: Booth) => {
    setSelectedBooth(booth);

    // 트래킹: 부스 조회
    if (currentExhibition) {
      apiClient.trackEvent({
        exhibitionId: currentExhibition.id,
        boothId: booth.id,
        sessionId,
        action: 'VIEW',
      });
    }
  };

  const handleHallChange = (hallId: number) => {
    const hall = halls.find((h) => h.id === hallId);
    if (hall && currentExhibition) {
      setCurrentHall(hall);
      loadBooths(currentExhibition.id, hallId);
      setSearchQuery('');
      setSelectedCategory('');
    }
  };

  // 필터링된 부스 목록
  const filteredBooths = booths.filter((booth) => {
    const matchesSearch = searchQuery === '' || 
      booth.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booth.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || booth.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 카테고리 목록 추출
  const categories = Array.from(new Set(booths.map(b => b.category).filter(Boolean)));

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '아트/디자인': '#ef4444',
      '사진/영상': '#8b5cf6',
      '일러스트': '#ec4899',
      '게임': '#10b981',
      '음악': '#f59e0b',
      '3D': '#06b6d4',
      '프로그래밍': '#6366f1',
      'AI': '#3b82f6',
      '기타': '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  if (loading) {
    return <div style={styles.loading}>로딩 중...</div>;
  }

  if (!currentExhibition || !currentHall) {
    return <div style={styles.error}>전시 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div style={styles.container}>
      {/* 상단 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>{currentExhibition.title}</h1>
          <p style={styles.subtitle}>{currentExhibition.description}</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.hallSelector}>
            <label style={styles.label}>홀 선택:</label>
            <select
              value={currentHall.id}
              onChange={(e) => handleHallChange(Number(e.target.value))}
              style={styles.select}
            >
              {halls.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.name} ({hall.boothCount}개 부스)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 관리자 패널 */}
      <AdminPanel />

      {/* 필터 섹션 */}
      <div style={styles.filterSection}>
        <input
          type="text"
          placeholder="🔍 부스 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={styles.categorySelect}
        >
          <option value="">모든 카테고리</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div style={styles.boothCount}>
          {filteredBooths.length}개의 부스
        </div>
      </div>

      {/* 부스 그리드 */}
      <div style={styles.content}>
        {filteredBooths.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>검색 결과가 없습니다</p>
          </div>
        ) : (
          <div style={styles.boothGrid}>
            {filteredBooths.map((booth) => (
              <div
                key={booth.id}
                style={styles.boothCard}
                onClick={() => handleBoothClick(booth)}
              >
                {/* 부스 썸네일 */}
                <div
                  style={{
                    ...styles.boothThumbnail,
                    backgroundColor: getCategoryColor(booth.category),
                  }}
                >
                  {booth.thumbnailUrl ? (
                    <img
                      src={booth.thumbnailUrl}
                      alt={booth.title}
                      style={styles.thumbnailImage}
                    />
                  ) : (
                    <div style={styles.thumbnailPlaceholder}>
                      <span style={styles.placeholderIcon}>🏢</span>
                    </div>
                  )}
                </div>

                {/* 부스 정보 */}
                <div style={styles.boothInfo}>
                  <div style={styles.boothCategory}>
                    <span
                      style={{
                        ...styles.categoryBadge,
                        backgroundColor: getCategoryColor(booth.category),
                      }}
                    >
                      {booth.category || '일반'}
                    </span>
                  </div>
                  
                  <h3 style={styles.boothTitle}>{booth.title}</h3>
                  <p style={styles.boothSummary}>{booth.summary}</p>
                  
                  <div style={styles.boothFooter}>
                    <span style={styles.boothOwner}>👤 {booth.ownerNickname}</span>
                    {booth.tags && booth.tags.length > 0 && (
                      <div style={styles.tags}>
                        {booth.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} style={styles.tag}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 부스 상세 패널 */}
      {selectedBooth && (
        <BoothPanel booth={selectedBooth} onClose={() => setSelectedBooth(null)} />
      )}

      {/* 안내 */}
      <div style={styles.instructions}>
        💡 부스 카드를 클릭하면 상세 정보를 볼 수 있습니다
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    display: 'flex',
    flexDirection: 'column',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#ef4444',
  },
  header: {
    backgroundColor: '#fff',
    padding: '24px 32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
    color: '#1f2937',
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    color: '#6b7280',
  },
  hallSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  filterSection: {
    padding: '20px 32px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '10px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
  },
  categorySelect: {
    padding: '10px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  boothCount: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 500,
  },
  content: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#9ca3af',
  },
  boothGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  boothCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #e5e7eb',
  } as React.CSSProperties & { ':hover'?: React.CSSProperties },
  boothThumbnail: {
    width: '100%',
    height: '180px',
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: '64px',
    opacity: 0.3,
  },
  boothInfo: {
    padding: '16px',
  },
  boothCategory: {
    marginBottom: '8px',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  boothTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#1f2937',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  boothSummary: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.5',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  boothFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f3f4f6',
  },
  boothOwner: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  tags: {
    display: 'flex',
    gap: '4px',
  },
  tag: {
    fontSize: '11px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '2px 6px',
    borderRadius: '3px',
  },
  instructions: {
    padding: '16px 32px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280',
  },
};
