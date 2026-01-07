import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import { MainScene } from '@/game/MainScene';
// import type { BoothZoneInteractEvent } from '@/game/MainScene'; // 슬롯 시스템 비활성화
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import { BoothPanel } from '@/components/BoothPanel';
import type { Booth } from '@/types';

export const ExhibitionViewPhaser: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId, user, characterChangedTrigger } = useStore();
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);

  // 고정된 전시/홀 ID (단일 전시 운영)
  const FIXED_EXHIBITION_ID = 1;
  const FIXED_HALL_ID = 1;

  // 쇼룸 목록 로드
  useEffect(() => {
    loadBooths();
  }, []);

  const loadBooths = async () => {
    try {
      const response = await apiClient.getBooths({
        exhibitionId: FIXED_EXHIBITION_ID,
        hallId: FIXED_HALL_ID,
        status: 'APPROVED',
      });
      console.log('[ExhibitionViewPhaser] 쇼룸 로드 완료:', {
        count: response.data.content.length,
        booths: response.data.content.map(b => ({ id: b.id, title: b.title, status: b.status, hallId: b.hallId, exhibitionId: b.exhibitionId })),
        response: response.data,
      });
      setBooths(response.data.content);

      // 트래킹: 홀 진입
      apiClient.trackEvent({
        exhibitionId: FIXED_EXHIBITION_ID,
        sessionId,
        action: 'ENTER_HALL',
        metadata: { hallId: FIXED_HALL_ID },
      });
    } catch (error) {
      console.error('[ExhibitionViewPhaser] 쇼룸 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoothClick = async (booth: Booth) => {
    // 미디어를 포함한 전체 부스 데이터 가져오기
    try {
      const response = await apiClient.getBooth(booth.id);
      const fullBooth = response.data;
      setSelectedBooth(fullBooth);

      // 트래킹: 부스 조회
      apiClient.trackEvent({
        exhibitionId: FIXED_EXHIBITION_ID,
        boothId: booth.id,
        sessionId,
        action: 'VIEW',
      });
    } catch (error) {
      console.error('[ExhibitionViewPhaser] 부스 데이터 로드 실패:', error);
      // 실패해도 기본 부스 데이터로 표시
      setSelectedBooth(booth);
    }
  };

  // Phaser 게임 초기화 및 씬 갱신
  useEffect(() => {
    if (!containerRef.current) {
      console.log('[ExhibitionViewPhaser] 컨테이너가 준비되지 않음');
      return;
    }

    if (loading) {
      console.log('[ExhibitionViewPhaser] 쇼룸 로딩 중...');
      return;
    }
    
    // 게임이 이미 있으면 씬만 재시작 (booths가 업데이트될 때마다)
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene');
      if (scene) {
        console.log('[ExhibitionViewPhaser] 씬 재시작, 쇼룸 개수:', booths.length);
        scene.scene.restart({
          booths: booths,
          onBoothInteract: handleBoothClick,
          selectedCharacter: user?.selectedCharacter,
          userNickname: user?.nickname,
          userId: user?.id,
          hallId: FIXED_HALL_ID,
        });
      } else {
        // 씬이 없으면 추가하고 시작
        console.log('[ExhibitionViewPhaser] 씬 추가 및 시작');
        gameRef.current.scene.add('MainScene', MainScene);
        gameRef.current.scene.start('MainScene', {
          booths: booths,
          onBoothInteract: handleBoothClick,
          selectedCharacter: user?.selectedCharacter,
          userNickname: user?.nickname,
          userId: user?.id,
          hallId: FIXED_HALL_ID,
        });
      }
      return;
    }

    // 새 게임 생성
    console.log('[ExhibitionViewPhaser] 새 게임 초기화 시작, 쇼룸 개수:', booths.length);

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
      userNickname: user?.nickname,
      userId: user?.id,
      hallId: FIXED_HALL_ID,
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
      // 멀티플레이어 서비스 연결 해제
      const scene = gameRef.current?.scene.getScene('MainScene') as any;
      if (scene && scene.multiplayerService) {
        scene.multiplayerService.disconnect();
      }
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [booths, loading, user?.selectedCharacter]); // booths 배열 전체를 의존성으로 사용하여 내용 변경 감지

  // 캐릭터 변경 감지 및 씬 재시작
  useEffect(() => {
    if (!gameRef.current || characterChangedTrigger === 0) return;

    console.log('[ExhibitionViewPhaser] 캐릭터 변경 감지, 씬 재시작...');
    
    const scene = gameRef.current.scene.getScene('MainScene') as MainScene;
    if (scene) {
      scene.scene.restart({
        booths: booths,
        onBoothInteract: handleBoothClick,
        selectedCharacter: user?.selectedCharacter,
        userNickname: user?.nickname,
        userId: user?.id,
        hallId: FIXED_HALL_ID,
      });
    }
  }, [characterChangedTrigger]);

  if (loading) {
    return <div style={styles.loading}>로딩 중...</div>;
  }

  return (
    <div style={styles.container}>
      {/* 상단 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>🎮 ExpoGarden 메타버스</h1>
          <p style={styles.subtitle}>
            승인된 쇼룸 {booths.length}개 | 방향키로 이동, E키로 쇼룸 상호작용
          </p>
        </div>
        <div style={styles.headerRight}>
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
          <span style={styles.key}>방향키</span>
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

