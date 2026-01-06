import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
} from '@babylonjs/core';

export class BabylonScene {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.8, 0.9, 1.0, 1.0);

    // 카메라 설정
    this.camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3,
      50,
      Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(canvas, true);
    this.camera.lowerRadiusLimit = 10;
    this.camera.upperRadiusLimit = 100;
    this.camera.wheelPrecision = 50;

    // 조명
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.8;

    // 바닥
    const ground = MeshBuilder.CreateGround('ground', { width: 200, height: 200 }, this.scene);
    const groundMat = new StandardMaterial('groundMat', this.scene);
    groundMat.diffuseColor = new Color3(0.4, 0.6, 0.4);
    ground.material = groundMat;

    // 렌더 루프
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    // 리사이즈
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  dispose() {
    this.scene.dispose();
    this.engine.dispose();
  }
}

