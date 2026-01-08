/**
 * 카테고리와 홀 ID 간의 매핑 관리
 */

export const CATEGORY_HALL_MAPPING: Record<string, number> = {
  'AI': 1,
  '게임': 2,
  '아트/디자인': 3,
  '사진/영상': 4,
  '일러스트': 5,
  '음악': 6,
  '3D': 7,
  '프로그래밍': 8,
  '기타': 9,
};

export const HALL_BACKGROUND_MAPPING: Record<number, string> = {
  1: 'expoBg_ai',
  2: 'expoBg_game',
  3: 'expoBg_art',
  4: 'expoBg_photo',
  5: 'expoBg_illustration',
  6: 'expoBg_music',
  7: 'expoBg_3d',
  8: 'expoBg_programming',
  9: 'expoBg_etc',
};

export const HALL_IMAGE_PATHS: Record<number, string> = {
  1: '/assets/backgrounds/expo_bg_ai.png',
  2: '/assets/backgrounds/expo_bg_game.png',
  3: '/assets/backgrounds/expo_bg_art.png',
  4: '/assets/backgrounds/expo_bg_photo.png',
  5: '/assets/backgrounds/expo_bg_illustration.png',
  6: '/assets/backgrounds/expo_bg_music.png',
  7: '/assets/backgrounds/expo_bg_3d.png',
  8: '/assets/backgrounds/expo_bg_programming.png',
  9: '/assets/backgrounds/expo_bg_etc.png',
};

/**
 * 홀 ID로 Phaser 배경 키 가져오기
 */
export function getBackgroundKeyForHall(hallId: number): string {
  return HALL_BACKGROUND_MAPPING[hallId] || 'expoBg_etc';
}

/**
 * 홀 ID로 배경 이미지 경로 가져오기
 */
export function getBackgroundPathForHall(hallId: number): string {
  return HALL_IMAGE_PATHS[hallId] || '/assets/backgrounds/expo_bg_etc.png';
}

/**
 * 홀 ID로 카테고리 이름 가져오기
 */
export function getCategoryName(hallId: number): string {
  const entry = Object.entries(CATEGORY_HALL_MAPPING).find(([_, id]) => id === hallId);
  return entry ? entry[0] : '기타';
}

/**
 * 카테고리 이름으로 홀 ID 가져오기
 */
export function getHallIdForCategory(category: string): number {
  return CATEGORY_HALL_MAPPING[category] || 9;
}

