import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import { MainScene } from '@/game/MainScene';
// import type { BoothZoneInteractEvent } from '@/game/MainScene'; // 슬롯 시스템 비활성화
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import { BoothPanel } from '@/components/BoothPanel';
import type { Exhibition, Hall, Booth } from '@/types';

export const ExhibitionViewPhaser: React.FC = () => {
  const navigate = useNavigate();
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

  // 쇼룸 목록 로드
  const loadBooths = async (exhibitionId: number, hallId: number) => {
    const response = await apiClient.getBooths({
      exhibitionId,
      hallId,
      status: 'APPROVED',
    });
    console.log('[ExhibitionViewPhaser] 쇼룸 로드 완료:', {
      count: response.data.content.length,
      booths: response.data.content.map(b => ({ id: b.id, title: b.title, status: b.status })),
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
      
      // 게임 재시작
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }

      // 부스 로드 (로드 후 useEffect에서 게임이 자동으로 재시작됨)
      loadBooths(currentExhibition.id, hallId);
    }
  };

  // Phaser 게임 초기화
  useEffect(() => {
    if (!containerRef.current || booths.length === 0) {
      console.log('[ExhibitionViewPhaser] 게임 초기화 조건 불만족:', {
        hasContainer: !!containerRef.current,
        boothsCount: booths.length,
      });
      return;
    }
    
    // 게임이 이미 있으면 씬 상태 확인
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene');
      // 씬이 실행 중이면 재시작 (홀 변경 등)
      if (scene && scene.scene.isActive()) {
        console.log('[ExhibitionViewPhaser] 씬이 이미 실행 중입니다. 재시작...');
        scene.scene.restart({
          booths: booths,
          onBoothInteract: handleBoothClick,
          selectedCharacter: user?.selectedCharacter,
          userNickname: user?.nickname,
        });
        
        // 슬롯 시스템 비활성화 - 이벤트 리스너 제거
        // scene.events.on('boothZoneInteract', (event: BoothZoneInteractEvent) => {
        //   console.log('[ExhibitionViewPhaser] 슬롯 존 상호작용 이벤트:', event);
        //   const booth = booths.find(b => b.id === event.boothId);
        //   if (booth) {
        //     handleBoothClick(booth);
        //   }
        // });
      } else if (!scene) {
        // 씬이 없으면 추가하고 시작
        console.log('[ExhibitionViewPhaser] 씬이 없습니다. 추가하고 시작...');
        gameRef.current.scene.add('MainScene', MainScene);
        gameRef.current.scene.start('MainScene', {
          booths: booths,
          onBoothInteract: handleBoothClick,
          selectedCharacter: user?.selectedCharacter,
          userNickname: user?.nickname,
        });
      }
      // 씬이 있지만 아직 시작되지 않았으면 기다림 (preload 중일 수 있음)
      return;
    }

    console.log('[ExhibitionViewPhaser] 새 게임 초기화 시작, 부스 개수:', booths.length);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight - 120, // 헤더 공간 제외
      backgroundColor: '#000000', // 검은색 배경 (배경 이미지가 화면을 완전히 채움)
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      // scene을 여기서 제거하고 수동으로 추가
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    console.log('[ExhibitionViewPhaser] Phaser 게임 생성 완료, 씬 시작...');

    // MainScene을 수동으로 추가
    game.scene.add('MainScene', MainScene);
    
    // 데이터와 함께 씬 시작
    game.scene.start('MainScene', {
      booths: booths,
      onBoothInteract: handleBoothClick,
      selectedCharacter: user?.selectedCharacter,
      userNickname: user?.nickname, // 닉네임 전달
    });

    // 슬롯 시스템 비활성화 - 이벤트 리스너 제거
    // const scene = game.scene.getScene('MainScene') as MainScene;
    // if (scene) {
    //   scene.events.on('boothZoneInteract', (event: BoothZoneInteractEvent) => {
    //     console.log('[ExhibitionViewPhaser] 슬롯 존 상호작용 이벤트:', event);
    //     const booth = booths.find(b => b.id === event.boothId);
    //     if (booth) {
    //       handleBoothClick(booth);
    //     }
    //   });
    // }

    // 윈도우 리사이즈 핸들링
    const handleResize = () => {
      if (game && game.scale) {
        game.scale.resize(window.innerWidth, window.innerHeight - 120);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // 슬롯 시스템 비활성화 - 이벤트 리스너 정리 제거
      // const cleanupScene = game.scene.getScene('MainScene') as MainScene;
      // if (cleanupScene) {
      //   cleanupScene.events.off('boothZoneInteract');
      // }
      // 게임은 컴포넌트 언마운트 시에만 destroy
      // (홀 변경 시에는 handleHallChange에서 처리)
    };
  }, [booths.length, user?.selectedCharacter]); // booths.length만 의존성으로 사용하여 배열 참조 변경 무시

  // 캐릭터 변경 감지 및 씬 재시작
  useEffect(() => {
    if (!gameRef.current || characterChangedTrigger === 0) return;

    console.log('Character changed, restarting scene...');
    
    // 현재 씬 가져오기
    const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
    if (scene) {
      // 슬롯 시스템 비활성화 - 이벤트 리스너 제거
      // scene.events.off('boothZoneInteract');
      
      // 씬 재시작
      scene.scene.restart({
        booths: booths,
        onBoothInteract: handleBoothClick,
        selectedCharacter: user?.selectedCharacter,
        userNickname: user?.nickname,
      });
      
      // 슬롯 시스템 비활성화 - 이벤트 리스너 재등록 제거
      // scene.events.on('boothZoneInteract', (event: BoothZoneInteractEvent) => {
      //   console.log('[ExhibitionViewPhaser] 슬롯 존 상호작용 이벤트:', event);
      //   const booth = booths.find(b => b.id === event.boothId);
      //   if (booth) {
      //     handleBoothClick(booth);
      //   }
      // });
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
          <p style={styles.subtitle}>WASD 또는 방향키로 이동, E키로 쇼룸 상호작용</p>
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
                  {hall.name} ({hall.boothCount}개 쇼룸)
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => navigate('/')}
            style={styles.exitButton}
          >
            나가기
          </button>
        </div>
      </div>

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
          <span style={styles.controlText}>쇼룸 상호작용</span>
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
    backgroundColor: '#ffffff',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #d4c5a9',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
  userPanelToggle: {
    padding: '8px 12px',
    fontSize: '12px',
    borderRadius: '999px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    color: '#374151',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    whiteSpace: 'nowrap',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    color: '#333333',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#666666',
  },
  hallSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#333333',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #d4c5a9',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    color: '#333333',
    cursor: 'pointer',
  },
  exitButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#ffffff',
    backgroundColor: '#dc3545',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  gameContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#e8dcc0', // 밝은 베이지 배경
  },
  controls: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '12px 24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid #d4c5a9',
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
    color: '#333333',
  },
};

