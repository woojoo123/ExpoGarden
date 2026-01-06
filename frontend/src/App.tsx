import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ExhibitionView } from './components/ExhibitionView';
import { OAuthCallback } from './components/OAuthCallback';
import { SignupPage } from './components/SignupPage';
import { MyBoothsPage } from './components/MyBoothsPage';
import { BoothFormPage } from './components/BoothFormPage';
import { AdminDashboard } from './components/AdminDashboard';
import { apiClient } from './api/client';
import { useStore } from './state/store';

function App() {
  const setUser = useStore((state) => state.setUser);
  
  useEffect(() => {
    // 앱 시작 시 토큰이 있으면 사용자 정보 복원
    const tokens = localStorage.getItem('tokens');
    if (tokens && !useStore.getState().user) {
      apiClient.getMe()
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          // 토큰이 유효하지 않으면 무시
        });
    }
  }, [setUser]);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExhibitionView />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/my/booths" element={<MyBoothsPage />} />
        <Route path="/my/booths/new" element={<BoothFormPage />} />
        <Route path="/my/booths/:id/edit" element={<BoothFormPage />} />
        <Route path="/admin/booths" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

