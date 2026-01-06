import React, { useEffect, useRef } from 'react';
import { BabylonScene } from './BabylonScene';
import { LayoutEngine } from './LayoutEngine';
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

  useEffect(() => {
    if (!canvasRef.current) return;

    // Babylon 씬 초기화
    const babylonScene = new BabylonScene(canvasRef.current);
    babylonSceneRef.current = babylonScene;

    // 레이아웃 엔진 초기화
    const layoutEngine = new LayoutEngine(babylonScene.getScene());
    layoutEngineRef.current = layoutEngine;

    return () => {
      layoutEngine.clearBooths();
      babylonScene.dispose();
    };
  }, []);

  useEffect(() => {
    if (layoutEngineRef.current && booths.length > 0) {
      layoutEngineRef.current.createBooths(booths, layoutConfig, onBoothClick);
    }
  }, [booths, layoutConfig, onBoothClick]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

