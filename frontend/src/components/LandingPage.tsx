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
          <a href="#about" style={styles.navLink}>서비스</a>
          <a href="#contact" style={styles.navLink}>문의</a>
          {user && (
            <>
              <button onClick={() => navigate('/my/booths')} style={styles.navButton}>
                📋 내 부스
              </button>
              <button onClick={() => navigate('/my/booths/new')} style={styles.navButton}>
                ➕ 부스 신청
              </button>
              {user.role === 'ADMIN' && (
                <button onClick={() => navigate('/admin/booths')} style={styles.navButton}>
                  🛡️ 관리자
                </button>
              )}
            </>
          )}
          {user ? (
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user.nickname}</span>
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
            <p style={styles.subtitle}>메타버스 전시회 플랫폼</p>
            <p style={styles.description}>
              메타버스에서 전시회를 개최하고 관람할 수 있는 플랫폼 'ExpoGarden'.
            </p>
            <p style={styles.description}>
              물리적 공간의 제약 없이 전 세계 어디서나 참가 신청, 부스 운영, 전시 관람이 가능합니다. 2D 메타버스 공간에서 실제 전시회와 유사한 경험을 제공합니다.
            </p>
            <div style={styles.features}>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>📋</span>
                <div>
                  <h3 style={styles.featureTitle}>참가 신청 및 부스 운영</h3>
                  <p style={styles.featureText}>온라인으로 참가 신청하고, 승인된 부스에서 제품과 서비스를 전시하세요</p>
                </div>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>🗺️</span>
                <div>
                  <h3 style={styles.featureTitle}>부스 배치도 및 메타버스 탐방</h3>
                  <p style={styles.featureText}>전시 홀의 부스 배치도를 확인하고, 캐릭터로 걸어다니며 각 부스를 방문하세요</p>
                </div>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>💼</span>
                <div>
                  <h3 style={styles.featureTitle}>비즈니스 상담 및 네트워킹</h3>
                  <p style={styles.featureText}>실시간 채팅으로 구매상담, 수출상담, 투자설명회 등 비즈니스 활동을 진행하세요</p>
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
                    <span style={styles.actionIcon}>📋</span>
                    <h3 style={styles.actionTitle}>내 부스 관리</h3>
                    <p style={styles.actionDesc}>운영 중인 부스를 관리하세요</p>
                  </button>
                  
                  <button onClick={() => navigate('/my/booths/new')} style={styles.actionCard}>
                    <span style={styles.actionIcon}>➕</span>
                    <h3 style={styles.actionTitle}>부스 신청하기</h3>
                    <p style={styles.actionDesc}>새로운 부스를 만들어보세요</p>
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
                <button onClick={handleEnterMetaverse} style={styles.enterBtn}>
                  메타버스 입장하기 👉
                </button>
                <p style={styles.loginHint}>※ 로그인이 필요합니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 왜 사용해야 하는가 섹션 */}
        <section id="features" style={styles.whySection}>
          <h2 style={styles.whyTitle}>왜 ExpoGarden을 사용해야 할까요?</h2>
          <div style={styles.benefitsGrid}>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>🌍</div>
              <h3 style={styles.benefitTitle}>물리적 제약 없는 전시회</h3>
              <p style={styles.benefitText}>
                실제 전시장을 방문하지 않아도 전 세계 어디서나 참가하고 관람할 수 있습니다. 비용과 시간을 절약하면서도 동일한 경험을 제공합니다.
              </p>
            </div>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>📊</div>
              <h3 style={styles.benefitTitle}>실시간 통계 및 관리</h3>
              <p style={styles.benefitText}>
                부스 방문자 수, 상담 건수, 관심도 등 실시간 통계를 확인하고, 관리자 대시보드를 통해 전시회를 효율적으로 운영할 수 있습니다.
              </p>
            </div>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>🎪</div>
              <h3 style={styles.benefitTitle}>부대행사 및 컨퍼런스</h3>
              <p style={styles.benefitText}>
                이노베이션 어워즈, 네트워킹 파티, 컨퍼런스 등 다양한 부대행사를 메타버스 안에서 함께 진행할 수 있습니다.
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

