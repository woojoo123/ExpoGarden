import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { apiClient } from '@/api/client';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useStore();

  const handleEnterMetaverse = () => {
    if (!user) {
      // 로그인 필요 - 로그인 페이지로 이동
      localStorage.setItem('returnTo', 'metaverse');
      navigate('/login');
    } else {
      // 이미 로그인됨 → 캐릭터 선택으로
      navigate('/character-selection');
    }
  };

  const handleLogin = () => {
    // 헤더 로그인 - 로그인 페이지로 이동
    localStorage.setItem('returnTo', 'main');
    navigate('/login');
  };

  const handleLogout = () => {
    apiClient.clearTokens();
    useStore.getState().setUser(null);
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🏛️</span>
          <span style={styles.logoText}>ExpoGarden</span>
        </div>
        <nav style={styles.nav}>
          <a href="#features" style={styles.navLink}>소개</a>
          <button onClick={() => navigate('/booths')} style={styles.navLinkButton}>쇼룸 갤러리</button>
          <a href="#contact" style={styles.navLink}>문의</a>
          {user?.role === 'ADMIN' && (
            <button onClick={() => navigate('/admin/booths')} style={styles.navButton}>
              🛡️ 관리자
            </button>
          )}
          {user ? (
            <div style={styles.userInfo}>
              {/* <span style={styles.userName}>{user.nickname}</span> */}
              <button onClick={handleLogout} style={styles.logoutBtn}>로그아웃</button>
            </div>
          ) : (
            <button onClick={handleLogin} style={styles.loginBtn}>로그인</button>
          )}
        </nav>
      </header>

      {/* 메인 섹션 */}
      <main style={styles.main}>
        <div style={styles.heroSection}>
          <div style={styles.leftPanel}>
            <h1 style={styles.title}>ExpoGarden</h1>
            <p style={styles.subtitle}>메타버스 쇼룸 플랫폼</p>
            <p style={styles.description}>
              당신의 작품을 메타버스 공간에 전시하세요.
            </p>
            <p style={styles.description}>
              포트폴리오, 작품 갤러리, 프로젝트 쇼케이스를 3분 만에 만들고, 2D 메타버스에서 방문자들이 직접 걸어다니며 관람할 수 있습니다.
            </p>
            <div style={styles.features}>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>✨</span>
                <div>
                  <h3 style={styles.featureTitle}>3분 만에 쇼룸 만들기</h3>
                  <p style={styles.featureText}>복잡한 설정 없이 사진과 영상만 올리면 나만의 메타버스 쇼룸이 완성됩니다</p>
                </div>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>🚶</span>
                <div>
                  <h3 style={styles.featureTitle}>캐릭터로 걸어다니며 관람</h3>
                  <p style={styles.featureText}>2D 탑다운 메타버스에서 캐릭터를 조작하며 다른 사람의 쇼룸을 방문하세요</p>
                </div>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>💬</span>
                <div>
                  <h3 style={styles.featureTitle}>실시간 소통</h3>
                  <p style={styles.featureText}>방문자와 실시간 채팅하고, 방명록과 질문을 통해 피드백을 받으세요</p>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.rightPanel}>
            {user ? (
              // 로그인 상태 - 빠른 실행 카드
              <div style={styles.quickActionsCard}>
                <h2 style={styles.welcomeTitle}>안녕하세요, {user.nickname}님! 👋</h2>
                <p style={styles.welcomeSubtitle}>무엇을 하시겠어요?</p>
                
                <div style={styles.actionButtons}>
                  <button onClick={() => navigate('/my/booths')} style={styles.actionCard}>
                    <span style={styles.actionIcon}>🎨</span>
                    <h3 style={styles.actionTitle}>내 쇼룸 관리</h3>
                    <p style={styles.actionDesc}>내가 만든 쇼룸을 관리하세요</p>
                  </button>
                  
                  <button onClick={() => navigate('/my/booths/new')} style={styles.actionCard}>
                    <span style={styles.actionIcon}>✨</span>
                    <h3 style={styles.actionTitle}>쇼룸 만들기</h3>
                    <p style={styles.actionDesc}>3분 만에 쇼룸 완성!</p>
                  </button>
                  
                  <button onClick={() => navigate('/booths')} style={styles.actionCard}>
                    <span style={styles.actionIcon}>🖼️</span>
                    <h3 style={styles.actionTitle}>쇼룸 갤러리</h3>
                    <p style={styles.actionDesc}>다른 사람들의 쇼룸 구경</p>
                  </button>
                  
                  <button onClick={handleEnterMetaverse} style={styles.actionCard}>
                    <span style={styles.actionIcon}>🎮</span>
                    <h3 style={styles.actionTitle}>메타버스 입장</h3>
                    <p style={styles.actionDesc}>전시회를 둘러보세요</p>
                  </button>
                  
                  {user.role === 'ADMIN' && (
                    <button onClick={() => navigate('/admin/statistics')} style={styles.actionCard}>
                      <span style={styles.actionIcon}>📊</span>
                      <h3 style={styles.actionTitle}>통계 보기</h3>
                      <p style={styles.actionDesc}>전시회 통계를 확인하세요</p>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // 비로그인 상태 - 메타버스 입장 카드
              <div style={styles.previewCard}>
                <h2 style={styles.previewTitle}>ExpoGarden 메타버스에 오신걸 환영합니다</h2>
                <div style={styles.previewImage}>
                  <div style={styles.previewPlaceholder}>
                    <span style={styles.previewIcon}>🎮</span>
                    <p style={styles.previewText}>2D 메타버스로 구현된 전시 공간</p>
                  </div>
                </div>
                <button onClick={() => navigate('/booths')} style={styles.browseBoothsBtn}>
                  🖼️ 쇼룸 갤러리 구경하기
                </button>
                <button onClick={handleEnterMetaverse} style={styles.enterBtn}>
                  메타버스 입장하기 👉
                </button>
                <p style={styles.loginHint}>※ 메타버스 입장은 로그인이 필요합니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 왜 사용해야 하는가 섹션 */}
        <section id="features" style={styles.whySection}>
          <h2 style={styles.whyTitle}>누가 ExpoGarden을 사용하나요?</h2>
          <div style={styles.benefitsGrid}>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>🎨</div>
              <h3 style={styles.benefitTitle}>디자이너 & 아티스트</h3>
              <p style={styles.benefitText}>
                포트폴리오를 메타버스 공간에 전시하세요. 평범한 이미지 나열이 아닌, 방문자가 직접 걸어다니며 감상하는 특별한 경험을 제공합니다.
              </p>
            </div>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>🎓</div>
              <h3 style={styles.benefitTitle}>학생 & 졸업전시</h3>
              <p style={styles.benefitText}>
                졸업 작품, 프로젝트 결과물을 온라인 전시회로 만드세요. 코로나 시대에도 안전하게, 전 세계 누구나 관람할 수 있습니다.
              </p>
            </div>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>📸</div>
              <h3 style={styles.benefitTitle}>창작자 & 크리에이터</h3>
              <p style={styles.benefitText}>
                사진, 일러스트, 게임, 음악 등 모든 창작물을 전시할 수 있습니다. 소규모 굿즈샵이나 작품 판매도 가능합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 푸터 */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerLogo}>
              <span style={styles.logoIcon}>🏛️</span>
              <span style={styles.logoText}>ExpoGarden</span>
            </div>
            <p style={styles.footerText}>© 2026 ExpoGarden. 지금 바로 입장해 보세요.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 60px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    fontSize: '32px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
  },
  navLink: {
    fontSize: '16px',
    color: '#666',
    textDecoration: 'none',
    fontWeight: '500',
  },
  navLinkButton: {
    fontSize: '16px',
    color: '#666',
    fontWeight: '500',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  navButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loginBtn: {
    padding: '10px 24px',
    backgroundColor: '#5b4cdb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  main: {
    width: '100%',
  },
  heroSection: {
    display: 'flex',
    gap: '60px',
    padding: '80px 60px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  leftPanel: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#222',
    margin: 0,
  },
  subtitle: {
    fontSize: '24px',
    color: '#555',
    margin: 0,
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#666',
    margin: 0,
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginTop: '20px',
  },
  feature: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  featureIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
  },
  featureText: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  rightPanel: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '500px',
  },
  previewTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '24px',
  },
  previewImage: {
    width: '100%',
    height: '300px',
    backgroundColor: '#f0f0f0',
    borderRadius: '12px',
    marginBottom: '24px',
    overflow: 'hidden',
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8e8e8',
  },
  previewIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  previewText: {
    fontSize: '16px',
    color: '#666',
  },
  browseBoothsBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#fff',
    color: '#5b4cdb',
    border: '2px solid #5b4cdb',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '12px',
    transition: 'all 0.3s ease',
  },
  enterBtn: {
    width: '100%',
    padding: '18px',
    backgroundColor: '#5b4cdb',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(91, 76, 219, 0.4)',
    transition: 'all 0.3s ease',
  },
  whySection: {
    backgroundColor: '#fff',
    padding: '80px 60px',
  },
  whyTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: '60px',
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  benefitCard: {
    padding: '40px 30px',
    backgroundColor: '#f8f9fa',
    borderRadius: '16px',
    textAlign: 'center',
  },
  benefitIcon: {
    fontSize: '48px',
    marginBottom: '20px',
  },
  benefitTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  benefitText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#666',
  },
  footer: {
    backgroundColor: '#2d2d2d',
    padding: '40px 60px',
    color: '#fff',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  footerLogo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  footerText: {
    fontSize: '14px',
    color: '#aaa',
    margin: 0,
  },
  // 빠른 실행 카드 스타일
  quickActionsCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '8px',
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '32px',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  actionCard: {
    backgroundColor: '#f8f9fa',
    border: '2px solid transparent',
    borderRadius: '16px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  actionIcon: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  actionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  actionDesc: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
  },
  loginHint: {
    fontSize: '14px',
    color: '#999',
    textAlign: 'center',
    marginTop: '12px',
  },
};

