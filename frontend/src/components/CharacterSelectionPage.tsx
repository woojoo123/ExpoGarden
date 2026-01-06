import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import { CHARACTERS } from '@/constants/characters';

export const CharacterSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // 사용자 정보 확인
  React.useEffect(() => {
    console.log('CharacterSelectionPage - user:', user);
    console.log('CharacterSelectionPage - tokens:', localStorage.getItem('tokens') ? 'EXISTS' : 'NONE');
    
    // 사용자 정보가 없으면 잠시 대기 (App.tsx에서 로딩 중)
    if (!user) {
      const timer = setTimeout(() => {
        if (!useStore.getState().user) {
          console.log('CharacterSelectionPage - No user after timeout, redirecting...');
          alert('로그인이 필요합니다.');
          navigate('/');
        }
      }, 3000); // 3초 대기 (로딩 시간 증가)
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? CHARACTERS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === CHARACTERS.length - 1 ? 0 : prev + 1));
  };

  const handleSelectCharacter = async () => {
    const selectedCharacter = CHARACTERS[currentIndex];
    
    if (!user) {
      alert('로그인이 필요합니다. 다시 로그인해주세요.');
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      console.log('Selecting character:', selectedCharacter.id);
      const response = await apiClient.selectCharacter(selectedCharacter.id);
      console.log('Character selected successfully:', response);
      setUser(response.data);
      alert(`${selectedCharacter.name} 캐릭터를 선택했습니다! 메타버스로 입장합니다.`);
      navigate('/metaverse');
    } catch (error: any) {
      console.error('Failed to select character:', error);
      const errorMessage = error.response?.data?.error || '캐릭터 선택에 실패했습니다.';
      alert(errorMessage + ' 다시 로그인해주세요.');
      apiClient.clearTokens();
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const currentCharacter = CHARACTERS[currentIndex];

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <h1 style={styles.panelTitle}>ExpoGarden</h1>
        <p style={styles.panelText}>
          온라인 전시회 플랫폼 'ExpoGarden'에 오신 것을 환영합니다.
        </p>
        <p style={styles.panelText}>
          메타버스 환경에서 당신의 전시 부스를 만들고 한국어로 대화할 수 있습니다.
        </p>
        <div style={styles.features}>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>🎨</span>
            <span style={styles.featureText}>온라인 1:1 전시 서비스 하기 전 선생님을 잘 알 수 있고</span>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>🌐</span>
            <span style={styles.featureText}>ExpoGarden에서 무료로 제공하는 다양한 전시 공간</span>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>💬</span>
            <span style={styles.featureText}>전시관을 이용해 보세요</span>
          </div>
        </div>
        <p style={styles.panelFooter}>
          ExpoGarden에서 함께합니다. 지금 바로 입장해 보세요.
        </p>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.header}>
          <h2 style={styles.title}>메타버스 캐릭터를 선택합니다</h2>
        </div>

        <div style={styles.carouselContainer}>
          <button 
            onClick={handlePrevious}
            style={styles.arrowButton}
            disabled={loading}
          >
            ◀
          </button>

          <div style={styles.characterDisplay}>
            <div style={styles.characterCard}>
              <img
                src={`/assets/characters/${currentCharacter.file}`}
                alt={currentCharacter.name}
                style={styles.characterImage}
              />
            </div>
            <h3 style={styles.characterName}>{currentCharacter.name}</h3>
            <div style={styles.characterIndicators}>
              {CHARACTERS.map((_, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.indicator,
                    ...(index === currentIndex ? styles.activeIndicator : {}),
                  }}
                />
              ))}
            </div>
          </div>

          <button 
            onClick={handleNext}
            style={styles.arrowButton}
            disabled={loading}
          >
            ▶
          </button>
        </div>

        <button
          onClick={handleSelectCharacter}
          disabled={loading}
          style={{
            ...styles.confirmButton,
            ...(loading ? styles.disabledButton : {}),
          }}
        >
          {loading ? '입장 중...' : '메타버스 입장하기'}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  },
  leftPanel: {
    flex: '0 0 450px',
    padding: '60px 50px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  panelTitle: {
    fontSize: '42px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '30px',
  },
  panelText: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '20px',
  },
  features: {
    margin: '30px 0',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '15px',
    gap: '12px',
  },
  featureIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  featureText: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#666',
  },
  panelFooter: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#333',
    marginTop: '20px',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  carouselContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    marginBottom: '50px',
  },
  arrowButton: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#fff',
    fontSize: '24px',
    color: '#667eea',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterDisplay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  characterCard: {
    width: '280px',
    height: '280px',
    backgroundColor: '#fff',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    padding: '30px',
  },
  characterImage: {
    width: '128px',
    height: '128px',
    imageRendering: 'pixelated',
  },
  characterName: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  characterIndicators: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  indicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#ddd',
    transition: 'all 0.3s ease',
  },
  activeIndicator: {
    backgroundColor: '#667eea',
    transform: 'scale(1.3)',
  },
  confirmButton: {
    padding: '18px 80px',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#5b4cdb',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(91, 76, 219, 0.4)',
    transition: 'all 0.3s ease',
  },
  disabledButton: {
    backgroundColor: '#aaa',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
};


