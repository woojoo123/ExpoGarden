import { Scene, MeshBuilder, StandardMaterial, Color3, Vector3, Mesh, ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import type { Booth, LayoutConfig } from '@/types';

export class LayoutEngine {
  private scene: Scene;
  private boothMeshes: Map<number, Mesh> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  clearBooths() {
    this.boothMeshes.forEach((mesh) => mesh.dispose());
    this.boothMeshes.clear();
  }

  createBooths(
    booths: Booth[],
    layoutConfig: LayoutConfig,
    onBoothClick: (booth: Booth) => void
  ) {
    this.clearBooths();

    booths.forEach((booth, index) => {
      const position = this.calculatePosition(index, layoutConfig, booth.posOverride);
      const mesh = this.createBoothMesh(booth, position);

      // 클릭 이벤트
      mesh.actionManager = new ActionManager(this.scene);
      mesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
          onBoothClick(booth);
        })
      );

      this.boothMeshes.set(booth.id, mesh);
    });
  }

  private calculatePosition(
    index: number,
    config: LayoutConfig,
    override?: { x: number; y: number; z: number; rotY: number } | null
  ): Vector3 {
    if (override) {
      return new Vector3(override.x, override.y, override.z);
    }

    switch (config.type) {
      case 'GRID':
        return this.calculateGridPosition(index, config);
      case 'CIRCLE':
        return this.calculateCirclePosition(index, config);
      case 'ROWS':
        return this.calculateRowsPosition(index, config);
      default:
        return Vector3.Zero();
    }
  }

  private calculateGridPosition(index: number, config: LayoutConfig): Vector3 {
    const { cols = 5, spacing = 10, startX = -25, startZ = -25 } = config;
    const row = Math.floor(index / cols);
    const col = index % cols;

    return new Vector3(
      startX + col * spacing,
      1,
      startZ + row * spacing
    );
  }

  private calculateCirclePosition(index: number, config: LayoutConfig): Vector3 {
    const { radius = 30, centerX = 0, centerZ = 0 } = config;
    // 부스 수는 실제로 배치할 때 알아야 하지만, 임시로 24개라고 가정
    const totalBooths = 24;
    const angle = (index / totalBooths) * Math.PI * 2;

    return new Vector3(
      centerX + radius * Math.cos(angle),
      1,
      centerZ + radius * Math.sin(angle)
    );
  }

  private calculateRowsPosition(index: number, config: LayoutConfig): Vector3 {
    const { boothsPerRow = 8, rowSpacing = 15, boothSpacing = 8 } = config;
    const row = Math.floor(index / boothsPerRow);
    const col = index % boothsPerRow;

    return new Vector3(
      col * boothSpacing - (boothsPerRow * boothSpacing) / 2,
      1,
      row * rowSpacing - 10
    );
  }

  private createBoothMesh(booth: Booth, position: Vector3): Mesh {
    // 부스를 간단한 박스로 표현
    const box = MeshBuilder.CreateBox(
      `booth_${booth.id}`,
      { height: 3, width: 4, depth: 4 },
      this.scene
    );
    box.position = position;
    box.checkCollisions = true;

    // 머티리얼 - 카테고리별 색상
    const material = new StandardMaterial(`mat_${booth.id}`, this.scene);
    material.diffuseColor = this.getColorByCategory(booth.category);
    material.emissiveColor = new Color3(0.1, 0.1, 0.1);
    box.material = material;

    // 부스 이름 표시 (간단히 Plane으로)
    const sign = MeshBuilder.CreatePlane(
      `sign_${booth.id}`,
      { width: 3.5, height: 0.8 },
      this.scene
    );
    sign.position = new Vector3(position.x, position.y + 2, position.z - 2.1);
    sign.parent = box;

    const signMat = new StandardMaterial(`signMat_${booth.id}`, this.scene);
    signMat.diffuseColor = new Color3(1, 1, 1);
    signMat.emissiveColor = new Color3(0.3, 0.3, 0.3);
    sign.material = signMat;

    return box;
  }

  private getColorByCategory(category: string): Color3 {
    const colors: Record<string, Color3> = {
      AI: new Color3(0.3, 0.5, 1.0),
      IoT: new Color3(0.9, 0.4, 0.2),
      '메타버스': new Color3(0.8, 0.2, 0.8),
      '모빌리티': new Color3(0.2, 0.8, 0.5),
      '헬스케어': new Color3(1.0, 0.6, 0.6),
      '클라우드': new Color3(0.5, 0.7, 0.9),
    };

    return colors[category] || new Color3(0.6, 0.6, 0.6);
  }

  highlightBooth(boothId: number) {
    this.boothMeshes.forEach((mesh, id) => {
      if (mesh.material instanceof StandardMaterial) {
        if (id === boothId) {
          mesh.material.emissiveColor = new Color3(0.5, 0.5, 0);
        } else {
          mesh.material.emissiveColor = new Color3(0.1, 0.1, 0.1);
        }
      }
    });
  }

  focusBooth(boothId: number, camera: any) {
    const mesh = this.boothMeshes.get(boothId);
    if (mesh) {
      camera.target = mesh.position;
      camera.radius = 15;
    }
  }

  getBoothMeshes(): Map<number, Mesh> {
    return this.boothMeshes;
  }
}

