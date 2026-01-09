import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import type { Booth, GuestbookEntry } from '@/types';

export const ShowroomDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useStore();
  
  const [showroom, setShowroom] = useState<Booth | null>(null);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (id) {
      loadShowroom();
      loadGuestbook();
      
      // 생성 완료 후 이동한 경우 성공 메시지 표시
      if (searchParams.get('created') === 'true') {
        setShowSuccessMessage(true);
        // 5초 후 자동으로 숨김
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }
    }
  }, [id, searchParams]);

  const loadShowroom = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBooth(Number(id));
      setShowroom(response.data);
    } catch (error: any) {
      console.error('Failed to load showroom:', error);
      
      // 401 Unauthorized: 승인되지 않은 쇼룸이거나 권한 없음
      if (error.response?.status === 401) {
        if (!user) {
          alert('이 쇼룸은 아직 승인 대기 중입니다.\n승인된 쇼룸만 공개적으로 볼 수 있습니다.');
        } else {
          alert('이 쇼룸은 아직 승인 대기 중입니다.\n소유자만 접근할 수 있습니다.');
        }
        navigate('/booths');
      } else {
        alert('쇼룸을 불러오는데 실패했습니다.');
        navigate('/booths');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadGuestbook = async () => {
    try {
      const response = await apiClient.getGuestbook(Number(id));
      setGuestbook(response.data.content);
    } catch (error) {
      console.error('Failed to load guestbook:', error);
    }
  };

  const handleEnterMetaverse = () => {
    // 메타버스 입장은 로그인 필요
    if (!user) {
      alert('메타버스 입장을 위해 로그인이 필요합니다.');
      localStorage.setItem('returnTo', `showroom/${id}`);
      navigate('/login');
      return;
    }
    
    // 로그인되어 있으면 메타버스 입장
    navigate(`/metaverse?showroomId=${id}`);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/showroom/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('링크가 복사되었습니다! 🎉\n친구들에게 공유해보세요.');
    });
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner}>⏳</div>
        <p>쇼룸을 불러오는 중...</p>
      </div>
    );
  }

  if (!showroom) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* 성공 메시지 */}
      {showSuccessMessage && (
        <div style={styles.successBanner}>
          <div style={styles.successContent}>
            <span style={styles.successIcon}>🎉</span>
            <div>
              <h3 style={styles.successTitle}>쇼룸이 완성되었습니다!</h3>
              <p style={styles.successText}>
                지금 바로 링크를 복사해서 친구들에게 공유하세요!
              </p>
            </div>
            <button onClick={handleCopyLink} style={styles.copyLinkButton}>
              🔗 링크 복사하기
            </button>
            <button onClick={() => setShowSuccessMessage(false)} style={styles.closeButton}>
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* 헤더 */}
      <header style={styles.header}>
        <button onClick={() => navigate('/booths')} style={styles.backButton}>
          ← 갤러리로 돌아가기
        </button>
        <button onClick={() => navigate('/')} style={styles.homeButton}>
          🏛️ ExpoGarden
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={styles.main}>
        {/* 이미지 슬라이더 */}
        <section style={styles.heroSection}>
          <div style={styles.imageSlider}>
            <div style={styles.mainImage}>
              <img
                src={showroom.media[selectedMedia]?.url || showroom.thumbnailUrl}
                alt={showroom.media[selectedMedia]?.title || showroom.title}
                style={styles.image}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=No+Image';
                }}
              />
            </div>
            {showroom.media.length > 1 && (
              <div style={styles.thumbnails}>
                {showroom.media.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMedia(idx)}
                    style={{
                      ...styles.thumbnail,
                      ...(selectedMedia === idx ? styles.thumbnailActive : {}),
                    }}
                  >
                    {media.type === 'IMAGE' ? (
                      <img src={media.url} alt={media.title} style={styles.thumbnailImage} />
                    ) : media.type === 'VIDEO' ? (
                      <div style={styles.thumbnailVideo}>▶️</div>
                    ) : (
                      <div style={styles.thumbnailLink}>🔗</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 메타버스 입장 CTA */}
          <div style={styles.metaverseCTA}>
            <div style={styles.ctaContent}>
              <h3 style={styles.ctaTitle}>🎮 메타버스에서 3D로 둘러보기</h3>
              <p style={styles.ctaDesc}>
                캐릭터를 조작하며 이 쇼룸을 직접 걸어다니며 관람하세요!
              </p>
              <button onClick={handleEnterMetaverse} style={styles.metaverseButton}>
                메타버스 입장하기 👉
              </button>
            </div>
          </div>
        </section>

        {/* 쇼룸 정보 */}
        <section style={styles.infoSection}>
          <div style={styles.infoHeader}>
            <div>
              <h1 style={styles.title}>{showroom.title}</h1>
              <p style={styles.owner}>by {showroom.ownerNickname}</p>
            </div>
            <div style={styles.headerActions}>
              <div style={styles.badge}>{showroom.category}</div>
              <button onClick={handleCopyLink} style={styles.shareButton}>
                🔗 공유
              </button>
            </div>
          </div>

          <div style={styles.stats}>
            <div style={styles.stat}>
              <span style={styles.statIcon}>📸</span>
              <span style={styles.statText}>작품 {showroom.media.length}개</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statIcon}>💬</span>
              <span style={styles.statText}>방명록 {guestbook.length}개</span>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📖 소개</h2>
            <p style={styles.description}>{showroom.description}</p>
          </div>

          {showroom.tags.length > 0 && (
            <>
              <div style={styles.divider} />
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🏷️ 태그</h2>
                <div style={styles.tags}>
                  {showroom.tags.map((tag, idx) => (
                    <span key={idx} style={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 방명록 */}
          <div style={styles.divider} />
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📝 방명록 ({guestbook.length})</h2>
            {guestbook.length === 0 ? (
              <p style={styles.emptyMessage}>아직 방명록이 없습니다. 첫 방명록을 남겨보세요!</p>
            ) : (
              <div style={styles.guestbookList}>
                {guestbook.slice(0, 5).map((entry) => (
                  <div key={entry.id} style={styles.guestbookItem}>
                    <div style={styles.guestbookHeader}>
                      <span style={styles.guestbookAuthor}>{entry.userNickname}</span>
                      <span style={styles.guestbookDate}>
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={styles.guestbookMessage}>{entry.message}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleEnterMetaverse} style={styles.writeGuestbookButton}>
              방명록 작성하기 (메타버스에서)
            </button>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer style={styles.footer}>
        <p>© 2026 ExpoGarden - 메타버스 쇼룸 플랫폼</p>
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  successBanner: {
    backgroundColor: '#4caf50',
    color: '#fff',
    padding: '16px 40px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  successContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  successIcon: {
    fontSize: '32px',
  },
  successTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
  },
  successText: {
    fontSize: '14px',
    margin: 0,
    opacity: 0.9,
  },
  copyLinkButton: {
    marginLeft: 'auto',
    padding: '10px 20px',
    backgroundColor: '#fff',
    color: '#4caf50',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  closeButton: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  header: {
    backgroundColor: '#fff',
    padding: '16px 40px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  homeButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  heroSection: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    marginBottom: '40px',
  },
  imageSlider: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  mainImage: {
    width: '100%',
    height: '500px',
    backgroundColor: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbnails: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    overflowX: 'auto',
  },
  thumbnail: {
    width: '80px',
    height: '80px',
    border: '2px solid transparent',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    padding: 0,
  },
  thumbnailActive: {
    borderColor: '#5b4cdb',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbnailVideo: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  thumbnailLink: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  metaverseCTA: {
    backgroundColor: '#5b4cdb',
    borderRadius: '12px',
    padding: '32px',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(91, 76, 219, 0.3)',
  },
  ctaContent: {
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  ctaDesc: {
    fontSize: '14px',
    marginBottom: '24px',
    opacity: 0.9,
  },
  metaverseButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#fff',
    color: '#5b4cdb',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  infoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  shareButton: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
  },
  owner: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
  badge: {
    padding: '8px 16px',
    backgroundColor: '#5b4cdb',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  stats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statIcon: {
    fontSize: '20px',
  },
  statText: {
    fontSize: '14px',
    color: '#666',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '24px 0',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#666',
    whiteSpace: 'pre-wrap',
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tag: {
    padding: '6px 12px',
    backgroundColor: '#f0edff',
    color: '#5b4cdb',
    borderRadius: '12px',
    fontSize: '14px',
  },
  guestbookList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '16px',
  },
  guestbookItem: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  guestbookHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  guestbookAuthor: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  guestbookDate: {
    fontSize: '12px',
    color: '#999',
  },
  guestbookMessage: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  writeGuestbookButton: {
    padding: '12px 24px',
    backgroundColor: '#5b4cdb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  emptyMessage: {
    fontSize: '14px',
    color: '#999',
    textAlign: 'center',
    padding: '40px 20px',
  },
  footer: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#999',
    fontSize: '14px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  loadingSpinner: {
    fontSize: '48px',
    marginBottom: '16px',
  },
};
