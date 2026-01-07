import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/api/client';
import type { Booth, Page } from '@/types';

export const BoothListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [booths, setBooths] = useState<Booth[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // 필터 상태
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const currentPage = parseInt(searchParams.get('page') || '0');
  
  // 카테고리 목록 (개인 창작 위주로 확장)
  const categories = [
    'all',
    '아트/디자인',
    '사진/영상',
    '일러스트',
    '게임',
    '음악',
    '3D',
    '프로그래밍',
    '기타'
  ];

  useEffect(() => {
    loadBooths();
  }, [searchParams]);

  const loadBooths = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBooths({
        exhibitionId: 1, // 기본 전시회 (tech-expo-2026)
        status: 'APPROVED', // 승인된 부스만
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        q: searchQuery || undefined,
        page: currentPage,
        size: 12,
      });
      
      const pageData = response.data as Page<Booth>;
      setBooths(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
    } catch (error) {
      console.error('Failed to load showrooms:', error);
      alert('쇼룸 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    params.set('page', '0');
    setSearchParams(params);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category !== 'all') params.set('category', category);
    params.set('page', '0');
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  const handleBoothClick = (boothId: number) => {
    // 쇼룸 상세 페이지로 이동
    navigate(`/showroom/${boothId}`);
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate('/')} style={styles.backButton}>
            ← 메인으로
          </button>
          <h1 style={styles.title}>쇼룸 갤러리</h1>
          <div style={styles.headerStats}>
            총 <strong>{totalElements}</strong>개 쇼룸
          </div>
        </div>
      </header>

      {/* 검색 및 필터 */}
      <div style={styles.filterSection}>
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="쇼룸 검색... (제목, 설명, 태그)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={styles.searchInput}
          />
          <button onClick={handleSearch} style={styles.searchButton}>
            🔍 검색
          </button>
        </div>

        <div style={styles.categoryFilter}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              style={{
                ...styles.categoryButton,
                ...(selectedCategory === cat ? styles.categoryButtonActive : {}),
              }}
            >
              {cat === 'all' ? '전체' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 부스 그리드 */}
      {loading ? (
        <div style={styles.loading}>로딩 중...</div>
      ) : booths.length === 0 ? (
        <div style={styles.empty}>
          <p>검색 결과가 없습니다.</p>
          <button onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSearchParams({});
          }} style={styles.resetButton}>
            검색 초기화
          </button>
        </div>
      ) : (
        <>
          <div style={styles.boothGrid}>
            {booths.map((booth) => (
              <div
                key={booth.id}
                style={styles.boothCard}
                onClick={() => handleBoothClick(booth.id)}
              >
                <div style={styles.boothThumbnail}>
                  <img
                    src={booth.thumbnailUrl}
                    alt={booth.title}
                    style={styles.thumbnailImage}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  <div style={styles.categoryBadge}>{booth.category}</div>
                </div>
                <div style={styles.boothContent}>
                  <h3 style={styles.boothTitle}>{booth.title}</h3>
                  <p style={styles.boothSummary}>{booth.summary}</p>
                  <div style={styles.boothTags}>
                    {booth.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} style={styles.tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div style={styles.boothFooter}>
                    <span style={styles.owner}>👤 {booth.ownerNickname}</span>
                    <span style={styles.visitButton}>자세히 보기 →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                style={styles.pageButton}
              >
                ← 이전
              </button>
              <span style={styles.pageInfo}>
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                style={styles.pageButton}
              >
                다음 →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '20px 40px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  headerStats: {
    fontSize: '16px',
    color: '#666',
  },
  filterSection: {
    maxWidth: '1200px',
    margin: '30px auto',
    padding: '0 40px',
  },
  searchBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
  },
  searchButton: {
    padding: '12px 24px',
    backgroundColor: '#5b4cdb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  categoryFilter: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  categoryButton: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  categoryButtonActive: {
    backgroundColor: '#5b4cdb',
    color: '#fff',
    borderColor: '#5b4cdb',
  },
  boothGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 40px 40px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  boothCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  boothThumbnail: {
    position: 'relative',
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '4px 12px',
    backgroundColor: 'rgba(91, 76, 219, 0.9)',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  boothContent: {
    padding: '16px',
  },
  boothTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  boothSummary: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 12px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.4',
  },
  boothTags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  tag: {
    fontSize: '12px',
    color: '#5b4cdb',
    backgroundColor: '#f0edff',
    padding: '2px 8px',
    borderRadius: '8px',
  },
  boothFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #f0f0f0',
  },
  owner: {
    fontSize: '13px',
    color: '#999',
  },
  visitButton: {
    fontSize: '13px',
    color: '#5b4cdb',
    fontWeight: 'bold',
  },
  pagination: {
    maxWidth: '1200px',
    margin: '0 auto 40px',
    padding: '0 40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
  },
  pageButton: {
    padding: '10px 20px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  pageInfo: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '500',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '18px',
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  resetButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#5b4cdb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
};

