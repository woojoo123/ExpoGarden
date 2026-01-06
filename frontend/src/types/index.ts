export interface User {
  id: number;
  email: string;
  nickname: string;
  role: 'ADMIN' | 'EXHIBITOR' | 'VISITOR';
  selectedCharacter?: string | null;
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  file: string;
  description?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
}

export interface Exhibition {
  id: number;
  slug: string;
  title: string;
  description: string;
  status: string;
  startAt: string | null;
  endAt: string | null;
  settings: Record<string, any>;
  hallCount: number;
  boothCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Hall {
  id: number;
  exhibitionId: number;
  name: string;
  layoutType: 'GRID' | 'CIRCLE' | 'ROWS';
  layoutConfig: LayoutConfig;
  boothCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutConfig {
  type: string;
  rows?: number;
  cols?: number;
  spacing?: number;
  startX?: number;
  startZ?: number;
  radius?: number;
  centerX?: number;
  centerZ?: number;
  rowCount?: number;
  boothsPerRow?: number;
  rowSpacing?: number;
  boothSpacing?: number;
}

export interface Booth {
  id: number;
  exhibitionId: number;
  hallId: number;
  ownerUserId: number;
  ownerNickname: string;
  status: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  tags: string[];
  allowGuestQuestions: boolean;
  allowGuestGuestbook: boolean;
  media: BoothMedia[];
  posOverride: PositionOverride | null;
  approvedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoothMedia {
  id: number;
  type: 'IMAGE' | 'VIDEO' | 'FILE' | 'LINK';
  url: string;
  title: string;
  sortOrder: number;
}

export interface PositionOverride {
  x: number;
  y: number;
  z: number;
  rotY: number;
}

export interface Question {
  id: number;
  boothId: number;
  userId: number | null;
  userNickname: string;
  guestSessionId: string | null;
  content: string;
  status: string;
  createdAt: string;
}

export interface GuestbookEntry {
  id: number;
  boothId: number;
  exhibitionId: number | null;
  userId: number | null;
  userNickname: string;
  guestSessionId: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  data: T;
  timestamp?: string;
}

