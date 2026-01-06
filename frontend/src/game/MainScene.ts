import Phaser from 'phaser';
import type { Booth } from '@/types';
import { stringToAvatarConfig, type AvatarConfig, type Direction } from '@/constants/characters';
import { TopDownAvatar } from './TopDownAvatar';

export class MainScene extends Phaser.Scene {
  private player!: TopDownAvatar; // Sprite에서 TopDownAvatar로 변경
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
  private avatarConfig!: AvatarConfig;

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: { 
    booths: Booth[]; 
    onBoothInteract: (booth: Booth) => void; 
    selectedCharacter?: string; 
  }) {
    this.booths = data.booths;
    this.onBoothInteract = data.onBoothInteract;
    
    // selectedCharacter는 이제 JSON 문자열 형태의 AvatarConfig
    this.avatarConfig = stringToAvatarConfig(data.selectedCharacter);
  }

  preload() {
    // 파츠별 스프라이트 시트 로드 (48x48, 16프레임)
    const frameConfig = { frameWidth: 48, frameHeight: 48 };

    // Body (체형)
    this.load.spritesheet('body_male', '/assets/characters/parts/body_male.png', frameConfig);
    this.load.spritesheet('body_female', '/assets/characters/parts/body_female.png', frameConfig);

    // Hair (헤어스타일)
    this.load.spritesheet('hair_01', '/assets/characters/parts/hair_01.png', frameConfig);
    this.load.spritesheet('hair_02', '/assets/characters/parts/hair_02.png', frameConfig);
    this.load.spritesheet('hair_03', '/assets/characters/parts/hair_03.png', frameConfig);

    // 상의/하의/신발
    this.load.spritesheet('top_base', '/assets/characters/parts/top_base.png', frameConfig);
    this.load.spritesheet('bottom_base', '/assets/characters/parts/bottom_base.png', frameConfig);
    this.load.spritesheet('shoes_base', '/assets/characters/parts/shoes_base.png', frameConfig);
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

    // 애니메이션 생성
    this.createAnimations();

    // 플레이어(아바타) 생성
    this.player = new TopDownAvatar(this, 400, 300, this.avatarConfig);
    this.player.setDepth(10);
    this.player.setScale(2); // 48x48을 2배 확대 (96x96)

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
    this.cameras.main.startFollow(this.player.container, true, 0.1, 0.1);
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
    // 파츠 레이어 시스템에서는 body에만 애니메이션을 정의하고,
    // 나머지 파츠는 프레임 동기화로 처리합니다.
    
    const genders = ['male', 'female'] as const;
    const directions: Direction[] = ['down', 'left', 'right', 'up'];
    const dirRowStart = { down: 0, left: 4, right: 8, up: 12 };

    genders.forEach((gender) => {
      const bodyKey = `body_${gender}`;
      
      directions.forEach((dir) => {
        const start = dirRowStart[dir];
        
        // Walk 애니메이션
        this.anims.create({
          key: `walk_${dir}_${gender}`,
          frames: this.anims.generateFrameNumbers(bodyKey, { 
            start, 
            end: start + 3 
          }),
          frameRate: 8,
          repeat: -1,
        });
      });
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

    // Container는 물리 바디가 없으므로 수동 이동
    const delta = this.game.loop.delta / 1000; // 초 단위 변환
    const pos = this.player.getPosition();
    const newX = pos.x + velocityX * delta;
    const newY = pos.y + velocityY * delta;
    
    // 월드 경계 체크
    const clampedX = Phaser.Math.Clamp(newX, 0, 3000);
    const clampedY = Phaser.Math.Clamp(newY, 0, 2000);
    this.player.setPosition(clampedX, clampedY);

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
      const currentAnimKey = this.player.getCurrentAnimKey();
      if (currentAnimKey && currentAnimKey.startsWith('walk_')) {
        const parts = currentAnimKey.split('_');
        const direction = parts[1] as Direction;
        this.player.stopWalk(direction);
      } else if (!currentAnimKey) {
        // 초기 상태
        this.player.stopWalk('down');
      }
    } else {
      // 이동 - 방향 우선순위: 상하 > 좌우
      let direction: Direction;
      
      if (Math.abs(velocityY) > Math.abs(velocityX)) {
        direction = velocityY < 0 ? 'up' : 'down';
      } else {
        direction = velocityX < 0 ? 'left' : 'right';
      }
      
      this.player.playWalk(direction);
    }
  }

  private checkNearbyBooths() {
    const interactionDistance = 80;
    let foundBooth: Booth | null = null;
    const pos = this.player.getPosition();

    for (const boothSprite of this.boothSprites) {
      const distance = Phaser.Math.Distance.Between(
        pos.x,
        pos.y,
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
