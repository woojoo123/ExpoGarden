import axios, { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  TokenResponse,
  Exhibition,
  Hall,
  Booth,
  Page,
  Question,
  GuestbookEntry,
  ChatMessage,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터: 토큰 추가 (localStorage에서 직접 읽어서 항상 최신 토큰 사용)
    this.client.interceptors.request.use((config) => {
      // localStorage에서 직접 읽어서 항상 최신 토큰 사용
      const stored = localStorage.getItem('tokens');
      if (stored) {
        try {
          const tokens = JSON.parse(stored);
          if (tokens.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
            // this.accessToken도 동기화
            this.accessToken = tokens.accessToken;
            console.log('[API Client] Token added to request:', config.url, 'Token exists:', !!tokens.accessToken);
          } else {
            console.warn('[API Client] No accessToken in stored tokens');
          }
        } catch (e) {
          console.error('[API Client] Failed to parse tokens from localStorage:', e);
        }
      } else if (this.accessToken) {
        // 폴백: this.accessToken 사용
        config.headers.Authorization = `Bearer ${this.accessToken}`;
        console.log('[API Client] Using fallback accessToken:', config.url);
      } else {
        console.warn('[API Client] No token available for request:', config.url);
      }
      return config;
    });

    // 응답 인터셉터: 토큰 만료 시 갱신
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
          originalRequest._retry = true;

          try {
            const response = await this.refreshAccessToken();
            this.setAccessToken(response.data.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // localStorage에서 토큰 복원
    const stored = localStorage.getItem('tokens');
    if (stored) {
      try {
        const tokens = JSON.parse(stored);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
      } catch (e) {
        this.clearTokens();
      }
    }
  }

  setTokens(tokens: TokenResponse) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    localStorage.setItem(
      'tokens',
      JSON.stringify({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    );
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    const stored = localStorage.getItem('tokens');
    if (stored) {
      const tokens = JSON.parse(stored);
      tokens.accessToken = token;
      localStorage.setItem('tokens', JSON.stringify(tokens));
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('tokens');
  }

  // Auth
  async signup(email: string, password: string, nickname: string, role: string = 'EXHIBITOR') {
    const response = await this.client.post<ApiResponse<any>>('/auth/signup', {
      email,
      password,
      nickname,
      role,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post<ApiResponse<TokenResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async refreshAccessToken() {
    return this.client.post<ApiResponse<{ accessToken: string; expiresIn: number }>>(
      '/auth/refresh',
      { refreshToken: this.refreshToken }
    );
  }

  async logout() {
    if (this.refreshToken) {
      await this.client.post('/auth/logout', { refreshToken: this.refreshToken });
    }
    this.clearTokens();
  }

  async getMe() {
    const response = await this.client.get<ApiResponse<any>>('/auth/me');
    return response.data;
  }

  // Exhibitions
  async getExhibitions(status: string = 'PUBLISHED') {
    const response = await this.client.get<ApiResponse<Page<Exhibition>>>('/exhibitions', {
      params: { status },
    });
    return response.data;
  }

  async getExhibition(id: number) {
    const response = await this.client.get<ApiResponse<Exhibition>>(`/exhibitions/${id}`);
    return response.data;
  }

  async getHalls(exhibitionId: number) {
    const response = await this.client.get<ApiResponse<Hall[]>>(
      `/exhibitions/${exhibitionId}/halls`
    );
    return response.data;
  }

  // Booths
  async getBooths(params: {
    exhibitionId?: number;
    hallId?: number;
    status?: string;
    category?: string;
    q?: string;
    page?: number;
    size?: number;
  }) {
    const response = await this.client.get<ApiResponse<Page<Booth>>>('/booths', { params });
    return response.data;
  }

  async getBooth(id: number) {
    const response = await this.client.get<ApiResponse<Booth>>(`/booths/${id}`);
    return response.data;
  }

  async createBooth(data: any) {
    const response = await this.client.post<ApiResponse<Booth>>('/booths', data);
    return response.data;
  }

  async updateBooth(id: number, data: any) {
    const response = await this.client.put<ApiResponse<Booth>>(`/booths/${id}`, data);
    return response.data;
  }

  async submitBooth(id: number) {
    const response = await this.client.post<ApiResponse<Booth>>(`/booths/${id}/submit`);
    return response.data;
  }

  async approveBooth(id: number) {
    const response = await this.client.post<ApiResponse<Booth>>(`/booths/${id}/approve`);
    return response.data;
  }

  async rejectBooth(id: number, reason: string) {
    const response = await this.client.post<ApiResponse<Booth>>(`/booths/${id}/reject`, {
      reason,
    });
    return response.data;
  }

  async archiveBooth(id: number) {
    const response = await this.client.post<ApiResponse<Booth>>(`/booths/${id}/archive`);
    return response.data;
  }

  // Questions
  async getQuestions(boothId: number, page: number = 0) {
    const response = await this.client.get<ApiResponse<Page<Question>>>(
      `/booths/${boothId}/questions`,
      { params: { page, size: 20 } }
    );
    return response.data;
  }

  async createQuestion(boothId: number, content: string, guestSessionId?: string) {
    const response = await this.client.post<ApiResponse<Question>>(
      `/booths/${boothId}/questions`,
      { content, guestSessionId }
    );
    return response.data;
  }

  // Guestbook
  async getGuestbook(boothId: number, page: number = 0) {
    const response = await this.client.get<ApiResponse<Page<GuestbookEntry>>>(
      `/booths/${boothId}/guestbook`,
      { params: { page, size: 50 } }
    );
    return response.data;
  }

  async createGuestbookEntry(boothId: number, message: string, guestSessionId?: string) {
    const response = await this.client.post<ApiResponse<GuestbookEntry>>(
      `/booths/${boothId}/guestbook`,
      { message, guestSessionId }
    );
    return response.data;
  }

  // Chat
  async getChatMessages(boothId: number, page: number = 0) {
    const response = await this.client.get<ApiResponse<Page<ChatMessage>>>(
      `/booths/${boothId}/chat/messages`,
      { params: { page, size: 50 } }
    );
    return response.data;
  }

  // Tracking
  async trackEvent(event: {
    exhibitionId: number;
    boothId?: number;
    sessionId: string;
    action: string;
    metadata?: Record<string, any>;
  }) {
    await this.client.post('/track', { event });
  }

  // File Upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<{ url: string; filename: string }>>(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // Statistics
  async getExhibitionStats(exhibitionId: number) {
    const response = await this.client.get<ApiResponse<{
      exhibitionId: number;
      exhibitionTitle: string;
      totalViews: number;
      uniqueVisitors: number;
      totalBooths: number;
      topBooths: Array<{
        boothId: number;
        boothTitle: string;
        totalViews: number;
        uniqueVisitors: number;
      }>;
    }>>(`/statistics/exhibitions/${exhibitionId}`);
    return response.data;
  }

  async getBoothStats(boothId: number) {
    const response = await this.client.get<ApiResponse<{
      boothId: number;
      boothTitle: string;
      totalViews: number;
      uniqueVisitors: number;
      clickEvents: number;
      videoPlays: number;
    }>>(`/statistics/booths/${boothId}`);
    return response.data;
  }

  // User Character Selection
  async selectCharacter(characterId: string) {
    const response = await this.client.post<ApiResponse<User>>(
      '/users/character',
      { characterId }
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();
