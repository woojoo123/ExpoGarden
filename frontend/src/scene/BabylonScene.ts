import {
  Engine,
  Scene,
  ArcRotateCamera,
  FollowCamera,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  Camera,
} from '@babylonjs/core';
import { CharacterController } from './CharacterController';

export type CameraMode = 'orbit' | 'character';

export class BabylonScene {
  private engine: Engine;
  private scene: Scene;
  private orbitCamera: ArcRotateCamera;
  private followCamera: FollowCamera | null = null;
  private activeCamera: Camera;
  private cameraMode: CameraMode = 'orbit';
  private characterController: CharacterController | null = null;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.8, 0.9, 1.0, 1.0);
    this.scene.collisionsEnabled = true;

    // 궤도 카메라 설정 (기본)
    this.orbitCamera = new ArcRotateCamera(
      'orbitCamera',
      -Math.PI / 2,
      Math.PI / 3,
      50,
      Vector3.Zero(),
      this.scene
    );
    this.orbitCamera.attachControl(canvas, true);
    this.orbitCamera.lowerRadiusLimit = 10;
    this.orbitCamera.upperRadiusLimit = 100;
    this.orbitCamera.wheelPrecision = 50;
    
    this.activeCamera = this.orbitCamera;
    this.scene.activeCamera = this.activeCamera;

    // 조명
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.8;

    // 바닥
    const ground = MeshBuilder.CreateGround('ground', { width: 200, height: 200 }, this.scene);
    const groundMat = new StandardMaterial('groundMat', this.scene);
    groundMat.diffuseColor = new Color3(0.4, 0.6, 0.4);
    ground.material = groundMat;
    ground.checkCollisions = true;

    // 렌더 루프
    this.engine.runRenderLoop(() => {
      if (this.cameraMode === 'character' && this.characterController) {
        this.characterController.update(this.engine.getDeltaTime() / 1000);
      }
      this.scene.render();
    });

    // 리사이즈
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  async initCharacterMode() {
    if (!this.characterController) {
      this.characterController = new CharacterController(this.scene);
      await this.characterController.loadAvatar();
    }

    // Create follow camera
    if (!this.followCamera) {
      this.followCamera = new FollowCamera(
        'followCamera',
        new Vector3(0, 10, -15),
        this.scene
      );
      
      const avatar = this.characterController.getAvatar();
      if (avatar) {
        this.followCamera.lockedTarget = avatar;
        this.followCamera.radius = 8;
        this.followCamera.heightOffset = 3;
        this.followCamera.rotationOffset = 0;
        this.followCamera.cameraAcceleration = 0.05;
        this.followCamera.maxCameraSpeed = 5;
      }
    }
  }

  async switchCameraMode(mode: CameraMode) {
    if (mode === this.cameraMode) return;

    this.cameraMode = mode;

    if (mode === 'character') {
      // Switch to character mode
      await this.initCharacterMode();
      
      if (this.followCamera) {
        this.orbitCamera.detachControl();
        this.activeCamera = this.followCamera;
        this.scene.activeCamera = this.followCamera;
        this.followCamera.attachControl(this.canvas, true);
      }
    } else {
      // Switch to orbit mode
      if (this.followCamera) {
        this.followCamera.detachControl();
      }
      this.activeCamera = this.orbitCamera;
      this.scene.activeCamera = this.orbitCamera;
      this.orbitCamera.attachControl(this.canvas, true);
    }
  }

  getCameraMode(): CameraMode {
    return this.cameraMode;
  }

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.activeCamera;
  }

  getCharacterController(): CharacterController | null {
    return this.characterController;
  }

  dispose() {
    if (this.characterController) {
      this.characterController.dispose();
    }
    this.scene.dispose();
    this.engine.dispose();
  }
}

