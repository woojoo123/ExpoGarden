import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';

const TOTAL_CHARACTERS = 10; // 총 10명의 캐릭터
const CHARACTER_SIZE = 64; // 고정 크기: 64x64

/**
 * 캐릭터의 idle down 프레임 위치 계산
 * @param charIndex 캐릭터 인덱스 (0-9)
 * @returns CSS background-position 값
 */
function getIdleDownPosition(charIndex: number): string {
  // 블록 위치 계산
  const blockX = charIndex % 2; // 가로 2명
  const blockY = Math.floor(charIndex / 2); // 세로 5명
  
  // 기본 컬럼/행
  const baseCol = blockX * 4; // 각 캐릭터는 가로 4칸
  const baseRow = blockY * 3; // 각 캐릭터는 세로 3칸
  
  // idle down 프레임: col = baseCol + 1 (down 방향), row = baseRow (첫 번째 걷기 프레임)
  const col = baseCol + 1;
  const row = baseRow; // 첫 번째 걷기 프레임이 idle 상태
  
  // CSS background-position 계산 (음수 값)
  const x = -col * CHARACTER_SIZE;
  const y = -row * CHARACTER_SIZE;
  
  return `${x}px ${y}px`;
}

export const CharacterSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  
  // 선택된 캐릭터 인덱스
  const [selectedCharIndex, setSelectedCharIndex] = useState<number>(() => {
    const saved = localStorage.getItem('selectedCharIndex');
    return saved ? parseInt(saved, 10) : 0;
  });

  // 사용자 정보 확인
  React.useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        if (!useStore.getState().user) {
          alert('로그인이 필요합니다.');
          navigate('/');
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // 선택 저장
  useEffect(() => {
    localStorage.setItem('selectedCharIndex', selectedCharIndex.toString());
  }, [selectedCharIndex]);

  const handleCharacterSelect = (charIndex: number) => {
    setSelectedCharIndex(charIndex);
  };

  const handleConfirm = async () => {
    if (!user) {
      alert('로그인이 필요합니다. 다시 로그인해주세요.');
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      // 선택된 캐릭터 정보를 JSON으로 저장: { charIndex, size: 'Character64x64' }
      const characterData = JSON.stringify({
        charIndex: selectedCharIndex,
        size: 'Character64x64',
      });
      
      const response = await apiClient.selectCharacter(characterData);
      setUser(response.data);
      alert('캐릭터를 선택했습니다! 메타버스로 입장합니다.');
      navigate('/metaverse');
    } catch (error: any) {
      console.error('Failed to select character:', error);
      
      // 에러 메시지 추출 (객체일 수 있으므로 안전하게 처리)
      let errorMessage = '캐릭터 선택에 실패했습니다.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      alert(errorMessage + '\n다시 로그인해주세요.');
      apiClient.clearTokens();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <h1 style={styles.panelTitle}>ExpoGarden</h1>
        <p style={styles.panelText}>
          온라인 전시회 플랫폼 'ExpoGarden'에 오신 것을 환영합니다.
        </p>
        <p style={styles.panelText}>
          메타버스 환경에서 당신의 전시 부스를 만들고, 다양한 참가자들과 네트워킹하세요.
        </p>
        <div style={styles.features}>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>📝</span>
            <span style={styles.featureText}>참가 신청 및 부스 운영</span>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>🗺️</span>
            <span style={styles.featureText}>메타버스 공간 자유롭게 탐방</span>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>💬</span>
            <span style={styles.featureText}>실시간 비즈니스 상담 및 네트워킹</span>
          </div>
        </div>
        <p style={styles.panelFooter}>
          지금 바로 나만의 캐릭터를 만들고 입장해 보세요.
        </p>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.header}>
          <h2 style={styles.title}>캐릭터 선택</h2>
          <p style={styles.subtitle}>사용할 캐릭터를 선택해주세요</p>
        </div>

        <div style={styles.characterSelectionContainer}>
          {/* 단일 캐릭터 표시 및 좌우 화살표 */}
          <div style={styles.characterDisplaySection}>
            <p style={styles.instructionText}>사용할 캐릭터를 클릭해주세요!</p>
            <div style={styles.characterDisplayContainer}>
                <button
                onClick={() => {
                  const prevIndex = selectedCharIndex > 0 ? selectedCharIndex - 1 : TOTAL_CHARACTERS - 1;
                  handleCharacterSelect(prevIndex);
                }}
                  style={{
                  ...styles.navButton,
                  ...(loading ? styles.navButtonDisabled : {}),
                  }}
                  disabled={loading}
                >
                ‹
                </button>
              
              <div
                onClick={() => handleCharacterSelect(selectedCharIndex)}
                style={styles.characterDisplay}
              >
                <div
                  style={{
                    ...styles.characterSprite,
                    backgroundImage: `url(/assets/characters/Character64x64.png)`,
                    backgroundPosition: getIdleDownPosition(selectedCharIndex),
                    backgroundSize: `${CHARACTER_SIZE * 8}px ${CHARACTER_SIZE * 15}px`, // 전체 스프라이트 시트 크기 (512px x 960px)
                    backgroundRepeat: 'no-repeat',
                    width: `${CHARACTER_SIZE * 3}px`, // 한 프레임 크기의 3배 (192px) - 한 캐릭터만 크게 보이도록
                    height: `${CHARACTER_SIZE * 3}px`, // 한 프레임 크기의 3배 (192px)
                    imageRendering: 'pixelated' as const,
                    overflow: 'hidden', // 한 프레임만 보이도록
                  }}
                />
            </div>

                  <button
                onClick={() => {
                  const nextIndex = selectedCharIndex < TOTAL_CHARACTERS - 1 ? selectedCharIndex + 1 : 0;
                  handleCharacterSelect(nextIndex);
                }}
                    style={{
                  ...styles.navButton,
                  ...(loading ? styles.navButtonDisabled : {}),
                    }}
                    disabled={loading}
                  >
                ›
                  </button>
            </div>
            <p style={styles.characterNumber}>캐릭터 {selectedCharIndex + 1} / {TOTAL_CHARACTERS}</p>
          </div>
        </div>

        <button
          onClick={handleConfirm}
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    overflow: 'hidden',
  },
  leftPanel: {
    flex: '0 0 400px',
    padding: '60px 40px',
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
    alignItems: 'center',
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
    padding: '40px',
    overflowY: 'auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: '10px',
  },
  characterSelectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    marginBottom: '30px',
    width: '100%',
    maxWidth: '800px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '16px',
    textAlign: 'center',
  },
  characterDisplaySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  instructionText: {
    fontSize: '18px',
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    margin: 0,
  },
  characterDisplayContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '30px',
    width: '100%',
  },
  navButton: {
    width: '50px',
    height: '50px',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  navButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  characterDisplay: {
    cursor: 'pointer',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.2s ease',
  },
  characterSprite: {
    overflow: 'hidden',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  characterNumber: {
    fontSize: '16px',
    color: '#fff',
    fontWeight: '500',
    margin: 0,
  },
  confirmButton: {
    padding: '18px 60px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
    transition: 'all 0.3s ease',
  },
  disabledButton: {
    backgroundColor: '#6b7280',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
};
