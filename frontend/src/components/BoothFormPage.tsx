import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import type { Booth } from '@/types';

interface MediaItem {
  type: 'IMAGE' | 'VIDEO' | 'FILE' | 'LINK';
  url: string;
  title: string;
  sortOrder: number;
}

export const BoothFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { user } = useStore();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    category: '',
    thumbnailUrl: '',
    tags: '',
    allowGuestQuestions: false,
    allowGuestGuestbook: false,
  });

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  useEffect(() => {
    // 로그인 체크 (토큰이 있으면 사용자 정보 복원 시도)
    const checkAuth = async () => {
      if (!user) {
        const tokens = localStorage.getItem('tokens');
        if (tokens) {
          try {
            // 토큰이 있으면 사용자 정보 복원 시도
            const response = await apiClient.getMe();
            useStore.getState().setUser(response.data);
            // 복원 후 계속 진행
            if (isEditMode) {
              loadBooth();
            }
          } catch (error) {
            // 토큰이 유효하지 않으면 로그인 페이지로
            alert('로그인이 필요합니다.');
            navigate('/login');
          }
        } else {
          // 토큰도 없으면 로그인 페이지로
          alert('로그인이 필요합니다.');
          navigate('/login');
        }
        return;
      }

      // 로그인되어 있으면 정상 진행
      if (isEditMode) {
        loadBooth();
      }
    };

    checkAuth();
  }, [user, id]);

  // 개인 쇼룸 플랫폼: 전시/홀 선택 불필요 (자동 할당)

  const loadBooth = async () => {
    if (!id) return;

    try {
      const response = await apiClient.getBooth(Number(id));
      const booth = response.data;

      setFormData({
        title: booth.title,
        summary: booth.summary || '',
        description: booth.description || '',
        category: booth.category || '',
        thumbnailUrl: booth.thumbnailUrl || '',
        tags: booth.tags?.join(', ') || '',
        allowGuestQuestions: booth.allowGuestQuestions,
        allowGuestGuestbook: booth.allowGuestGuestbook,
      });

      if (booth.media) {
        setMedia(booth.media);
      }
    } catch (error) {
      console.error('Failed to load booth:', error);
      alert('부스를 불러올 수 없습니다');
      navigate('/my/booths');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddMedia = () => {
    setMedia([
      ...media,
      {
        type: 'IMAGE',
        url: '',
        title: '',
        sortOrder: media.length,
      },
    ]);
  };

  const handleMediaChange = (index: number, field: string, value: string) => {
    const newMedia = [...media];
    newMedia[index] = { ...newMedia[index], [field]: value };
    setMedia(newMedia);
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const response = await apiClient.uploadFile(file);
      setFormData({
        ...formData,
        thumbnailUrl: response.data.url,
      });
      alert('썸네일 업로드 완료!');
    } catch (error) {
      alert('썸네일 업로드 실패');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async () => {
    // 로그인 체크
    const currentUser = useStore.getState().user;
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 개인 쇼룸 플랫폼: 전시/홀은 백엔드에서 자동 할당
      const payload = {
        title: formData.title,
        summary: formData.summary,
        description: formData.description,
        category: formData.category,
        thumbnailUrl: formData.thumbnailUrl,
        tags: formData.tags.split(',').map((t) => t.trim()).filter((t) => t),
        allowGuestQuestions: formData.allowGuestQuestions,
        allowGuestGuestbook: formData.allowGuestGuestbook,
        media: media.filter((m) => m.url),
      };

      if (isEditMode) {
        await apiClient.updateBooth(Number(id), payload);
        alert('쇼룸이 수정되었습니다!');
        navigate('/my/booths');
      } else {
        const response = await apiClient.createBooth(payload);
        const createdBoothId = response.data.id;
        
        // 생성 후 자동으로 제출
        try {
          await apiClient.submitBooth(createdBoothId);
          alert('쇼룸이 제출되었습니다! 관리자 승인 후 갤러리에 노출됩니다.');
        } catch (submitError) {
          console.error('제출 실패:', submitError);
          alert('쇼룸은 생성되었지만 제출에 실패했습니다. 내 쇼룸 관리에서 제출해주세요.');
        }
        
        // 생성 완료 후 상세 페이지로 이동
        navigate(`/showroom/${createdBoothId}?created=true`);
      }
    } catch (err: any) {
      console.error('Booth creation error:', err);
      
      // 401 에러 처리
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        apiClient.clearTokens();
        useStore.getState().setUser(null);
        navigate('/login');
        return;
      }
      
      // 기타 에러
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message || 
                          '저장에 실패했습니다.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>{isEditMode ? '쇼룸 수정' : '새 쇼룸 만들기'}</h1>
        <button onClick={() => navigate('/my/booths')} style={styles.backBtn}>
          ← 내 쇼룸으로
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); }} style={styles.form}>
        <div style={styles.section}>
          <h2>기본 정보</h2>

          <div style={styles.field}>
            <label style={styles.label}>부스 제목 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
              placeholder="예: AI 혁신 부스"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>짧은 설명</label>
            <input
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              style={styles.input}
              placeholder="한 줄로 부스를 소개하세요"
              maxLength={500}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>상세 설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="부스에 대한 상세한 설명을 입력하세요"
              rows={6}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>카테고리</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">카테고리를 선택하세요</option>
              <option value="아트/디자인">아트/디자인</option>
              <option value="사진/영상">사진/영상</option>
              <option value="일러스트">일러스트</option>
              <option value="게임">게임</option>
              <option value="음악">음악</option>
              <option value="3D">3D</option>
              <option value="프로그래밍">프로그래밍</option>
              <option value="AI">AI</option>
              <option value="IoT">IoT</option>
              <option value="메타버스">메타버스</option>
              <option value="모빌리티">모빌리티</option>
              <option value="헬스케어">헬스케어</option>
              <option value="클라우드">클라우드</option>
              <option value="블록체인">블록체인</option>
              <option value="교육">교육</option>
              <option value="엔터테인먼트">엔터테인먼트</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>태그 (쉼표로 구분)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              style={styles.input}
              placeholder="예: AI, ML, 딥러닝"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>썸네일 이미지</label>
            <div style={styles.uploadRow}>
              <input
                type="text"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                style={{ ...styles.input, flex: 1 }}
                placeholder="URL 직접 입력 또는 오른쪽 버튼으로 파일 업로드"
              />
              <label style={styles.uploadBtn}>
                {uploadingThumbnail ? '⏳ 업로드 중...' : '📤 이미지 업로드'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  style={styles.fileInput}
                  disabled={uploadingThumbnail}
                />
              </label>
            </div>
            {formData.thumbnailUrl && (
              <div style={styles.previewContainer}>
                <img src={formData.thumbnailUrl} alt="썸네일 미리보기" style={styles.preview} />
                <p style={styles.previewText}>미리보기</p>
              </div>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2>미디어</h2>
          {media.map((item, index) => (
            <div key={index} style={styles.mediaItem}>
              <div style={styles.mediaRow}>
                <select
                  value={item.type}
                  onChange={(e) => handleMediaChange(index, 'type', e.target.value)}
                  style={styles.mediaSelect}
                >
                  <option value="IMAGE">이미지</option>
                  <option value="VIDEO">비디오</option>
                  <option value="FILE">파일</option>
                  <option value="LINK">링크</option>
                </select>

                <input
                  type="text"
                  placeholder="제목"
                  value={item.title}
                  onChange={(e) => handleMediaChange(index, 'title', e.target.value)}
                  style={styles.mediaInput}
                />

                <input
                  type="url"
                  placeholder="URL"
                  value={item.url}
                  onChange={(e) => handleMediaChange(index, 'url', e.target.value)}
                  style={styles.mediaInput}
                  required
                />

                <button
                  type="button"
                  onClick={() => handleRemoveMedia(index)}
                  style={styles.removeBtn}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={handleAddMedia} style={styles.addBtn}>
            + 미디어 추가
          </button>
        </div>

        <div style={styles.section}>
          <h2>설정</h2>

          <div style={styles.checkboxField}>
            <input
              type="checkbox"
              name="allowGuestQuestions"
              checked={formData.allowGuestQuestions}
              onChange={handleChange}
              id="allowGuestQuestions"
            />
            <label htmlFor="allowGuestQuestions" style={styles.checkboxLabel}>
              게스트 질문 허용
            </label>
          </div>

          <div style={styles.checkboxField}>
            <input
              type="checkbox"
              name="allowGuestGuestbook"
              checked={formData.allowGuestGuestbook}
              onChange={handleChange}
              id="allowGuestGuestbook"
            />
            <label htmlFor="allowGuestGuestbook" style={styles.checkboxLabel}>
              게스트 방명록 허용
            </label>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.footer}>
          <button type="button" onClick={() => navigate('/my/booths')} style={styles.cancelBtn}>
            취소
          </button>
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading 
              ? (isEditMode ? '⏳ 저장 중...' : '⏳ 제출 중...')
              : (isEditMode ? '✅ 수정하기' : '📤 제출하기')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '40px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  backBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  form: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  section: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  field: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 500,
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  mediaItem: {
    marginBottom: '12px',
  },
  mediaRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  mediaSelect: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  mediaInput: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  removeBtn: {
    padding: '8px 12px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  addBtn: {
    padding: '10px 16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  checkboxField: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  checkboxLabel: {
    marginLeft: '8px',
    fontSize: '14px',
  },
  uploadRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  uploadBtn: {
    padding: '12px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    display: 'inline-block',
    textAlign: 'center',
    userSelect: 'none',
    transition: 'background-color 0.2s',
  },
  fileInput: {
    display: 'none',
  },
  previewContainer: {
    marginTop: '12px',
    textAlign: 'center',
  },
  preview: {
    maxWidth: '300px',
    maxHeight: '200px',
    borderRadius: '8px',
    border: '2px solid #ddd',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  previewText: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#666',
  },
  error: {
    color: '#dc3545',
    fontSize: '14px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  submitBtn: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
  },
  submitSection: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '2px dashed #007bff',
  },
  submitTitle: {
    marginTop: 0,
    marginBottom: '12px',
    fontSize: '16px',
    color: '#007bff',
  },
  hint: {
    fontSize: '13px',
    color: '#666',
    marginTop: '12px',
    marginBottom: 0,
    lineHeight: '1.6',
  },
};

