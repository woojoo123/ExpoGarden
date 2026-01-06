import React, { useEffect, useRef, useState } from 'react';
import { BabylonScene, CameraMode } from './BabylonScene';
import { LayoutEngine } from './LayoutEngine';
import { InteractionPrompt } from '@/components/InteractionPrompt';
import type { Booth, LayoutConfig } from '@/types';

interface SceneViewerProps {
  booths: Booth[];
  layoutConfig: LayoutConfig;
  onBoothClick: (booth: Booth) => void;
}

export const SceneViewer: React.FC<SceneViewerProps> = ({
  booths,
  layoutConfig,
  onBoothClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const babylonSceneRef = useRef<BabylonScene | null>(null);
  const layoutEngineRef = useRef<LayoutEngine | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [nearbyBooth, setNearbyBooth] = useState<Booth | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Babylon 씬 초기화
    const babylonScene = new BabylonScene(canvasRef.current);
    babylonSceneRef.current = babylonScene;

    // 레이아웃 엔진 초기화
    const layoutEngine = new LayoutEngine(babylonScene.getScene());
    layoutEngineRef.current = layoutEngine;

    // E키 입력 감지
    const handleKeyPress = (evt: KeyboardEvent) => {
      if (evt.key.toLowerCase() === 'e' && nearbyBooth) {
        onBoothClick(nearbyBooth);
      } else if (evt.key.toLowerCase() === 'v') {
        toggleCameraMode();
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      layoutEngine.clearBooths();
      babylonScene.dispose();
    };
  }, [nearbyBooth, onBoothClick]);

  useEffect(() => {
    if (layoutEngineRef.current && booths.length > 0) {
      layoutEngineRef.current.createBooths(booths, layoutConfig, onBoothClick);
      
      // Update character controller with booth positions
      if (babylonSceneRef.current) {
        const characterController = babylonSceneRef.current.getCharacterController();
        if (characterController) {
          const boothMeshes = layoutEngineRef.current.getBoothMeshes();
          characterController.setBooths(booths, boothMeshes);
        }
      }
    }
  }, [booths, layoutConfig, onBoothClick]);

  // Check for nearby booths when in character mode
  useEffect(() => {
    if (cameraMode !== 'character') {
      setNearbyBooth(null);
      return;
    }

    const checkProximity = () => {
      if (babylonSceneRef.current) {
        const characterController = babylonSceneRef.current.getCharacterController();
        if (characterController) {
          const booth = characterController.getNearbyBooth();
          setNearbyBooth(booth);
        }
      }
      animationFrameRef.current = requestAnimationFrame(checkProximity);
    };

    checkProximity();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraMode]);

  const toggleCameraMode = async () => {
    if (!babylonSceneRef.current) return;

    const newMode: CameraMode = cameraMode === 'orbit' ? 'character' : 'orbit';
    await babylonSceneRef.current.switchCameraMode(newMode);
    setCameraMode(newMode);
    
    // Update character controller with booth positions when switching to character mode
    if (newMode === 'character' && layoutEngineRef.current) {
      const characterController = babylonSceneRef.current.getCharacterController();
      if (characterController) {
        const boothMeshes = layoutEngineRef.current.getBoothMeshes();
        characterController.setBooths(booths, boothMeshes);
      }
    }
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Camera mode toggle button */}
      <button onClick={toggleCameraMode} style={styles.toggleButton}>
        {cameraMode === 'orbit' ? '🚶 이동 모드' : '👁️ 관람 모드'}
      </button>

      {/* Interaction prompt */}
      <InteractionPrompt
        visible={cameraMode === 'character' && nearbyBooth !== null}
        boothTitle={nearbyBooth?.title || ''}
        onInteract={() => nearbyBooth && onBoothClick(nearbyBooth)}
      />
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  toggleButton: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    zIndex: 100,
    transition: 'all 0.3s ease',
  },
};

