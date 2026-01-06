import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { MainScene } from '@/game/MainScene';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import { BoothPanel } from '@/components/BoothPanel';
import { AdminPanel } from '@/components/AdminPanel';
import type { Exhibition, Hall, Booth } from '@/types';

export const ExhibitionViewPhaser: React.FC = () => {
  const { sessionId, user, characterChangedTrigger } = useStore();
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentExhibition, setCurrentExhibition] = useState<Exhibition | null>(null);
  const [currentHall, setCurrentHall] = useState<Hall | null>(null);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);

  // 전시 목록 로드
  useEffect(() => {
    apiClient.getExhibitions('PUBLISHED').then((response) => {
      setExhibitions(response.data.content);
      if (response.data.content.length > 0) {
        const firstExhibition = response.data.content[0];
        setCurrentExhibition(firstExhibition);
        loadHalls(firstExhibition.id);
      }
      setLoading(false);
    });
  }, []);

  // 홀 목록 로드
  const loadHalls = async (exhibitionId: number) => {
    const response = await apiClient.getHalls(exhibitionId);
    setHalls(response.data);
    if (response.data.length > 0) {
      const firstHall = response.data[0];
      setCurrentHall(firstHall);
      loadBooths(exhibitionId, firstHall.id);
    }
  };

  // 부스 목록 로드
  const loadBooths = async (exhibitionId: number, hallId: number) => {
    const response = await apiClient.getBooths({
      exhibitionId,
      hallId,
      status: 'APPROVED',
    });
    setBooths(response.data.content);

    // 트래킹: 홀 진입
    apiClient.trackEvent({
      exhibitionId,
      sessionId,
      action: 'ENTER_HALL',
      metadata: { hallId },
    });
  };

  const handleBoothClick = (booth: Booth) => {
    setSelectedBooth(booth);

    // 트래킹: 부스 조회
    if (currentExhibition) {
      apiClient.trackEvent({
        exhibitionId: currentExhibition.id,
        boothId: booth.id,
        sessionId,
        action: 'VIEW',
      });
    }
  };

  const handleHallChange = (hallId: number) => {
    const hall = halls.find((h) => h.id === hallId);
    if (hall && currentExhibition) {
      setCurrentHall(hall);
      loadBooths(currentExhibition.id, hallId);
      
      // 게임 재시작
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    }
  };

  // Phaser 게임 초기화
  useEffect(() => {
    if (!containerRef.current || booths.length === 0 || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight - 120, // 헤더 공간 제외
      backgroundColor: '#2d2d2d',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: MainScene,
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // 씬에 데이터 전달
    game.scene.start('MainScene', {
      booths: booths,
      onBoothInteract: handleBoothClick,
      selectedCharacter: user?.selectedCharacter || 'character', // 기본값: character
    });

    // 윈도우 리사이즈 핸들링
    const handleResize = () => {
      if (game && game.scale) {
        game.scale.resize(window.innerWidth, window.innerHeight - 120);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (game) {
        game.destroy(true);
      }
    };
  }, [booths]);

  // 캐릭터 변경 감지 및 씬 재시작
  useEffect(() => {
    if (!gameRef.current || characterChangedTrigger === 0) return;

    console.log('Character changed, restarting scene...');
    
    // 현재 씬 가져오기
    const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
    if (scene) {
      // 씬 재시작
      scene.scene.restart({
        booths: booths,
        onBoothInteract: handleBoothClick,
        selectedCharacter: user?.selectedCharacter || 'character',
      });
    }
  }, [characterChangedTrigger, user?.selectedCharacter, booths]);

  if (loading) {
    return <div style={styles.loading}>로딩 중...</div>;
  }

  if (!currentExhibition || !currentHall) {
    return <div style={styles.error}>전시 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div style={styles.container}>
      {/* 상단 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>🎮 {currentExhibition.title}</h1>
          <p style={styles.subtitle}>WASD 또는 방향키로 이동, E키로 부스 상호작용</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.hallSelector}>
            <label style={styles.label}>홀 선택:</label>
            <select
              value={currentHall.id}
              onChange={(e) => handleHallChange(Number(e.target.value))}
              style={styles.select}
            >
              {halls.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.name} ({hall.boothCount}개 부스)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 관리자 패널 */}
      <AdminPanel />

      {/* Phaser 게임 컨테이너 */}
      <div ref={containerRef} style={styles.gameContainer} />

      {/* 부스 상세 패널 */}
      {selectedBooth && (
        <BoothPanel booth={selectedBooth} onClose={() => setSelectedBooth(null)} />
      )}

      {/* 조작 안내 */}
      <div style={styles.controls}>
        <div style={styles.controlItem}>
          <span style={styles.key}>WASD</span>
          <span style={styles.controlText}>이동</span>
        </div>
        <div style={styles.controlItem}>
          <span style={styles.key}>E</span>
          <span style={styles.controlText}>부스 상호작용</span>
        </div>
        <div style={styles.controlItem}>
          <span style={styles.key}>마우스휠</span>
          <span style={styles.controlText}>줌</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#fff',
    backgroundColor: '#1a1a1a',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#ef4444',
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#2d2d2d',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #404040',
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    color: '#ffffff',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#9ca3af',
  },
  hallSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#e5e7eb',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #404040',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    cursor: 'pointer',
  },
  gameContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#2d2d2d',
  },
  controls: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '12px 24px',
    borderRadius: '12px',
    zIndex: 100,
  },
  controlItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  key: {
    display: 'inline-block',
    backgroundColor: '#4a90e2',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    minWidth: '60px',
    textAlign: 'center',
  },
  controlText: {
    fontSize: '13px',
    color: '#e5e7eb',
  },
};

