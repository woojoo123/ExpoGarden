import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { useStore } from '@/state/store';
import type { Booth } from '@/types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('SUBMITTED');
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    boothId: number | null;
    reason: string;
  }>({
    isOpen: false,
    boothId: null,
    reason: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      alert('관리자 권한이 필요합니다');
      navigate('/');
      return;
    }

    loadBooths();
  }, [user, selectedStatus]);

  const loadBooths = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getBooths({
        status: selectedStatus || undefined,
        page: 0,
        size: 100,
      });
      setBooths(response.data.content);
    } catch (error) {
      console.error('Failed to load booths:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (boothId: number) => {
    if (!confirm('이 부스를 승인하시겠습니까?')) return;

    try {
      await apiClient.approveBooth(boothId);
      alert('부스가 승인되었습니다!');
      loadBooths();
    } catch (error) {
      alert('승인 실패');
    }
  };

  const handleRejectClick = (boothId: number) => {
    setRejectModal({
      isOpen: true,
      boothId,
      reason: '',
    });
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal.boothId) return;
    if (!rejectModal.reason.trim()) {
      alert('반려 사유를 입력해주세요');
      return;
    }

    try {
      await apiClient.rejectBooth(rejectModal.boothId, rejectModal.reason);
      alert('부스가 반려되었습니다');
      setRejectModal({ isOpen: false, boothId: null, reason: '' });
      loadBooths();
    } catch (error) {
      alert('반려 실패');
    }
  };

  const handleArchive = async (boothId: number) => {
    if (!confirm('이 부스를 아카이브하시겠습니까?')) return;

    try {
      await apiClient.archiveBooth(boothId);
      alert('부스가 아카이브되었습니다');
      loadBooths();
    } catch (error) {
      alert('아카이브 실패');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: '#6c757d',
      SUBMITTED: '#ffc107',
      APPROVED: '#28a745',
      REJECTED: '#dc3545',
      ARCHIVED: '#6c757d',
    };
    return colors[status] || '#6c757d';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      DRAFT: '작성중',
      SUBMITTED: '제출됨',
      APPROVED: '승인됨',
      REJECTED: '반려됨',
      ARCHIVED: '아카이브',
    };
    return texts[status] || status;
  };

  if (loading) {
    return <div style={styles.loading}>로딩 중...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>관리자 대시보드</h1>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← 전시장으로
        </button>
      </div>

      <div style={styles.filterSection}>
        <label style={styles.filterLabel}>상태 필터:</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">전체</option>
          <option value="DRAFT">작성중</option>
          <option value="SUBMITTED">제출됨 (승인 대기)</option>
          <option value="APPROVED">승인됨</option>
          <option value="REJECTED">반려됨</option>
          <option value="ARCHIVED">아카이브</option>
        </select>
        <span style={styles.count}>총 {booths.length}개</span>
      </div>

      {booths.length === 0 ? (
        <div style={styles.empty}>
          <p>해당 상태의 부스가 없습니다.</p>
        </div>
      ) : (
        <div style={styles.table}>
          <table style={styles.tableElement}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>제목</th>
                <th style={styles.th}>카테고리</th>
                <th style={styles.th}>출품자</th>
                <th style={styles.th}>상태</th>
                <th style={styles.th}>생성일</th>
                <th style={styles.th}>작업</th>
              </tr>
            </thead>
            <tbody>
              {booths.map((booth) => (
                <tr key={booth.id} style={styles.tr}>
                  <td style={styles.td}>{booth.id}</td>
                  <td style={styles.td}>
                    <strong>{booth.title}</strong>
                    {booth.summary && (
                      <div style={styles.summary}>{booth.summary}</div>
                    )}
                  </td>
                  <td style={styles.td}>{booth.category || '-'}</td>
                  <td style={styles.td}>{booth.ownerNickname}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: getStatusColor(booth.status),
                      }}
                    >
                      {getStatusText(booth.status)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(booth.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      {booth.status === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleApprove(booth.id)}
                            style={styles.approveBtn}
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleRejectClick(booth.id)}
                            style={styles.rejectBtn}
                          >
                            반려
                          </button>
                        </>
                      )}
                      {booth.status === 'APPROVED' && (
                        <button
                          onClick={() => handleArchive(booth.id)}
                          style={styles.archiveBtn}
                        >
                          아카이브
                        </button>
                      )}
                      <button
                        onClick={() => window.open(`/?boothId=${booth.id}`, '_blank')}
                        style={styles.viewBtn}
                      >
                        보기
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 반려 모달 */}
      {rejectModal.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>부스 반려</h2>
            <p>반려 사유를 입력해주세요:</p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal({ ...rejectModal, reason: e.target.value })
              }
              style={styles.textarea}
              placeholder="출품자에게 전달될 반려 사유를 상세히 입력하세요"
              rows={5}
            />
            <div style={styles.modalFooter}>
              <button
                onClick={() =>
                  setRejectModal({ isOpen: false, boothId: null, reason: '' })
                }
                style={styles.modalCancelBtn}
              >
                취소
              </button>
              <button onClick={handleRejectSubmit} style={styles.modalSubmitBtn}>
                반려하기
              </button>
            </div>
          </div>
        </div>
      )}
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
  filterSection: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  filterLabel: {
    fontWeight: 500,
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  count: {
    marginLeft: 'auto',
    color: '#666',
    fontSize: '14px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  tableElement: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontWeight: 600,
    borderBottom: '2px solid #dee2e6',
  },
  tr: {
    borderBottom: '1px solid #dee2e6',
  },
  td: {
    padding: '16px',
    verticalAlign: 'top',
  },
  summary: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-block',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  approveBtn: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  rejectBtn: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  archiveBtn: {
    padding: '6px 12px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  viewBtn: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginTop: '12px',
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    justifyContent: 'flex-end',
  },
  modalCancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalSubmitBtn: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

