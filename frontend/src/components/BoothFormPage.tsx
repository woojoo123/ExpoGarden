import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import type { Exhibition, Hall, Booth } from '@/types';

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
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    exhibitionId: '',
    hallId: '',
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
  const [submitAfterCreate, setSubmitAfterCreate] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    loadExhibitions();

    if (isEditMode) {
      loadBooth();
    }
  }, [user, id]);

  useEffect(() => {
    if (formData.exhibitionId) {
      loadHalls(Number(formData.exhibitionId));
    }
  }, [formData.exhibitionId]);

  const loadExhibitions = async () => {
    try {
      const response = await apiClient.getExhibitions('PUBLISHED');
      setExhibitions(response.data.content);
      if (response.data.content.length > 0 && !isEditMode) {
        setFormData((prev) => ({
          ...prev,
          exhibitionId: response.data.content[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error('Failed to load exhibitions:', error);
    }
  };

  const loadHalls = async (exhibitionId: number) => {
    try {
      const response = await apiClient.getHalls(exhibitionId);
      setHalls(response.data);
      if (response.data.length > 0 && !isEditMode) {
        setFormData((prev) => ({
          ...prev,
          hallId: response.data[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error('Failed to load halls:', error);
    }
  };

  const loadBooth = async () => {
    if (!id) return;

    try {
      const response = await apiClient.getBooth(Number(id));
      const booth = response.data;

      setFormData({
        exhibitionId: booth.exhibitionId.toString(),
        hallId: booth.hallId.toString(),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        exhibitionId: Number(formData.exhibitionId),
        hallId: Number(formData.hallId),
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
        alert('부스가 수정되었습니다!');
        navigate('/my/booths');
      } else {
        const response = await apiClient.createBooth(payload);
        const createdBoothId = response.data.id;
        alert('부스가 생성되었습니다!');
        
        // 등록 후 제출 옵션이 체크되어 있으면 자동으로 제출
        if (submitAfterCreate) {
          try {
            await apiClient.submitBooth(createdBoothId);
            alert('부스가 승인 요청(제출)되었습니다!');
          } catch (submitError) {
            console.error('제출 실패:', submitError);
            alert('부스는 생성되었지만 제출에 실패했습니다. 목록에서 제출해주세요.');
          }
        }
        
        navigate('/my/booths');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '저장 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>{isEditMode ? '부스 수정' : '새 부스 등록'}</h1>
        <button onClick={() => navigate('/my/booths')} style={styles.backBtn}>
          ← 목록으로
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.section}>
          <h2>기본 정보</h2>

          <div style={styles.field}>
            <label style={styles.label}>전시 선택</label>
            <select
              name="exhibitionId"
              value={formData.exhibitionId}
              onChange={handleChange}
              style={styles.select}
              required
              disabled={isEditMode}
            >
              <option value="">전시를 선택하세요</option>
              {exhibitions.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>홀 선택</label>
            <select
              name="hallId"
              value={formData.hallId}
              onChange={handleChange}
              style={styles.select}
              required
              disabled={isEditMode}
            >
              <option value="">홀을 선택하세요</option>
              {halls.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.name}
                </option>
              ))}
            </select>
          </div>

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
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={styles.input}
              placeholder="예: AI, IoT, 메타버스"
            />
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

        {!isEditMode && (
          <div style={styles.submitSection}>
            <h3 style={styles.submitTitle}>제출 옵션</h3>
            <div style={styles.checkboxField}>
              <input
                type="checkbox"
                id="submitAfterCreate"
                checked={submitAfterCreate}
                onChange={(e) => setSubmitAfterCreate(e.target.checked)}
              />
              <label htmlFor="submitAfterCreate" style={styles.checkboxLabel}>
                <strong>등록 후 바로 제출하기</strong> (승인 요청 상태로 변경)
              </label>
            </div>
            <p style={styles.hint}>
              💡 체크하면 부스가 등록된 후 자동으로 관리자에게 승인 요청이 전송됩니다.<br />
              체크하지 않으면 임시저장(DRAFT) 상태로 저장되며, 나중에 '내 부스 관리'에서 제출할 수 있습니다.
            </p>
          </div>
        )}

        <div style={styles.footer}>
          <button type="button" onClick={() => navigate('/my/booths')} style={styles.cancelBtn}>
            취소
          </button>
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? '⏳ 저장 중...' : isEditMode ? '✅ 수정하기' : (submitAfterCreate ? '📤 등록 및 제출하기' : '💾 등록하기')}
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
    backgroundColor: '#007bff',
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

