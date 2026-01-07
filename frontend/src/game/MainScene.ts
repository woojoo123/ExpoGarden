import Phaser from 'phaser';
import type { Booth } from '@/types';
import type { Direction } from '@/constants/characters';

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
  private selectedCharIndex: number = 0; // 선택된 캐릭터 인덱스 (0-9)

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: { 
    booths: Booth[]; 
    onBoothInteract: (booth: Booth) => void; 
    selectedCharacter?: string; 
  }) {
    console.log('[MainScene] init() 호출됨, 데이터:', {
      boothsCount: data?.booths?.length || 0,
      hasOnBoothInteract: !!data?.onBoothInteract,
      hasSelectedCharacter: !!data?.selectedCharacter,
    });
    
    this.booths = data?.booths || [];
    this.onBoothInteract = data?.onBoothInteract;
    
    // selectedCharacter는 JSON 문자열: { charIndex: number, size: 'Character64x64' }
    // 크기는 항상 Character64x64로 고정
    try {
      if (data?.selectedCharacter) {
        const charData = JSON.parse(data.selectedCharacter);
        this.selectedCharIndex = charData.charIndex ?? 0;
      } else {
        this.selectedCharIndex = 0;
      }
    } catch {
      this.selectedCharIndex = 0;
    }
    
    console.log('[MainScene] 초기화 완료, 부스 개수:', this.booths.length, '캐릭터: Character64x64, 인덱스:', this.selectedCharIndex);
  }

  preload() {
    console.log('[MainScene] preload() 호출됨, 캐릭터: Character64x64');
    
    // 완성된 캐릭터 스프라이트 시트 로드 (항상 Character64x64 사용)
    // Character64x64.png: 512x960 (64x64 프레임, 가로 8칸, 세로 15칸)
    this.load.spritesheet(
      'Character64x64',
      '/assets/characters/Character64x64.png',
      { frameWidth: 64, frameHeight: 64 }
    );
  }

  create() {
    console.log('[MainScene] create() 호출됨, 부스 개수:', this.booths.length);
    
    // 배경 생성 (밝은 베이지/갈색 바닥)
    this.add.rectangle(0, 0, 3000, 2000, 0xe8dcc0).setOrigin(0, 0);

    // 그리드 라인 추가 (부드러운 색상)
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xd4c5a9, 0.4);
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

    // 플레이어(캐릭터) 생성 - 중앙에서 시작
    // 선택된 캐릭터의 idle down 프레임으로 시작
    const blockX = this.selectedCharIndex % 2;
    const blockY = Math.floor(this.selectedCharIndex / 2);
    const baseCol = blockX * 4;
    const baseRow = blockY * 3;
    const idleDownCol = baseCol + 1; // down 방향
    const idleDownRow = baseRow; // 첫 번째 걷기 프레임이 idle 상태
    const startFrame = idleDownRow * 8 + idleDownCol;
    
    this.player = this.physics.add.sprite(1500, 1000, 'Character64x64', startFrame);
    this.player.setDepth(10);
    
    // 캐릭터 크기 조정 (64x64 기준 1.5배)
    this.player.setScale(1.5);

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
    this.cameras.main.setZoom(1.2); // 줌을 약간 줄여서 더 넓은 화면 보기

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
    // 완성된 캐릭터 스프라이트 시트 애니메이션 생성
    // 스프라이트 시트 구조: 가로 8칸, 세로 15칸
    // 각 캐릭터: 가로 4칸(방향) x 세로 3칸(걷기 프레임) = 12프레임
    // 방향 순서: left=0, down=1, up=2, right=3
    // 걷기 프레임: 0..2 (3프레임)
    
    // 선택된 캐릭터의 블록 위치 계산
    const blockX = this.selectedCharIndex % 2; // 가로 2명
    const blockY = Math.floor(this.selectedCharIndex / 2); // 세로 5명
    const baseCol = blockX * 4; // 각 캐릭터는 가로 4칸
    const baseRow = blockY * 3; // 각 캐릭터는 세로 3칸
    
    // 방향별 컬럼 오프셋
    const dirColOffset = {
      left: 0,
      down: 1,
      up: 2,
      right: 3,
    };
    
    // 각 방향의 걷기 애니메이션 생성 (3프레임: 0, 1, 2)
    const directions: Direction[] = ['down', 'left', 'right', 'up'];
    directions.forEach((dir) => {
      const col = baseCol + dirColOffset[dir];
      const frames: number[] = [];
      
      // 걷기 프레임 3개 (row 0, 1, 2)
      for (let walkFrame = 0; walkFrame < 3; walkFrame++) {
        const row = baseRow + walkFrame;
        const frameIndex = row * 8 + col; // 가로 8칸
        frames.push(frameIndex);
      }
      
      this.anims.create({
        key: `Character64x64-walk-${dir}`,
        frames: frames.map(frame => ({ key: 'Character64x64', frame })),
        frameRate: 10,
        repeat: -1,
      });
    });
    
    console.log('[MainScene] 애니메이션 생성 완료: Character64x64, 캐릭터 인덱스:', this.selectedCharIndex);
  }

  private createBooths() {
    console.log('[MainScene] createBooths() 호출됨, 부스 개수:', this.booths.length);
    
    // 부스별 색상 매핑
    const categoryColors: Record<string, number> = {
      '아트/디자인': 0xef4444,
      '사진/영상': 0x8b5cf6,
      '일러스트': 0xec4899,
      '게임': 0x10b981,
      '음악': 0xf59e0b,
      '3D': 0x06b6d4,
      '프로그래밍': 0x6366f1,
      'AI': 0x3b82f6,
      '기타': 0x6b7280,
    };

    // 부스 배치 (양쪽에 줄지어 배치)
    const leftStartX = 200; // 왼쪽 시작 X
    const rightStartX = 2800; // 오른쪽 시작 X
    const startY = 200; // 시작 Y
    const spacingY = 180; // Y 간격
    const boothsPerSide = Math.ceil(this.booths.length / 2); // 한쪽당 부스 개수

    this.booths.forEach((booth, index) => {
      // 왼쪽 또는 오른쪽 결정
      const isLeft = index < boothsPerSide;
      const sideIndex = isLeft ? index : index - boothsPerSide;
      
      const x = isLeft ? leftStartX : rightStartX;
      const y = startY + sideIndex * spacingY;

      // 부스 그래픽 생성 (더 크게)
      const graphics = this.add.graphics();
      const color = categoryColors[booth.category] || 0x6b7280;
      
      // 부스 박스 (더 크게: 140x100)
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(-70, -50, 140, 100, 10);
      
      // 테두리 (더 두껍게)
      graphics.lineStyle(4, 0xffffff, 0.9);
      graphics.strokeRoundedRect(-70, -50, 140, 100, 10);
      
      graphics.generateTexture(`booth_${booth.id}`, 140, 100);
      graphics.destroy();

      // 부스 스프라이트 생성
      const boothSprite = this.physics.add.sprite(x, y, `booth_${booth.id}`);
      boothSprite.setImmovable(true);
      boothSprite.setData('booth', booth);
      boothSprite.setDepth(5); // 플레이어보다 낮지만 배경보다 높게
      
      this.boothSprites.push(boothSprite);

      // 부스 이름 텍스트 (더 크게)
      const nameText = this.add.text(x, y - 70, booth.title, {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 },
        stroke: '#000000',
        strokeThickness: 2,
      });
      nameText.setOrigin(0.5);
      nameText.setDepth(6); // 부스 위에 표시

      // 카테고리 뱃지 (더 크게)
      const categoryText = this.add.text(x, y + 60, booth.category, {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: `#${color.toString(16)}`,
        padding: { x: 6, y: 3 },
        stroke: '#000000',
        strokeThickness: 1,
      });
      categoryText.setOrigin(0.5);
      categoryText.setDepth(6); // 부스 위에 표시
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

    // 물리 바디로 이동
    this.player.setVelocity(velocityX, velocityY);
    
    // 월드 경계 체크
    const clampedX = Phaser.Math.Clamp(this.player.x, 0, 3000);
    const clampedY = Phaser.Math.Clamp(this.player.y, 0, 2000);
    if (clampedX !== this.player.x || clampedY !== this.player.y) {
      this.player.setPosition(clampedX, clampedY);
    }

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
      // 정지 - 애니메이션 정지
      this.player.anims.stop();
      return;
    }

    // 이동 중 - 방향에 따라 애니메이션 재생
    let direction: Direction;
    if (Math.abs(velocityY) > Math.abs(velocityX)) {
      direction = velocityY > 0 ? 'down' : 'up';
    } else {
      direction = velocityX > 0 ? 'right' : 'left';
    }

    const animKey = `Character64x64-walk-${direction}`;
    if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== animKey) {
      this.player.anims.play(animKey, true);
    }
  }

  private checkNearbyBooths() {
    const interactionDistance = 80;
    let foundBooth: Booth | null = null;
    const pos = { x: this.player.x, y: this.player.y };

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
