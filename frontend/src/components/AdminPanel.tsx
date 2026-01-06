import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiClient.login(email, password);
      apiClient.setTokens(response.data);
      useStore.getState().setUser(response.data.user);
      alert('로그인 성공!');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '로그인 실패');
    }
  };

  const handleOAuthLogin = () => {
    // 구글 OAuth 로그인 페이지로 이동
    window.location.href = 'http://localhost:8080/api/oauth2/authorization/google';
  };

  const handleLogout = async () => {
    await apiClient.logout();
    useStore.getState().setUser(null);
  };

  if (user) {
    return (
      <div style={styles.panel}>
        <h2>사용자 패널</h2>
        <p>
          <strong>사용자:</strong> {user.nickname} ({user.role})
        </p>
        <p>
          <strong>이메일:</strong> {user.email}
        </p>
        
        {user.role === 'ADMIN' && (
          <>
            <button onClick={() => navigate('/admin/booths')} style={styles.adminBtn}>
              부스 관리
            </button>
            <button onClick={() => navigate('/admin/statistics')} style={styles.statsBtn}>
              📊 통계 대시보드
            </button>
          </>
        )}
        
        {user.role === 'EXHIBITOR' && (
          <button onClick={() => navigate('/my/booths')} style={styles.manageBtn}>
            내 부스 관리
          </button>
        )}
        
        <button onClick={handleLogout} style={styles.logoutBtn}>
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2>관리자 로그인</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.loginBtn}>
            로그인
          </button>
        </form>
        <div style={styles.divider}>또는</div>
        <button onClick={handleOAuthLogin} style={styles.oauthBtn}>
          🔐 구글로 로그인
        </button>
        <div style={styles.hint}>
          <p>기본 관리자 계정:</p>
          <p>Email: admin@expogarden.com</p>
          <p>Password: admin123</p>
        </div>
        <div style={styles.signupLink}>
          <button onClick={() => navigate('/signup')} style={styles.link}>
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: 100,
  },
  loginBox: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    width: '300px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  loginBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  divider: {
    margin: '16px 0',
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
  },
  oauthBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    marginBottom: '12px',
  },
  error: {
    color: '#dc3545',
    fontSize: '14px',
    marginBottom: '12px',
  },
  hint: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#666',
  },
  panel: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    width: '300px',
    zIndex: 100,
  },
  adminBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '12px',
  },
  statsBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#17a2b8',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  manageBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '12px',
  },
  logoutBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '12px',
  },
  signupLink: {
    marginTop: '16px',
    textAlign: 'center',
  },
};

