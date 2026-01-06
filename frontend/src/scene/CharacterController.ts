import {
  Scene,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  AbstractMesh,
  AnimationGroup,
  Mesh,
  SceneLoader,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import type { Booth } from '@/types';

export class CharacterController {
  private scene: Scene;
  private avatar: AbstractMesh | null = null;
  private inputMap: { [key: string]: boolean } = {};
  private moveSpeed: number = 0.15;
  private runMultiplier: number = 2.0;
  private rotationSpeed: number = 0.1;
  
  private animations: {
    idle?: AnimationGroup;
    walk?: AnimationGroup;
    run?: AnimationGroup;
  } = {};
  
  private currentAnimation: AnimationGroup | null = null;
  private booths: Booth[] = [];
  private boothMeshes: Map<number, AbstractMesh> = new Map();
  
  private proximityDistance: number = 5.0; // meters

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupKeyboardInput();
  }

  private setupKeyboardInput() {
    window.addEventListener('keydown', (evt) => {
      this.inputMap[evt.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (evt) => {
      this.inputMap[evt.key.toLowerCase()] = false;
    });
  }

  async loadAvatar(modelUrl?: string) {
    // For now, create a simple capsule avatar
    // Later can be replaced with actual 3D model loading
    if (modelUrl) {
      try {
        const result = await SceneLoader.ImportMeshAsync('', modelUrl, '', this.scene);
        this.avatar = result.meshes[0];
        
        // Store animations if available
        if (result.animationGroups.length > 0) {
          result.animationGroups.forEach((anim: AnimationGroup) => {
            const name = anim.name.toLowerCase();
            if (name.includes('idle')) {
              this.animations.idle = anim;
            } else if (name.includes('walk')) {
              this.animations.walk = anim;
            } else if (name.includes('run')) {
              this.animations.run = anim;
            }
          });
        }
      } catch (error) {
        console.warn('Failed to load avatar model, using simple capsule:', error);
        this.createSimpleAvatar();
      }
    } else {
      this.createSimpleAvatar();
    }

    if (this.avatar) {
      this.avatar.position = new Vector3(0, 1, 0);
      this.avatar.checkCollisions = true;
      
      // Set ellipsoid for collision
      if (this.avatar instanceof Mesh) {
        this.avatar.ellipsoid = new Vector3(0.5, 1, 0.5);
        this.avatar.ellipsoidOffset = new Vector3(0, 1, 0);
      }
    }

    // Play idle animation
    this.playAnimation('idle');
  }

  private createSimpleAvatar() {
    const capsule = MeshBuilder.CreateCapsule(
      'avatar',
      { height: 2, radius: 0.5 },
      this.scene
    );
    
    const material = new StandardMaterial('avatarMat', this.scene);
    material.diffuseColor = new Color3(0.2, 0.5, 0.8);
    capsule.material = material;
    
    this.avatar = capsule;
  }

  private playAnimation(animName: 'idle' | 'walk' | 'run') {
    const anim = this.animations[animName];
    
    if (anim && anim !== this.currentAnimation) {
      // Stop current animation
      if (this.currentAnimation) {
        this.currentAnimation.stop();
      }
      
      // Play new animation
      anim.start(true);
      this.currentAnimation = anim;
    }
  }

  update(_deltaTime: number) {
    if (!this.avatar) return;

    const forward = this.avatar.forward;
    const right = this.avatar.right;
    
    let moveVector = Vector3.Zero();
    let isMoving = false;
    let isRunning = this.inputMap['shift'];

    // WASD / Arrow keys movement
    if (this.inputMap['w'] || this.inputMap['arrowup']) {
      moveVector.addInPlace(forward);
      isMoving = true;
    }
    if (this.inputMap['s'] || this.inputMap['arrowdown']) {
      moveVector.subtractInPlace(forward);
      isMoving = true;
    }
    if (this.inputMap['a'] || this.inputMap['arrowleft']) {
      moveVector.subtractInPlace(right);
      isMoving = true;
    }
    if (this.inputMap['d'] || this.inputMap['arrowright']) {
      moveVector.addInPlace(right);
      isMoving = true;
    }

    // Apply movement
    if (isMoving) {
      moveVector.normalize();
      const speed = this.moveSpeed * (isRunning ? this.runMultiplier : 1.0);
      const movement = moveVector.scale(speed);
      
      this.avatar.moveWithCollisions(movement);
      
      // Rotate avatar to face movement direction
      if (moveVector.length() > 0.1) {
        const angle = Math.atan2(moveVector.x, moveVector.z);
        const targetRotation = this.avatar.rotation.y;
        const newRotation = angle;
        this.avatar.rotation.y += (newRotation - targetRotation) * this.rotationSpeed;
      }
      
      // Play appropriate animation
      if (isRunning) {
        this.playAnimation('run');
      } else {
        this.playAnimation('walk');
      }
    } else {
      this.playAnimation('idle');
    }
  }

  getPosition(): Vector3 {
    return this.avatar?.position.clone() || Vector3.Zero();
  }

  getAvatar(): AbstractMesh | null {
    return this.avatar;
  }

  setBooths(booths: Booth[], meshes: Map<number, AbstractMesh>) {
    this.booths = booths;
    this.boothMeshes = meshes;
  }

  getNearbyBooth(): Booth | null {
    if (!this.avatar || this.booths.length === 0) return null;

    const avatarPos = this.avatar.position;
    
    for (const booth of this.booths) {
      const mesh = this.boothMeshes.get(booth.id);
      if (mesh) {
        const distance = Vector3.Distance(avatarPos, mesh.position);
        if (distance < this.proximityDistance) {
          return booth;
        }
      }
    }

    return null;
  }

  dispose() {
    window.removeEventListener('keydown', this.setupKeyboardInput);
    window.removeEventListener('keyup', this.setupKeyboardInput);
    
    if (this.avatar) {
      this.avatar.dispose();
    }
    
    Object.values(this.animations).forEach((anim) => {
      anim?.dispose();
    });
  }
}

