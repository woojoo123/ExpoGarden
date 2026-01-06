import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import {
  type AvatarConfig,
  type Gender,
  DEFAULT_AVATAR_CONFIG,
  SKIN_TONES,
  HAIR_COLORS,
  TOP_COLORS,
  BOTTOM_COLORS,
  HAIR_STYLES,
  SKIN_TONE_NAMES,
  HAIR_COLOR_NAMES,
  TOP_COLOR_NAMES,
  BOTTOM_COLOR_NAMES,
  avatarConfigToString,
} from '@/constants/characters';

export const CharacterSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  
  // 아바타 커스터마이징 상태
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG);

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

  const handleGenderChange = (gender: Gender) => {
    setAvatarConfig({ ...avatarConfig, gender });
  };

  const handleHairStyleChange = (hairStyle: string) => {
    setAvatarConfig({ ...avatarConfig, hairStyle });
  };

  const handleConfirm = async () => {
    if (!user) {
      alert('로그인이 필요합니다. 다시 로그인해주세요.');
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      // AvatarConfig를 JSON 문자열로 변환하여 저장
      const configString = avatarConfigToString(avatarConfig);
      const response = await apiClient.selectCharacter(configString);
      setUser(response.data);
      alert('캐릭터를 생성했습니다! 메타버스로 입장합니다.');
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
          <h2 style={styles.title}>캐릭터 커스터마이징</h2>
          <p style={styles.subtitle}>나만의 아바타를 만들어보세요</p>
        </div>

        <div style={styles.customizationContainer}>
          {/* 프리뷰 영역 */}
          <div style={styles.previewSection}>
            <div style={styles.previewBox}>
              <div style={styles.previewPlaceholder}>
                👤
              </div>
              <p style={styles.previewText}>미리보기</p>
              <p style={styles.previewSubtext}>(실제 리소스 적용 시 표시됩니다)</p>
            </div>
          </div>

          {/* 커스터마이징 옵션 */}
          <div style={styles.optionsSection}>
            {/* 성별 선택 */}
            <div style={styles.optionGroup}>
              <h3 style={styles.optionTitle}>성별</h3>
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => handleGenderChange('male')}
                  style={{
                    ...styles.optionButton,
                    ...(avatarConfig.gender === 'male' ? styles.activeButton : {}),
                  }}
                  disabled={loading}
                >
                  남성
                </button>
                <button
                  onClick={() => handleGenderChange('female')}
                  style={{
                    ...styles.optionButton,
                    ...(avatarConfig.gender === 'female' ? styles.activeButton : {}),
                  }}
                  disabled={loading}
                >
                  여성
                </button>
              </div>
            </div>

            {/* 헤어스타일 선택 */}
            <div style={styles.optionGroup}>
              <h3 style={styles.optionTitle}>헤어스타일</h3>
              <div style={styles.buttonGroup}>
                {HAIR_STYLES.map((style, index) => (
                  <button
                    key={style}
                    onClick={() => handleHairStyleChange(style)}
                    style={{
                      ...styles.optionButton,
                      ...(avatarConfig.hairStyle === style ? styles.activeButton : {}),
                    }}
                    disabled={loading}
                  >
                    스타일 {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* 피부톤 선택 */}
            <div style={styles.optionGroup}>
              <h3 style={styles.optionTitle}>피부톤</h3>
              <div style={styles.colorGroup}>
                {Object.entries(SKIN_TONES).map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => setAvatarConfig({ ...avatarConfig, skinTone: color })}
                    style={{
                      ...styles.colorButton,
                      backgroundColor: `#${color.toString(16)}`,
                      ...(avatarConfig.skinTone === color ? styles.activeColorButton : {}),
                    }}
                    disabled={loading}
                    title={SKIN_TONE_NAMES[color]}
                  />
                ))}
              </div>
            </div>

            {/* 헤어 컬러 선택 */}
            <div style={styles.optionGroup}>
              <h3 style={styles.optionTitle}>헤어 컬러</h3>
              <div style={styles.colorGroup}>
                {Object.entries(HAIR_COLORS).map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => setAvatarConfig({ ...avatarConfig, hairColor: color })}
                    style={{
                      ...styles.colorButton,
                      backgroundColor: `#${color.toString(16)}`,
                      ...(avatarConfig.hairColor === color ? styles.activeColorButton : {}),
                    }}
                    disabled={loading}
                    title={HAIR_COLOR_NAMES[color]}
                  />
                ))}
              </div>
            </div>

            {/* 상의 컬러 선택 */}
            <div style={styles.optionGroup}>
              <h3 style={styles.optionTitle}>상의 컬러</h3>
              <div style={styles.colorGroup}>
                {Object.entries(TOP_COLORS).map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => setAvatarConfig({ ...avatarConfig, topColor: color })}
                    style={{
                      ...styles.colorButton,
                      backgroundColor: `#${color.toString(16)}`,
                      ...(avatarConfig.topColor === color ? styles.activeColorButton : {}),
                    }}
                    disabled={loading}
                    title={TOP_COLOR_NAMES[color]}
                  />
                ))}
              </div>
            </div>

            {/* 하의 컬러 선택 */}
            <div style={styles.optionGroup}>
              <h3 style={styles.optionTitle}>하의 컬러</h3>
              <div style={styles.colorGroup}>
                {Object.entries(BOTTOM_COLORS).map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => setAvatarConfig({ ...avatarConfig, bottomColor: color })}
                    style={{
                      ...styles.colorButton,
                      backgroundColor: `#${color.toString(16)}`,
                      ...(avatarConfig.bottomColor === color ? styles.activeColorButton : {}),
                    }}
                    disabled={loading}
                    title={BOTTOM_COLOR_NAMES[color]}
                  />
                ))}
              </div>
            </div>
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
  customizationContainer: {
    display: 'flex',
    gap: '40px',
    marginBottom: '30px',
    maxWidth: '900px',
  },
  previewSection: {
    flex: '0 0 250px',
  },
  previewBox: {
    width: '250px',
    height: '300px',
    backgroundColor: '#fff',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    padding: '20px',
  },
  previewPlaceholder: {
    fontSize: '80px',
    marginBottom: '10px',
  },
  previewText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    margin: '10px 0 5px 0',
  },
  previewSubtext: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
  },
  optionsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  optionGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '15px 20px',
  },
  optionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '12px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  optionButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#fff',
  },
  colorGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeColorButton: {
    borderColor: '#fff',
    transform: 'scale(1.15)',
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
