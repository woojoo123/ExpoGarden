import Phaser from 'phaser';
import type { AvatarConfig, Direction } from '@/constants/characters';
import { DIR_ROW_START } from '@/constants/characters';

/**
 * 파츠 레이어 기반 탑다운 아바타 클래스
 * 
 * Container로 여러 스프라이트 파츠를 겹쳐서 조합하고,
 * body의 애니메이션 프레임에 다른 파츠들을 동기화합니다.
 */
export class TopDownAvatar {
  public container: Phaser.GameObjects.Container;
  
  private body: Phaser.GameObjects.Sprite;
  private hair: Phaser.GameObjects.Sprite;
  private top: Phaser.GameObjects.Sprite;
  private bottom: Phaser.GameObjects.Sprite;
  private shoes: Phaser.GameObjects.Sprite;
  
  private scene: Phaser.Scene;
  private config: AvatarConfig;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: AvatarConfig
  ) {
    this.scene = scene;
    this.config = config;

    // 파츠별 키 생성
    const bodyKey = config.gender === 'female' ? 'body_female' : 'body_male';

    // 스프라이트 생성 (모두 같은 위치에 겹침)
    this.body = scene.add.sprite(0, 0, bodyKey, 0);
    this.bottom = scene.add.sprite(0, 0, 'bottom_base', 0);
    this.shoes = scene.add.sprite(0, 0, 'shoes_base', 0);
    this.top = scene.add.sprite(0, 0, 'top_base', 0);
    this.hair = scene.add.sprite(0, 0, config.hairStyle, 0);

    // 색상 적용 (tint)
    this.body.setTint(config.skinTone);
    this.hair.setTint(config.hairColor);
    this.top.setTint(config.topColor);
    this.bottom.setTint(config.bottomColor);

    // Container 생성 (레이어 순서: 아래부터 위로)
    this.container = scene.add.container(x, y, [
      this.shoes,
      this.bottom,
      this.body,
      this.top,
      this.hair,
    ]);

    // 프레임 동기화 설정
    this.setupFrameSync();
  }

  /**
   * body의 프레임 변경을 다른 파츠들이 따라가도록 설정
   */
  private setupFrameSync() {
    // update 이벤트마다 프레임 동기화
    this.scene.events.on('update', () => {
      const currentFrame = this.body.frame.name;
      
      // 모든 파츠를 body와 같은 프레임으로 설정
      this.hair.setFrame(currentFrame);
      this.top.setFrame(currentFrame);
      this.bottom.setFrame(currentFrame);
      this.shoes.setFrame(currentFrame);
    });
  }

  /**
   * 걷기 애니메이션 재생
   */
  public playWalk(direction: Direction) {
    const animKey = `walk_${direction}_${this.config.gender}`;
    this.body.anims.play(animKey, true);
  }

  /**
   * 정지 (idle) 상태로 전환
   */
  public stopWalk(direction: Direction) {
    const idleFrame = DIR_ROW_START[direction];
    this.body.anims.stop();
    this.body.setFrame(idleFrame);
  }

  /**
   * Container 위치 설정
   */
  public setPosition(x: number, y: number) {
    this.container.setPosition(x, y);
  }

  /**
   * Container 깊이(depth) 설정
   */
  public setDepth(depth: number) {
    this.container.setDepth(depth);
  }

  /**
   * Container 스케일 설정
   */
  public setScale(scale: number) {
    this.container.setScale(scale);
  }

  /**
   * 현재 위치 가져오기
   */
  public getPosition(): { x: number; y: number } {
    return { x: this.container.x, y: this.container.y };
  }

  /**
   * 아바타 제거
   */
  public destroy() {
    this.container.destroy();
  }

  /**
   * 현재 재생 중인 애니메이션 키 가져오기
   */
  public getCurrentAnimKey(): string | null {
    const currentAnim = this.body.anims.currentAnim;
    return currentAnim ? currentAnim.key : null;
  }

  /**
   * 애니메이션이 재생 중인지 확인
   */
  public isPlayingAnim(animKey: string): boolean {
    return this.body.anims.isPlaying && this.body.anims.currentAnim?.key === animKey;
  }
}

