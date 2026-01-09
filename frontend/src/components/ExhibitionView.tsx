import React, { useEffect, useState } from 'react';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import { SceneViewer } from '@/scene/SceneViewer';
import { BoothPanel } from '@/components/BoothPanel';
import { AdminPanel } from '@/components/AdminPanel';
import type { Hall, Booth } from '@/types';

export const ExhibitionView: React.FC = () => {
  const { currentExhibition, currentHall, selectedBooth, setCurrentExhibition, setCurrentHall, setSelectedBooth, sessionId } = useStore();
  
  const [halls, setHalls] = useState<Hall[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);

  // 전시 목록 로드
  useEffect(() => {
    apiClient.getExhibitions('PUBLISHED').then((response) => {
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
    }
  };

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
        <h1 style={styles.title}>{currentExhibition.title}</h1>
        <div style={styles.hallSelector}>
          <label>홀 선택: </label>
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

      {/* 관리자 패널 */}
      <AdminPanel />

      {/* 3D 씬 */}
      <div style={styles.sceneContainer}>
        <SceneViewer
          booths={booths}
          layoutConfig={currentHall.layoutConfig}
          onBoothClick={handleBoothClick}
        />
      </div>

      {/* 부스 상세 패널 */}
      {selectedBooth && (
        <BoothPanel booth={selectedBooth} onClose={() => setSelectedBooth(null)} />
      )}

      {/* 안내 */}
      <div style={styles.instructions}>
        <strong>💡 조작법:</strong> 우측 하단 버튼으로 관람/이동 모드 전환 | 
        <span style={{ marginLeft: '8px' }}>
          <strong>관람 모드:</strong> 마우스 드래그로 회전, 스크롤로 줌 | 
        </span>
        <span style={{ marginLeft: '8px' }}>
          <strong>이동 모드:</strong> WASD로 이동, E키로 부스 상호작용
        </span>
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
  },
  header: {
    backgroundColor: '#fff',
    padding: '16px 24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
  },
  hallSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  select: {
    padding: '8px 12px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  sceneContainer: {
    flex: 1,
    position: 'relative',
  },
  instructions: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    pointerEvents: 'none',
  },
  loading: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  error: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#dc3545',
  },
};
