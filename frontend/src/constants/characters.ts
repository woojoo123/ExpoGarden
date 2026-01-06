// 파츠 레이어 기반 캐릭터 커스터마이징 시스템

export type Gender = 'male' | 'female';
export type Direction = 'down' | 'left' | 'right' | 'up';

export interface AvatarConfig {
  gender: Gender;
  hairStyle: string; // 'hair_01', 'hair_02', 'hair_03'
  skinTone: number; // hex color for body tint
  hairColor: number; // hex color for hair tint
  topColor: number; // hex color for top tint
  bottomColor: number; // hex color for bottom tint
}

// 색상 팔레트
export const SKIN_TONES = {
  light: 0xffd4a3,
  medium: 0xd4a574,
  dark: 0xa67c52,
};

export const HAIR_COLORS = {
  black: 0x2d2d2d,
  brown: 0x8b5a3c,
  blonde: 0xf4d03f,
  red: 0xdc3545,
  blue: 0x3498db,
};

export const TOP_COLORS = {
  blue: 0x3b82f6,
  red: 0xef4444,
  green: 0x10b981,
  purple: 0x8b5cf6,
  orange: 0xf59e0b,
};

export const BOTTOM_COLORS = {
  navy: 0x1e3a8a,
  black: 0x1f2937,
  brown: 0x92400e,
  gray: 0x6b7280,
};

export const HAIR_STYLES = ['hair_01', 'hair_02', 'hair_03'] as const;

// 방향별 시작 프레임 인덱스
export const DIR_ROW_START: Record<Direction, number> = {
  down: 0,
  left: 4,
  right: 8,
  up: 12,
};

// 색상 이름 매핑 (UI 표시용)
export const SKIN_TONE_NAMES: Record<string, string> = {
  [SKIN_TONES.light]: '밝은 피부',
  [SKIN_TONES.medium]: '중간 피부',
  [SKIN_TONES.dark]: '어두운 피부',
};

export const HAIR_COLOR_NAMES: Record<string, string> = {
  [HAIR_COLORS.black]: '검정',
  [HAIR_COLORS.brown]: '갈색',
  [HAIR_COLORS.blonde]: '금색',
  [HAIR_COLORS.red]: '빨강',
  [HAIR_COLORS.blue]: '파랑',
};

export const TOP_COLOR_NAMES: Record<string, string> = {
  [TOP_COLORS.blue]: '파랑',
  [TOP_COLORS.red]: '빨강',
  [TOP_COLORS.green]: '초록',
  [TOP_COLORS.purple]: '보라',
  [TOP_COLORS.orange]: '주황',
};

export const BOTTOM_COLOR_NAMES: Record<string, string> = {
  [BOTTOM_COLORS.navy]: '네이비',
  [BOTTOM_COLORS.black]: '검정',
  [BOTTOM_COLORS.brown]: '갈색',
  [BOTTOM_COLORS.gray]: '회색',
};

// 기본 아바타 구성
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  gender: 'male',
  hairStyle: 'hair_01',
  skinTone: SKIN_TONES.light,
  hairColor: HAIR_COLORS.brown,
  topColor: TOP_COLORS.blue,
  bottomColor: BOTTOM_COLORS.navy,
};

// AvatarConfig를 JSON 문자열로 변환
export function avatarConfigToString(config: AvatarConfig): string {
  return JSON.stringify(config);
}

// JSON 문자열을 AvatarConfig로 변환
export function stringToAvatarConfig(str: string | null | undefined): AvatarConfig {
  if (!str) return DEFAULT_AVATAR_CONFIG;
  try {
    return JSON.parse(str) as AvatarConfig;
  } catch {
    return DEFAULT_AVATAR_CONFIG;
  }
}
