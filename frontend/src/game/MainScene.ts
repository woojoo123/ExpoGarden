import Phaser from 'phaser';
import type { Booth } from '@/types';
import { getCharacterFile } from '@/constants/characters';

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private booths: Booth[] = [];
  private boothSprites: Phaser.Physics.Arcade.Sprite[] = [];
  private nearbyBooth: Booth | null = null;
  private onBoothInteract?: (booth: Booth) => void;
  private interactionText!: Phaser.GameObjects.Text;
  private selectedCharacter: string = 'character1';

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: { booths: Booth[]; onBoothInteract: (booth: Booth) => void; selectedCharacter?: string }) {
    this.booths = data.booths;
    this.onBoothInteract = data.onBoothInteract;
    this.selectedCharacter = data.selectedCharacter || 'character1';
  }

  preload() {
    // 선택된 캐릭터 스프라이트 시트 로드
    const characterFile = getCharacterFile(this.selectedCharacter);
    this.load.spritesheet('character', `/assets/characters/${characterFile}`, {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    // 배경 생성 (회색 바닥)
    this.add.rectangle(0, 0, 3000, 2000, 0x303030).setOrigin(0, 0);

    // 그리드 라인 추가 (시각적 효과)
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x404040, 0.5);
    for (let x = 0; x < 3000; x += 50) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 2000);
    }
    for (let y = 0; y < 2000; y += 50) {
      graphics.moveTo(0, y);
      graphics.lineTo(3000, y);
    }
    graphics.strokePath();

    // 플레이어 생성 (스프라이트 시트 사용)
    // 첫 번째 캐릭터 (빨간 머리) 사용, 프레임 0 = 아래 방향 정지
    this.player = this.physics.add.sprite(400, 300, 'character', 0);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.setScale(2.5); // 16x16을 확대 (40x40으로)

    // 애니메이션 생성
    this.createAnimations();

    // 부스 생성
    this.createBooths();

    // 키보드 입력 설정
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // E키로 상호작용
    this.input.keyboard!.on('keydown-E', () => {
      if (this.nearbyBooth && this.onBoothInteract) {
        this.onBoothInteract(this.nearbyBooth);
      }
    });

    // 카메라 설정
    this.cameras.main.setBounds(0, 0, 3000, 2000);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // 상호작용 텍스트
    this.interactionText = this.add.text(0, 0, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    });
    this.interactionText.setScrollFactor(0);
    this.interactionText.setDepth(100);
    this.interactionText.setVisible(false);

    // 물리 월드 설정
    this.physics.world.setBounds(0, 0, 3000, 2000);
  }

  private createAnimations() {
    // popotachars 스프라이트 시트 레이아웃:
    // 각 캐릭터는 12프레임 (0-11)
    // 0-2: 아래 방향, 3-5: 왼쪽, 6-8: 오른쪽, 9-11: 위

    // 아래 방향
    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNumbers('character', { start: 0, end: 2 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'idle-down',
      frames: [{ key: 'character', frame: 1 }],
      frameRate: 1,
    });

    // 왼쪽 방향
    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('character', { start: 3, end: 5 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'idle-left',
      frames: [{ key: 'character', frame: 4 }],
      frameRate: 1,
    });

    // 오른쪽 방향
    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('character', { start: 6, end: 8 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'idle-right',
      frames: [{ key: 'character', frame: 7 }],
      frameRate: 1,
    });

    // 위 방향
    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('character', { start: 9, end: 11 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'idle-up',
      frames: [{ key: 'character', frame: 10 }],
      frameRate: 1,
    });
  }

  private createBooths() {
    // 부스별 색상 매핑
    const categoryColors: Record<string, number> = {
      'AI': 0x3b82f6,
      'IoT': 0xef4444,
      '메타버스': 0x8b5cf6,
      '모빌리티': 0x10b981,
      '헬스케어': 0xf59e0b,
      '클라우드': 0x06b6d4,
    };

    // 부스 배치 (그리드 형태)
    const startX = 150;
    const startY = 150;
    const cols = 5;
    const spacing = 200;

    this.booths.forEach((booth, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = startX + col * spacing;
      const y = startY + row * spacing;

      // 부스 그래픽 생성
      const graphics = this.add.graphics();
      const color = categoryColors[booth.category] || 0x6b7280;
      
      // 부스 박스
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(-60, -40, 120, 80, 8);
      
      // 테두리
      graphics.lineStyle(3, 0xffffff, 0.8);
      graphics.strokeRoundedRect(-60, -40, 120, 80, 8);
      
      graphics.generateTexture(`booth_${booth.id}`, 120, 80);
      graphics.destroy();

      // 부스 스프라이트 생성
      const boothSprite = this.physics.add.sprite(x, y, `booth_${booth.id}`);
      boothSprite.setImmovable(true);
      boothSprite.setData('booth', booth);
      
      this.boothSprites.push(boothSprite);

      // 부스 이름 텍스트
      const nameText = this.add.text(x, y - 60, booth.title, {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 },
      });
      nameText.setOrigin(0.5);

      // 카테고리 뱃지
      const categoryText = this.add.text(x, y + 50, booth.category, {
        fontSize: '10px',
        color: '#ffffff',
        backgroundColor: `#${color.toString(16)}`,
        padding: { x: 4, y: 2 },
      });
      categoryText.setOrigin(0.5);
    });

    // 플레이어와 부스 충돌 설정
    this.boothSprites.forEach((boothSprite) => {
      this.physics.add.collider(this.player, boothSprite);
    });
  }

  update() {
    const speed = 160;
    let velocityX = 0;
    let velocityY = 0;

    // WASD / 방향키 입력
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = speed;
    }

    // 대각선 이동 시 속도 정규화
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      velocityX *= factor;
      velocityY *= factor;
    }

    this.player.setVelocity(velocityX, velocityY);

    // 애니메이션 업데이트
    this.updatePlayerAnimation(velocityX, velocityY);

    // 근처 부스 체크
    this.checkNearbyBooths();

    // 상호작용 텍스트 위치 업데이트
    if (this.nearbyBooth) {
      const camera = this.cameras.main;
      this.interactionText.setPosition(
        camera.width / 2 - this.interactionText.width / 2,
        camera.height - 80
      );
    }
  }

  private updatePlayerAnimation(velocityX: number, velocityY: number) {
    if (velocityX === 0 && velocityY === 0) {
      // 정지 - 마지막 방향 유지
      const currentAnim = this.player.anims.currentAnim;
      if (currentAnim) {
        const animKey = currentAnim.key;
        // walk-로 시작하는 경우만 idle로 전환
        if (animKey.startsWith('walk-')) {
          const direction = animKey.replace('walk-', '');
          this.player.play(`idle-${direction}`, true);
        }
        // 이미 idle이면 그대로 유지 (아무것도 안 함)
      } else {
        this.player.play('idle-down', true);
      }
    } else {
      // 이동 - 방향 우선순위: 상하 > 좌우
      if (Math.abs(velocityY) > Math.abs(velocityX)) {
        if (velocityY < 0) {
          this.player.play('walk-up', true);
        } else {
          this.player.play('walk-down', true);
        }
      } else {
        if (velocityX < 0) {
          this.player.play('walk-left', true);
        } else {
          this.player.play('walk-right', true);
        }
      }
    }
  }

  private checkNearbyBooths() {
    const interactionDistance = 80;
    let foundBooth: Booth | null = null;

    for (const boothSprite of this.boothSprites) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        boothSprite.x,
        boothSprite.y
      );

      if (distance < interactionDistance) {
        foundBooth = boothSprite.getData('booth');
        break;
      }
    }

    if (foundBooth !== this.nearbyBooth) {
      this.nearbyBooth = foundBooth;
      
      if (foundBooth) {
        this.interactionText.setText(`[E] ${foundBooth.title} 부스 보기`);
        this.interactionText.setVisible(true);
      } else {
        this.interactionText.setVisible(false);
      }
    }
  }
}

