import Phaser from 'phaser';
import type { Booth } from '@/types';
import type { Direction } from '@/constants/characters';
import { MultiplayerService, type PlayerPosition } from '@/services/MultiplayerService';
import { HallChatService, type HallChatMessage } from '@/services/HallChatService';

type ChatBubble = {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
};

// 슬롯 타입 정의 (비활성화 - 원래 그리드 배치 방식 사용)
// type ExpoSlot = {
//   id: number;
//   boothId?: number;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// };

// type WorldSlot = ExpoSlot & {
//   worldX: number;
//   worldY: number;
//   worldWidth: number;
//   worldHeight: number;
// };

// export type BoothZoneInteractEvent = {
//   boothId: number;
// };

export class MainScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.Image;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private arrowKeys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
  };
  private booths: Booth[] = [];
  private boothSprites: Phaser.Physics.Arcade.Sprite[] = [];
  private nearbyBooth: Booth | null = null;
  private onBoothInteract?: (booth: Booth) => void;
  private interactionText!: Phaser.GameObjects.Text;
  private playerNameText!: Phaser.GameObjects.Text;
  private selectedCharIndex: number = 0; // 선택된 캐릭터 인덱스 (0-9)
  private userNickname: string = ''; // 사용자 닉네임
  private userId: number | null = null; // 사용자 ID (멀티플레이어 식별용)
  private hallId: number | null = null; // 홀 ID
  private backgroundKey: string = 'expoBg_ai'; // 배경 이미지 키 (기본값: AI 홀)
  
  // 멀티플레이어 관련 필드
  private otherPlayers: Map<number, Phaser.Physics.Arcade.Sprite> = new Map(); // userId -> 스프라이트
  private otherPlayerNames: Map<number, Phaser.GameObjects.Text> = new Map(); // userId -> 닉네임 텍스트
  private multiplayerService: MultiplayerService | null = null;
  private hallChatService: HallChatService | null = null;
  private chatBubbles: Map<number, ChatBubble> = new Map();
  private chatBubbleTimers: Map<number, Phaser.Time.TimerEvent> = new Map();
  private readonly CHAT_BUBBLE_DURATION_MS = 5000;
  // lastPositionSent는 MultiplayerService 내부에서 관리하므로 제거
  
  // 슬롯 시스템 관련 필드 (비활성화 - 원래 그리드 배치 방식 사용)
  // private slots: ExpoSlot[] = [];
  // private worldSlots: WorldSlot[] = [];
  // private activeSlot: WorldSlot | null = null;
  // private debugZoneGraphics: Phaser.GameObjects.Graphics[] = [];
  // private debugZonesVisible: boolean = false;

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: { 
    booths: Booth[]; 
    onBoothInteract: (booth: Booth) => void; 
    selectedCharacter?: string; 
    userNickname?: string;
    userId?: number;
    hallId?: number;
    backgroundKey?: string;
  }) {
    console.log('[MainScene] init() 호출됨, 데이터:', {
      boothsCount: data?.booths?.length || 0,
      hasOnBoothInteract: !!data?.onBoothInteract,
      hasSelectedCharacter: !!data?.selectedCharacter,
      hallId: data?.hallId,
      backgroundKey: data?.backgroundKey,
    });
    
    this.booths = data?.booths || [];
    this.onBoothInteract = data?.onBoothInteract;
    this.userNickname = data?.userNickname || '';
    this.userId = data?.userId ?? null;
    this.hallId = data?.hallId ?? null;
    this.backgroundKey = data?.backgroundKey || 'expoBg_ai';
    
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
    
    console.log('[MainScene] 초기화 완료, 쇼룸 개수:', this.booths.length, '캐릭터: Character64x64, 인덱스:', this.selectedCharIndex);
  }

  preload() {
    console.log('[MainScene] preload() 호출됨, 캐릭터: Character64x64');
    
    // 카테고리별 홀 배경 이미지 로드 (모두 미리 로드)
    this.load.image('expoBg_ai', '/assets/backgrounds/expo_bg_ai.png');
    this.load.image('expoBg_game', '/assets/backgrounds/expo_bg_game.png');
    this.load.image('expoBg_art', '/assets/backgrounds/expo_bg_art.png');
    this.load.image('expoBg_photo', '/assets/backgrounds/expo_bg_photo.png');
    this.load.image('expoBg_illustration', '/assets/backgrounds/expo_bg_illustration.png');
    this.load.image('expoBg_music', '/assets/backgrounds/expo_bg_music.png');
    this.load.image('expoBg_3d', '/assets/backgrounds/expo_bg_3d.png');
    this.load.image('expoBg_programming', '/assets/backgrounds/expo_bg_programming.png');
    this.load.image('expoBg_etc', '/assets/backgrounds/expo_bg_etc.png');

    // 쇼룸 부스 베이스 이미지 로드
    this.load.image('boothBase', '/assets/booths/booth_base.png');

    // 완성된 캐릭터 스프라이트 시트 로드 (항상 Character64x64 사용)
    // Character64x64.png: 512x960 (64x64 프레임, 가로 8칸, 세로 15칸)
    this.load.spritesheet(
      'Character64x64',
      '/assets/characters/Character64x64.png',
      { frameWidth: 64, frameHeight: 64 }
    );
  }

  create() {
    console.log('[MainScene] create() 호출됨, 쇼룸 개수:', this.booths.length, '배경:', this.backgroundKey);
    
    // 홀별 배경 이미지 추가
    this.background = this.add.image(0, 0, this.backgroundKey);
    this.background.setOrigin(0, 0); // 좌상단이 (0,0)
    this.background.setDepth(-1000); // 모든 오브젝트 뒤에 렌더링

    // 배경 크기에 맞춰 카메라/월드 설정 및 스케일 조정
    // 이미지가 완전히 로드될 때까지 약간의 지연을 두고 호출
    this.time.delayedCall(10, () => {
      this.resizeBackgroundToView();
    });

    // 슬롯 시스템 비활성화 - 원래 그리드 배치 방식 사용
    // this.loadSlots();

    // 리사이즈 이벤트에 대응하여 배경과 카메라 갱신
    this.scale.on('resize', this.handleResize, this);

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
    
    console.log('[MainScene] 캐릭터 생성:', {
      selectedCharIndex: this.selectedCharIndex,
      blockX,
      blockY,
      baseCol,
      baseRow,
      idleDownCol,
      idleDownRow,
      startFrame,
    });
    
    // 스프라이트 시트가 제대로 로드되었는지 확인
    const texture = this.textures.get('Character64x64');
    if (texture) {
      console.log('[MainScene] 스프라이트 시트 정보:', {
        frameTotal: texture.frameTotal,
        source: texture.source,
      });
    }
    
    // 플레이어 생성 위치를 배경 중앙 근처로 설정
    const worldBounds = this.physics.world.bounds;
    const playerStartX = worldBounds.centerX || 1500;
    const playerStartY = worldBounds.centerY || 1000;

    this.player = this.physics.add.sprite(playerStartX, playerStartY, 'Character64x64', startFrame);
    this.player.setDepth(10);
    
    // 스프라이트가 정확히 한 프레임만 보이도록 설정
    this.player.setFrame(startFrame);
    
    // 물리 크기는 64x64로 설정 (충돌 감지용)
    this.player.setSize(64, 64);
    
    // 스케일을 0.5로 설정 (64x64 캐릭터 기준)
    this.player.setScale(0.5);

    // 월드 바운드 밖으로 나가지 않도록 설정 (별도 수동 클램프 대신 사용)
    this.player.setCollideWorldBounds(true);
    
    // 플레이어 닉네임 텍스트 생성 (플레이어 머리 위에 표시)
    if (this.userNickname) {
      this.playerNameText = this.add.text(0, 0, this.userNickname, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
      });
      this.playerNameText.setDepth(20); // 플레이어보다 위에 표시
      this.playerNameText.setOrigin(0.5, 0); // 중앙 정렬, 위쪽 기준
    }
    
    console.log('[MainScene] 플레이어 생성 완료:', {
      frame: this.player.frame.name,
      width: this.player.width,
      height: this.player.height,
      displayWidth: this.player.displayWidth,
      displayHeight: this.player.displayHeight,
      nickname: this.userNickname,
    });

    // 원래 방식: 그리드 자동 배치
    this.createBooths();

    // 플레이어와 쇼룸 간 충돌 설정
    this.physics.add.collider(this.player, this.boothSprites);

    // 키보드 입력 설정 (방향키만 사용)
    if (!this.input.keyboard) {
      console.error('[MainScene] 키보드 입력을 사용할 수 없습니다');
      return;
    }
    
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 방향키를 명시적으로 등록 (ArrowLeft, ArrowRight, ArrowUp, ArrowDown)
    this.arrowKeys = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
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
    this.cameras.main.setZoom(1.2); // 1.0~1.4 범위로 조정
    
    // 마우스 휠 줌 설정 (min: 1.0, max: 1.4)
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: any[], _deltaX: number, deltaY: number, _deltaZ: number) => {
      const currentZoom = this.cameras.main.zoom;
      const zoomSpeed = 0.1;
      let newZoom = currentZoom;
      
      if (deltaY > 0) {
        newZoom = Math.max(1.0, currentZoom - zoomSpeed); // 최소 1.0
      } else {
        newZoom = Math.min(1.4, currentZoom + zoomSpeed); // 최대 1.4
      }
      
      this.cameras.main.setZoom(newZoom);
    });

    // 상호작용 텍스트 (화면 중앙 상단에 고정)
    this.interactionText = this.add.text(this.cameras.main.width / 2, 100, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 12, y: 6 },
    });
    this.interactionText.setScrollFactor(0); // 카메라에 고정
    this.interactionText.setOrigin(0.5); // 중앙 정렬
    this.interactionText.setDepth(100);
    this.interactionText.setVisible(false);

    // 물리 월드 설정
    this.physics.world.setBounds(0, 0, 3000, 2000);
    
    // 멀티플레이어 서비스 초기화 (플레이어 생성 후)
    // userId가 null이어도 익명 사용자로 처리 가능
    if (this.hallId !== null) {
      this.initializeMultiplayer();
      this.initializeHallChat();
    }
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
    console.log('[MainScene] createBooths() 호출됨, 쇼룸 개수:', this.booths.length);
    
    // 배경 이미지의 실제 월드 크기 사용
    const worldWidth = this.physics.world.bounds.width;
    const worldHeight = this.physics.world.bounds.height;
    
    // 16개가 들어간다고 가정하고 4x4 그리드로 설계
    const targetCols = 4;
    const targetRows = 4;
    
    // 여백 설정
    const marginX = worldWidth * 0.1; // 좌우 10%
    const marginY = worldHeight * 0.1; // 상하 10%
    
    const availableWidth = worldWidth - (marginX * 2);
    const availableHeight = worldHeight - (marginY * 2);
    
    // 부스 크기와 간격 자동 계산 (4x4 기준)
    const spacingX = availableWidth * 0.05; // 간격 5%
    const spacingY = availableHeight * 0.05;
    
    const boothWidth = (availableWidth - (spacingX * (targetCols - 1))) / targetCols;
    const boothHeight = (availableHeight - (spacingY * (targetRows - 1))) / targetRows;
    
    console.log('[MainScene] 그리드 설정:', {
      worldSize: `${Math.round(worldWidth)}x${Math.round(worldHeight)}`,
      boothSize: `${Math.round(boothWidth)}x${Math.round(boothHeight)}`,
      maxCols: targetCols,
      maxRows: targetRows,
      totalSlots: targetCols * targetRows,
      availableBooths: this.booths.length,
    });

    // 시작 위치 (왼쪽 위, 약간 왼쪽으로 이동)
    const offsetX = worldWidth * -0.02; // 왼쪽으로 2% 이동
    const offsetY = worldHeight * 0.12; // 아래로 12% 이동
    const startX = marginX + boothWidth / 2 + offsetX;
    const startY = marginY + boothHeight / 2 + offsetY;

    // 승인된 쇼룸을 슬롯에 순서대로 배치
    this.booths.forEach((booth, index) => {
      // 슬롯이 부족하면 경고
      if (index >= (targetCols * targetRows)) {
        console.warn(`[MainScene] 슬롯 부족: ${index + 1}번째 쇼룸을 배치할 수 없음 (최대 ${targetCols * targetRows}개)`);
        return;
      }
      
      // 그리드 위치 계산
      const row = Math.floor(index / targetCols);
      const col = index % targetCols;
      
      // 실제 픽셀 좌표 계산
      const x = startX + col * (boothWidth + spacingX);
      const y = startY + row * (boothHeight + spacingY);
      
      console.log(`[MainScene] 쇼룸 ${index + 1} 배치:`, {
        id: booth.id,
        title: booth.title,
        slot: `${row + 1}-${col + 1}`,
        position: `(${x}, ${y})`,
      });

      // 쇼룸 이미지 스프라이트 생성 (원본 색상 그대로 사용)
      const boothSprite = this.physics.add.sprite(x, y, 'boothBase');
      
      // 부스 크기에 맞게 조정
      boothSprite.setDisplaySize(boothWidth, boothHeight);
      
      boothSprite.setImmovable(true);
      boothSprite.setData('booth', booth);
      boothSprite.setDepth(5);
      
      this.boothSprites.push(boothSprite);

      // 쇼룸 이름 텍스트
      const nameText = this.add.text(x, y - boothHeight / 2 - 20, booth.title, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 12, y: 6 },
        stroke: '#000000',
        strokeThickness: 3,
      });
      nameText.setOrigin(0.5);
      nameText.setDepth(6);

      // 카테고리 뱃지 제거 (사용자 요청)
      // const categoryText = this.add.text(x, y + boothHeight / 2 + 15, booth.category, {
      //   fontSize: '16px',
      //   color: '#ffffff',
      //   backgroundColor: `#${color.toString(16)}`,
      //   padding: { x: 8, y: 4 },
      //   stroke: '#000000',
      //   strokeThickness: 2,
      // });
      // categoryText.setOrigin(0.5);
      // categoryText.setDepth(6);
    });
  }

  update() {
    const speed = 160;
    let velocityX = 0;
    let velocityY = 0;

    // 방향키 입력 (cursors와 arrowKeys 모두 체크)
    if (this.cursors.left.isDown || this.arrowKeys.left.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.arrowKeys.right.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.arrowKeys.up.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.arrowKeys.down.isDown) {
      velocityY = speed;
    }

    // 대각선 이동 시 속도 정규화
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      velocityX *= factor;
      velocityY *= factor;
    }

    // 물리 바디로 이동 (Arcade Physics가 자동으로 처리)
    this.player.setVelocity(velocityX, velocityY);

    // 애니메이션 업데이트
    this.updatePlayerAnimation(velocityX, velocityY);

    // 플레이어 닉네임 텍스트 위치 업데이트 (플레이어 머리 위)
    if (this.playerNameText) {
      this.playerNameText.setPosition(this.player.x, this.player.y + this.player.displayHeight / 2 + 6);
    }

    // 근처 쇼룸 체크
    this.checkNearbyBooths();

    // 상호작용 텍스트 위치를 화면 중앙 상단으로 고정 (카메라 이동과 무관)
    if (this.interactionText.visible) {
      const camera = this.cameras.main;
      // 카메라 스크롤 위치를 고려하여 화면 중앙 상단에 고정
      const screenX = camera.scrollX + camera.width / 2;
      const screenY = camera.scrollY + 100;
      this.interactionText.setPosition(screenX, screenY);
    }

    // 멀티플레이어 위치 전송 (100ms마다)
    if (this.multiplayerService && this.multiplayerService.isConnected()) {
      this.multiplayerService.sendPosition(this.player.x, this.player.y);
    }

    // 다른 플레이어 닉네임 텍스트 위치 업데이트
    for (const [userId, player] of this.otherPlayers.entries()) {
      const nameText = this.otherPlayerNames.get(userId);
      if (nameText && player.active) {
        nameText.setPosition(player.x, player.y + player.displayHeight / 2 + 6);
      }
    }

    // 채팅 말풍선 위치 업데이트
    this.updateChatBubblePositions();

    // 씬이 종료될 때 리사이즈 이벤트 정리
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
      this.cleanupMultiplayer();
    });
  }

  /**
   * 배경 이미지를 현재 뷰 크기에 맞게 스케일링하고,
   * 카메라/물리 월드 경계를 배경 크기에 맞게 설정한다.
   * 배경이 화면을 완전히 채우도록 cover 방식으로 스케일링.
   */
  private resizeBackgroundToView() {
    if (!this.background) return;

    const texture = this.textures.get(this.backgroundKey);
    if (!texture || !texture.source || !texture.source[0]) {
      console.warn('[MainScene] 배경 이미지 텍스처가 아직 로드되지 않음:', this.backgroundKey);
      return;
    }
    
    const source = texture.getSourceImage() as HTMLImageElement;
    if (!source || !source.complete) {
      console.warn('[MainScene] 배경 이미지가 아직 완전히 로드되지 않음');
      return;
    }
    
    const naturalWidth = source.width;
    const naturalHeight = source.height;

    // this.scale 대신 this.game.scale을 사용하여 정확한 크기 가져오기
    const viewWidth = this.game.scale.width;
    const viewHeight = this.game.scale.height;

    // cover 방식: 화면을 완전히 채우도록 더 큰 스케일 사용
    const scaleX = viewWidth / naturalWidth;
    const scaleY = viewHeight / naturalHeight;
    const scale = Math.max(scaleX, scaleY);

    this.background.setScale(scale);

    // 배경이 화면 중앙에 오도록 위치 조정
    const scaledWidth = naturalWidth * scale;
    const scaledHeight = naturalHeight * scale;
    
    // 배경을 화면 중앙에 배치 (화면보다 크면 잘리도록)
    this.background.setPosition(0, 0);
    this.background.setOrigin(0, 0);

    // 월드 크기는 배경의 실제 스케일된 크기로 설정
    const worldWidth = scaledWidth;
    const worldHeight = scaledHeight;

    // 카메라 및 물리 월드 바운드 설정
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 슬롯 시스템 비활성화
    // if (this.slots.length > 0) {
    //   this.convertSlotsToWorld();
    //   this.createBoothZoneDebugGraphics();
    // }
  }

  /**
   * Phaser Scale Manager의 resize 이벤트 핸들러
   */
  private handleResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.cameras.resize(width, height);
    this.resizeBackgroundToView();
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

  /**
   * 슬롯 JSON 데이터를 로드하고 월드 좌표로 변환 (비활성화 - 원래 그리드 배치 방식 사용)
   */
  /*
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private loadSlots() {
    try {
      const slotsData = this.cache.json.get('expoSlots') as { slots: ExpoSlot[] };
      this.slots = slotsData.slots || [];
      console.log('[MainScene] 슬롯 로드 완료:', this.slots.length, '개');
      
      if (this.slots.length > 0) {
        // 슬롯이 있으면 슬롯 위치에 부스 생성
        this.convertSlotsToWorld();
        this.createBoothZoneDebugGraphics();
      } else {
        // 슬롯이 없으면 기본 그리드 배치
        console.log('[MainScene] 슬롯이 없어 기본 그리드 배치 사용');
        this.createBooths();
        if (this.player && this.boothSprites.length > 0) {
          this.physics.add.collider(this.player, this.boothSprites);
        }
      }
    } catch (error) {
      console.error('[MainScene] 슬롯 로드 실패, 기본 그리드 배치 사용:', error);
      this.slots = [];
      // 슬롯 로드 실패 시 기본 배치
      this.createBooths();
      if (this.player && this.boothSprites.length > 0) {
        this.physics.add.collider(this.player, this.boothSprites);
      }
    }
  }
  */

  /**
   * 슬롯을 배경 스케일에 맞춰 월드 좌표로 변환 (비활성화)
   */
  /*
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private convertSlotsToWorld() {
    this.worldSlots = this.slots.map(slot => ({
      ...slot,
      worldX: slot.x * this.bgScale,
      worldY: slot.y * this.bgScale,
      worldWidth: slot.width * this.bgScale,
      worldHeight: slot.height * this.bgScale,
    }));
    
    // 슬롯 위치에 실제 부스 생성
    this.createBoothsAtSlots();
  }
  */
  
  /**
   * 슬롯 위치에 실제 부스 스프라이트 생성 (비활성화)
   */
  /*
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private createBoothsAtSlots() {
    // 기존 부스 스프라이트 제거
    this.boothSprites.forEach(sprite => sprite.destroy());
    this.boothSprites = [];
    
    // 쇼룸별 색상 매핑
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
    
    // 슬롯과 부스를 매핑 (boothId가 있으면 해당 부스, 없으면 순서대로)
    this.worldSlots.forEach((slot, index) => {
      let booth: Booth | undefined;
      
      if (slot.boothId) {
        // boothId가 지정되어 있으면 해당 부스 찾기
        booth = this.booths.find(b => b.id === slot.boothId);
      } else {
        // boothId가 없으면 순서대로 매핑
        booth = this.booths[index];
      }
      
      if (!booth) {
        console.warn(`[MainScene] 슬롯 ${slot.id}에 해당하는 부스 없음: index=${index}, boothId=${slot.boothId}`);
        return;
      }
      
      // 부스 중앙 좌표
      const x = slot.worldX + slot.worldWidth / 2;
      const y = slot.worldY + slot.worldHeight / 2;
      
      const color = categoryColors[booth.category] || 0x6b7280;
      
      // 부스 그래픽 생성
      const graphics = this.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(-slot.worldWidth / 2, -slot.worldHeight / 2, slot.worldWidth, slot.worldHeight, 15);
      graphics.lineStyle(6, 0xffffff, 0.9);
      graphics.strokeRoundedRect(-slot.worldWidth / 2, -slot.worldHeight / 2, slot.worldWidth, slot.worldHeight, 15);
      
      graphics.generateTexture(`booth_${booth.id}`, slot.worldWidth, slot.worldHeight);
      graphics.destroy();
      
      // 부스 스프라이트 생성
      const boothSprite = this.physics.add.sprite(x, y, `booth_${booth.id}`);
      boothSprite.setImmovable(true);
      boothSprite.setData('booth', booth);
      boothSprite.setDepth(5);
      this.boothSprites.push(boothSprite);
      
      // 부스 이름 텍스트
      const nameText = this.add.text(x, y - slot.worldHeight / 2 - 20, booth.title, {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
        stroke: '#000000',
        strokeThickness: 3,
      });
      nameText.setOrigin(0.5);
      nameText.setDepth(6);
      
      // 카테고리 뱃지
      const categoryText = this.add.text(x, y + slot.worldHeight / 2 + 15, booth.category, {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: `#${color.toString(16)}`,
        padding: { x: 6, y: 3 },
        stroke: '#000000',
        strokeThickness: 2,
      });
      categoryText.setOrigin(0.5);
      categoryText.setDepth(6);
    });
    
    // 플레이어와 부스 간 충돌 설정
    if (this.player) {
      this.physics.add.collider(this.player, this.boothSprites);
    }
    
    console.log(`[MainScene] 슬롯 위치에 부스 ${this.boothSprites.length}개 생성 완료`);
  }
  */

  /**
   * 슬롯 존 디버그 렌더링 (비활성화)
   */
  /*
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private createBoothZoneDebugGraphics() {
    // 기존 그래픽 제거
    this.debugZoneGraphics.forEach(g => g.destroy());
    this.debugZoneGraphics = [];

    this.worldSlots.forEach(slot => {
      const g = this.add.graphics();
      g.lineStyle(3, 0x00ff00, 0.8);
      g.strokeRect(slot.worldX, slot.worldY, slot.worldWidth, slot.worldHeight);
      
      // 슬롯 ID 텍스트
      const text = this.add.text(
        slot.worldX + slot.worldWidth / 2,
        slot.worldY + slot.worldHeight / 2,
        `Slot ${slot.id}\nBooth ${slot.boothId}`,
        {
          fontSize: '12px',
          color: '#00ff00',
          align: 'center',
          backgroundColor: '#000000',
          padding: { x: 4, y: 2 },
        }
      );
      text.setOrigin(0.5);
      text.setDepth(998);
      text.setVisible(this.debugZonesVisible);
      
      g.setDepth(997);
      g.setVisible(this.debugZonesVisible);
      this.debugZoneGraphics.push(g);
    });
  }
  */

  /**
   * 플레이어가 현재 어느 슬롯 존 위에 있는지 체크 (비활성화)
   */
  /*
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updateActiveSlot() {
    this.activeSlot = null;

    const px = this.player.x;
    const py = this.player.y;

    for (const slot of this.worldSlots) {
      if (
        px >= slot.worldX &&
        px <= slot.worldX + slot.worldWidth &&
        py >= slot.worldY &&
        py <= slot.worldY + slot.worldHeight
      ) {
        this.activeSlot = slot;
        break;
      }
    }

    // 상호작용 텍스트 업데이트
    if (this.activeSlot) {
      const booth = this.booths.find(b => b.id === this.activeSlot!.boothId);
      if (booth) {
        this.interactionText.setText(`[E] ${booth.title} 쇼룸 보기`);
        this.interactionText.setVisible(true);
      }
    } else if (!this.nearbyBooth) {
      // 슬롯에도 없고 기존 부스에도 없으면 숨김
      this.interactionText.setVisible(false);
    }
  }
  */

  private checkNearbyBooths() {
    const interactionDistance = 150; // 80에서 150으로 증가 (더 넓은 범위)
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
        this.interactionText.setText(`[E] ${foundBooth.title} 쇼룸 보기`);
        this.interactionText.setVisible(true);
      } else {
        this.interactionText.setVisible(false);
      }
    }
  }

  /**
   * 멀티플레이어 서비스 초기화
   */
  private initializeMultiplayer() {
    if (this.hallId === null) {
      console.warn('[MainScene] 멀티플레이어 초기화 실패: hallId가 없음');
      return;
    }

    // userId가 null이면 익명 사용자로 처리 (음수 ID 사용)
    const effectiveUserId = this.userId ?? -1;

    console.log('[MainScene] 멀티플레이어 서비스 초기화 시작', {
      hallId: this.hallId,
      userId: effectiveUserId,
      nickname: this.userNickname,
      charIndex: this.selectedCharIndex,
    });

    this.multiplayerService = new MultiplayerService();
    this.multiplayerService.connect(
      this.hallId,
      effectiveUserId,
      this.userNickname || '게스트',
      this.selectedCharIndex,
      this.player.x,
      this.player.y,
      (position: PlayerPosition) => {
        this.handlePlayerUpdate(position);
      }
    );
  }

  /**
   * 홀 채팅 서비스 초기화
   */
  private initializeHallChat() {
    if (this.hallId === null) {
      console.warn('[MainScene] 홀 채팅 초기화 실패: hallId가 없음');
      return;
    }

    const effectiveUserId = this.userId ?? -1;
    const nickname = this.userNickname || '게스트';

    this.hallChatService = new HallChatService();
    this.hallChatService.connect(this.hallId, effectiveUserId, nickname, (message: HallChatMessage) => {
      this.handleHallChatMessage(message);
    });
  }

  /**
   * 다른 플레이어 업데이트 처리
   */
  private handlePlayerUpdate(position: PlayerPosition) {
    const effectiveUserId = this.userId ?? -1;
    if (position.userId === effectiveUserId) {
      console.log('[MainScene] Ignoring own player update:', position.userId);
      return; // 자신의 메시지는 무시
    }

    console.log('[MainScene] Handling player update:', {
      type: position.type,
      userId: position.userId,
      nickname: position.nickname,
      x: position.x,
      y: position.y,
    });

    switch (position.type) {
      case 'JOIN':
        console.log('[MainScene] Creating other player:', position.userId);
        this.createOtherPlayer(position.userId, position.nickname, position.x, position.y, position.charIndex);
        break;
      case 'UPDATE':
        this.updateOtherPlayer(position.userId, position.x, position.y);
        break;
      case 'LEAVE':
        console.log('[MainScene] Removing other player:', position.userId);
        this.removeOtherPlayer(position.userId);
        break;
    }
  }

  /**
   * 홀 채팅 메시지 처리
   */
  private handleHallChatMessage(message: HallChatMessage) {
    if (!message.message) {
      return;
    }

    this.showChatBubble(message.userId, message.message);
  }

  /**
   * 다른 플레이어 스프라이트 생성
   */
  private createOtherPlayer(userId: number, nickname: string, x: number, y: number, charIndex: number) {
    // 이미 존재하는 플레이어는 업데이트만
    if (this.otherPlayers.has(userId)) {
      this.updateOtherPlayer(userId, x, y);
      return;
    }

    console.log('[MainScene] 다른 플레이어 생성:', { userId, nickname, x, y, charIndex });

    // 캐릭터 프레임 계산 (플레이어와 동일한 로직)
    const blockX = charIndex % 2;
    const blockY = Math.floor(charIndex / 2);
    const baseCol = blockX * 4;
    const baseRow = blockY * 3;
    const idleDownCol = baseCol + 1;
    const idleDownRow = baseRow;
    const startFrame = idleDownRow * 8 + idleDownCol;

    // 다른 플레이어 스프라이트 생성
    const otherPlayer = this.physics.add.sprite(x, y, 'Character64x64', startFrame);
    otherPlayer.setDepth(10);
    otherPlayer.setFrame(startFrame);
    otherPlayer.setSize(64, 64);
    otherPlayer.setScale(0.5);
    otherPlayer.setCollideWorldBounds(true);
    otherPlayer.setImmovable(true); // 다른 플레이어는 물리적으로 고정

    this.otherPlayers.set(userId, otherPlayer);

    // 닉네임 텍스트 생성
    const nameText = this.add.text(x, y + otherPlayer.displayHeight / 2 + 6, nickname, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    });
    nameText.setDepth(20);
    nameText.setOrigin(0.5, 0);

    this.otherPlayerNames.set(userId, nameText);
  }

  /**
   * 다른 플레이어 위치 업데이트
   */
  private updateOtherPlayer(userId: number, x: number, y: number) {
    const player = this.otherPlayers.get(userId);
    const nameText = this.otherPlayerNames.get(userId);

    if (player) {
      // 부드러운 이동을 위해 lerp 사용
      this.tweens.add({
        targets: player,
        x: x,
        y: y,
        duration: 100, // 100ms 동안 이동
        ease: 'Linear',
      });
    }

    if (nameText) {
      this.tweens.add({
        targets: nameText,
        x: x,
        y: y + (player ? player.displayHeight / 2 + 6 : 0),
        duration: 100,
        ease: 'Linear',
      });
    }
  }

  /**
   * 다른 플레이어 제거
   */
  private removeOtherPlayer(userId: number) {
    console.log('[MainScene] 다른 플레이어 제거:', userId);

    const player = this.otherPlayers.get(userId);
    const nameText = this.otherPlayerNames.get(userId);

    if (player) {
      player.destroy();
      this.otherPlayers.delete(userId);
    }

    if (nameText) {
      nameText.destroy();
      this.otherPlayerNames.delete(userId);
    }

    this.removeChatBubble(userId);
  }

  /**
   * 멀티플레이어 정리
   */
  private cleanupMultiplayer() {
    if (this.multiplayerService) {
      this.multiplayerService.disconnect();
      this.multiplayerService = null;
    }

    if (this.hallChatService) {
      this.hallChatService.disconnect();
      this.hallChatService = null;
    }

    // 모든 다른 플레이어 제거
    for (const [userId, player] of this.otherPlayers.entries()) {
      player.destroy();
      const nameText = this.otherPlayerNames.get(userId);
      if (nameText) {
        nameText.destroy();
      }
      this.removeChatBubble(userId);
    }
    this.otherPlayers.clear();
    this.otherPlayerNames.clear();
  }

  /**
   * 홀 채팅 전송 (UI에서 호출)
   */
  public sendHallChatMessage(message: string) {
    if (!this.hallChatService || !message.trim()) {
      return;
    }

    this.hallChatService.sendMessage(message.trim());

    // 로컬 플레이어도 즉시 말풍선 표시
    const effectiveUserId = this.userId ?? -1;
    this.showChatBubble(effectiveUserId, message.trim());
  }

  private showChatBubble(userId: number, message: string) {
    const target = this.getPlayerSpriteByUserId(userId);
    if (!target) {
      return;
    }

    let bubble = this.chatBubbles.get(userId);
    if (!bubble) {
      const background = this.add.graphics();
      const text = this.add.text(0, 0, message, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#111111',
        align: 'center',
        wordWrap: { width: 180 },
      });
      text.setOrigin(0.5, 0.5);

      const container = this.add.container(0, 0, [background, text]);
      container.setDepth(30);

      bubble = { container, background, text };
      this.chatBubbles.set(userId, bubble);
    } else {
      bubble.text.setText(message);
    }

    this.redrawChatBubble(bubble);
    this.updateChatBubblePosition(userId, target);

    const existingTimer = this.chatBubbleTimers.get(userId);
    if (existingTimer) {
      existingTimer.remove(false);
    }

    const timer = this.time.delayedCall(this.CHAT_BUBBLE_DURATION_MS, () => {
      this.removeChatBubble(userId);
    });
    this.chatBubbleTimers.set(userId, timer);
  }

  private updateChatBubblePositions() {
    for (const [userId, bubble] of this.chatBubbles.entries()) {
      const target = this.getPlayerSpriteByUserId(userId);
      if (!target || !bubble.container.active) {
        continue;
      }
      this.updateChatBubblePosition(userId, target);
    }
  }

  private updateChatBubblePosition(userId: number, target: Phaser.Physics.Arcade.Sprite) {
    const bubble = this.chatBubbles.get(userId);
    if (!bubble) {
      return;
    }
    bubble.container.setPosition(target.x, target.y - target.displayHeight / 2 - 6);
  }

  private getPlayerSpriteByUserId(userId: number): Phaser.Physics.Arcade.Sprite | null {
    const effectiveUserId = this.userId ?? -1;
    if (userId === effectiveUserId) {
      return this.player ?? null;
    }
    return this.otherPlayers.get(userId) ?? null;
  }

  private removeChatBubble(userId: number) {
    const bubble = this.chatBubbles.get(userId);
    if (bubble) {
      bubble.container.destroy();
      this.chatBubbles.delete(userId);
    }

    const timer = this.chatBubbleTimers.get(userId);
    if (timer) {
      timer.remove(false);
      this.chatBubbleTimers.delete(userId);
    }
  }

  private redrawChatBubble(bubble: ChatBubble) {
    const paddingX = 10;
    const paddingY = 6;
    const radius = 8;

    const textBounds = bubble.text.getBounds();
    const bubbleWidth = textBounds.width + paddingX * 2;
    const bubbleHeight = textBounds.height + paddingY * 2;
    const tailHeight = 8;
    const tailWidth = 12;

    bubble.background.clear();
    bubble.background.fillStyle(0xffffff, 0.95);
    bubble.background.lineStyle(2, 0x111111, 0.15);

    bubble.background.fillRoundedRect(
      -bubbleWidth / 2,
      -bubbleHeight,
      bubbleWidth,
      bubbleHeight,
      radius
    );
    bubble.background.strokeRoundedRect(
      -bubbleWidth / 2,
      -bubbleHeight,
      bubbleWidth,
      bubbleHeight,
      radius
    );

    bubble.background.fillTriangle(
      -tailWidth / 2,
      0,
      tailWidth / 2,
      0,
      0,
      tailHeight
    );
    bubble.background.lineStyle(2, 0x111111, 0.15);
    bubble.background.strokeTriangle(
      -tailWidth / 2,
      0,
      tailWidth / 2,
      0,
      0,
      tailHeight
    );

    bubble.text.setPosition(0, -bubbleHeight / 2);
  }
}
