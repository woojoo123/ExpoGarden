import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // 토큰 저장
      apiClient.setTokens({
        accessToken,
        refreshToken,
        expiresIn: 900,
        tokenType: 'Bearer',
        user: {
          id: 0,
          email: '',
          nickname: '',
          role: 'VISITOR',
          createdAt: '',
        },
      });

      console.log('Tokens set, fetching user info...');

      // 사용자 정보 조회
      apiClient.getMe().then((response) => {
        console.log('OAuthCallback - User info loaded:', response.data);
        useStore.getState().setUser(response.data);
        
        // 항상 캐릭터 선택 페이지로 이동
        console.log('OAuthCallback - Redirecting to character selection...');
        navigate('/character-selection');
      }).catch((error) => {
        console.error('OAuthCallback - Failed to get user info:', error);
        alert('사용자 정보를 가져오는데 실패했습니다.');
        apiClient.clearTokens();
        navigate('/');
      });
    } else {
      alert('OAuth 로그인 실패');
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.loading}>로그인 처리 중...</div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    fontSize: '18px',
    color: '#666',
  },
};

