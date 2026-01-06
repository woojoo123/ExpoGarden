import { create } from 'zustand';
import type { User, Exhibition, Hall, Booth } from '@/types';

interface AppState {
  user: User | null;
  sessionId: string;
  currentExhibition: Exhibition | null;
  currentHall: Hall | null;
  selectedBooth: Booth | null;
  characterChangedTrigger: number; // 캐릭터 변경 트리거
  
  setUser: (user: User | null) => void;
  setCurrentExhibition: (exhibition: Exhibition | null) => void;
  setCurrentHall: (hall: Hall | null) => void;
  setSelectedBooth: (booth: Booth | null) => void;
  triggerCharacterChanged: () => void;
}

// 세션 ID 생성 (익명 추적용)
const generateSessionId = () => {
  const stored = localStorage.getItem('sessionId');
  if (stored) return stored;
  
  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('sessionId', newId);
  return newId;
};

export const useStore = create<AppState>((set) => ({
  user: null,
  sessionId: generateSessionId(),
  currentExhibition: null,
  currentHall: null,
  selectedBooth: null,
  characterChangedTrigger: 0,
  
  setUser: (user) => set({ user }),
  setCurrentExhibition: (exhibition) => set({ currentExhibition: exhibition }),
  setCurrentHall: (hall) => set({ currentHall: hall }),
  setSelectedBooth: (booth) => set({ selectedBooth: booth }),
  triggerCharacterChanged: () => set((state) => ({ characterChangedTrigger: state.characterChangedTrigger + 1 })),
}));

