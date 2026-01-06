import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ExhibitionViewPhaser } from './components/ExhibitionViewPhaser';
import { OAuthCallback } from './components/OAuthCallback';
import { MyBoothsPage } from './components/MyBoothsPage';
import { BoothFormPage } from './components/BoothFormPage';
import { AdminDashboard } from './components/AdminDashboard';
import { StatisticsPage } from './components/StatisticsPage';
import { CharacterSelectionPage } from './components/CharacterSelectionPage';
import { apiClient } from './api/client';
import { useStore } from './state/store';

function App() {
  const setUser = useStore((state) => state.setUser);
  
  useEffect(() => {
    // 앱 시작 시 토큰이 있으면 사용자 정보 복원
    const tokens = localStorage.getItem('tokens');
    console.log('App.tsx - tokens:', tokens ? 'EXISTS' : 'NONE');
    console.log('App.tsx - current user:', useStore.getState().user);
    
    if (tokens && !useStore.getState().user) {
      console.log('App.tsx - Fetching user info...');
      apiClient.getMe()
        .then((response) => {
          console.log('App.tsx - User info fetched:', response.data);
          setUser(response.data);
        })
        .catch((error) => {
          console.error('App.tsx - Failed to fetch user info:', error);
          // 토큰이 유효하지 않으면 무시
        });
    }
  }, [setUser]);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/metaverse" element={<ExhibitionViewPhaser />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/character-selection" element={<CharacterSelectionPage />} />
        <Route path="/my/booths" element={<MyBoothsPage />} />
        <Route path="/my/booths/new" element={<BoothFormPage />} />
        <Route path="/my/booths/:id/edit" element={<BoothFormPage />} />
        <Route path="/admin/booths" element={<AdminDashboard />} />
        <Route path="/admin/statistics" element={<StatisticsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

