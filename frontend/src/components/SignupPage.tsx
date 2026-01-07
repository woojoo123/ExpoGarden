import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!email || !password || !passwordConfirm || !nickname) {
      setError('모든 필드를 입력해주세요.');
      return false;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await apiClient.signup(email, password, nickname, 'EXHIBITOR');
      setSuccess(true);
      
      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(
        err.response?.data?.message || 
        '회원가입에 실패했습니다. 이메일이 이미 사용 중일 수 있습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>회원가입 완료!</h2>
            <p style={styles.successText}>
              환영합니다! 잠시 후 로그인 페이지로 이동합니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.logo} onClick={() => navigate('/')}>
            🏛️ ExpoGarden
          </h1>
          <h2 style={styles.title}>회원가입</h2>
          <p style={styles.subtitle}>메타버스 전시회 플랫폼에 가입하세요</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="사용할 닉네임"
              required
              style={styles.input}
              disabled={loading}
              maxLength={20}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="최소 6자 이상"
              required
              style={styles.input}
              disabled={loading}
              minLength={6}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 다시 입력"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.disabledButton : {}),
            }}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => navigate('/login')}
              style={styles.linkButton}
              disabled={loading}
            >
              로그인
            </button>
          </p>
          <button
            onClick={() => navigate('/')}
            style={styles.linkButton}
            disabled={loading}
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logo: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '20px',
    cursor: 'pointer',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  submitButton: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px',
  },
  disabledButton: {
    backgroundColor: '#aaa',
    cursor: 'not-allowed',
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
  },
  successBox: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  successIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  successText: {
    fontSize: '16px',
    color: '#666',
  },
};
