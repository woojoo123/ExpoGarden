import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // 이미 처리했으면 무시 (중복 실행 방지)
    if (hasProcessed.current) {
      console.log('OAuthCallback already processed, skipping...');
      return;
    }
    hasProcessed.current = true;
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
        
        // ===== 디버깅: localStorage 전체 내용 확인 =====
        console.log('=== OAuthCallback Debug Start ===');
        console.log('localStorage length:', localStorage.length);
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          console.log(`  ${key}:`, localStorage.getItem(key));
        }
        
        // returnTo 파라미터에 따라 리다이렉트
        const returnTo = localStorage.getItem('returnTo');
        console.log('returnTo value:', returnTo);
        console.log('returnTo type:', typeof returnTo);
        console.log('returnTo === "metaverse":', returnTo === 'metaverse');
        console.log('returnTo === "main":', returnTo === 'main');
        console.log('returnTo === null:', returnTo === null);
        
        localStorage.removeItem('returnTo'); // 사용 후 즉시 제거
        console.log('returnTo removed from localStorage');
        
        if (returnTo === 'metaverse') {
          console.log('→ Navigating to /character-selection');
          navigate('/character-selection');
        } else {
          console.log('→ Navigating to / (main page)');
          navigate('/');
        }
        console.log('=== OAuthCallback Debug End ===');
      }).catch((error) => {
        console.error('OAuthCallback - Failed to get user info:', error);
        alert('사용자 정보를 가져오는데 실패했습니다.');
        apiClient.clearTokens();
        localStorage.removeItem('returnTo');
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

