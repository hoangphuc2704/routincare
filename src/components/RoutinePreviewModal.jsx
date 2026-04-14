import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Spin } from 'antd';

function formatDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN');
}

function formatVisibility(value) {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === '0' || normalized === 'private') return 'Riêng tư';
  if (normalized === '1' || normalized === 'public') return 'Công khai';
  if (normalized === '2' || normalized === 'subscribersonly') return 'Chỉ người đăng ký';
  return value ?? 'Không rõ';
}

function formatRepeatType(value) {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === '0' || normalized === 'daily') return 'Hằng ngày';
  if (normalized === '1' || normalized === 'weekly') return 'Hằng tuần';
  return value ?? 'Không rõ';
}

export default function RoutinePreviewModal({
  open,
  loading,
  submitting,
  routine,
  canCopy,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) {
        onCancel?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, submitting, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-3 md:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onCancel?.();
        }
      }}
    >
      <div
        className="w-full max-w-[760px] border border-white/10 rounded-[20px] text-white shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        style={{
          background:
            'radial-gradient(circle at 12% 10%, rgba(38, 51, 40, 0.96) 0%, rgba(10, 10, 10, 0.98) 48%, rgba(0, 0, 0, 0.99) 100%)',
        }}
      >
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <p className="text-base font-bold text-white">Xem trước routine</p>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
      {loading ? (
        <div className="py-8 text-center">
          <Spin />
          <p className="mt-3 text-sm text-white/65">Đang tải chi tiết routine...</p>
        </div>
      ) : routine ? (
        <div className="space-y-4">
          {routine.image ? (
            <div className="h-44 w-full overflow-hidden rounded-2xl border border-white/15">
              <img src={routine.image} alt={routine.title} className="h-full w-full object-cover" />
            </div>
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-lg font-bold text-white">{routine.title}</p>
            {routine.description ? (
              <p className="text-sm text-white/75 mt-1">{routine.description}</p>
            ) : (
              <p className="text-sm text-white/50 mt-1">Routine chưa có mô tả.</p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-white/60">Số task</p>
              <p className="text-sm font-semibold text-white">{routine.taskCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-white/60">Số vật dụng</p>
              <p className="text-sm font-semibold text-white">{routine.prepareCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-white/60">Lặp lại</p>
              <p className="text-sm font-semibold text-white">{formatRepeatType(routine.repeatType)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-white/60">Quyền xem</p>
              <p className="text-sm font-semibold text-white">{formatVisibility(routine.visibility)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-white/60">Nhắc lúc</p>
              <p className="text-sm font-semibold text-white">{routine.remindTime || 'Không có'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-white/60">Danh mục</p>
              <p className="text-sm font-semibold text-white">{routine.categoryName || 'Chưa phân loại'}</p>
            </div>
          </div>

          {(routine.repeatDays || routine.createdAt || routine.updatedAt) && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/70 space-y-1">
              {routine.repeatDays && <p>Lặp theo ngày trong tuần: {routine.repeatDays}</p>}
              {routine.createdAt && <p>Tạo lúc: {formatDateTime(routine.createdAt)}</p>}
              {routine.updatedAt && <p>Cập nhật lúc: {formatDateTime(routine.updatedAt)}</p>}
            </div>
          )}

          {routine.tasks.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#d2fb05]">Danh sách task</p>
              <div className="mt-2 space-y-2">
                {routine.tasks.map((task) => (
                  <div key={task.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 space-y-2">
                    <p className="text-sm font-semibold text-white">{task.title}</p>

                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {task.type && <span className="rounded-full bg-black/35 px-2 py-1 text-white/75">Loại: {task.type}</span>}
                      {task.targetValue !== null && task.targetValue !== undefined && (
                        <span className="rounded-full bg-black/35 px-2 py-1 text-white/75">
                          Mục tiêu: {task.targetValue} {task.unitName || ''}
                        </span>
                      )}
                      {task.difficulty && (
                        <span className="rounded-full bg-black/35 px-2 py-1 text-white/75">Độ khó: {task.difficulty}</span>
                      )}
                      {task.estimatedMinutes !== null && task.estimatedMinutes !== undefined && (
                        <span className="rounded-full bg-black/35 px-2 py-1 text-white/75">
                          Ước tính: {task.estimatedMinutes} phút
                        </span>
                      )}
                      {task.restAfterSeconds !== null && task.restAfterSeconds !== undefined && (
                        <span className="rounded-full bg-black/35 px-2 py-1 text-white/75">
                          Nghỉ: {task.restAfterSeconds}s
                        </span>
                      )}
                    </div>

                    {task.note && <p className="text-xs text-white/70">Mô tả: {task.note}</p>}
                    {task.tips && <p className="text-xs text-white/70">Mẹo: {task.tips}</p>}

                    {task.prepareItems.length > 0 && (
                      <div className="rounded-lg border border-white/10 bg-black/25 p-2">
                        <p className="text-xs font-semibold text-white/80 mb-1">Vật dụng cho task</p>
                        <div className="space-y-1.5">
                          {task.prepareItems.map((item) => (
                            <div key={item.id} className="text-xs text-white/70">
                              <p>
                                • {item.title}
                                {item.isRequired === true ? ' (Bắt buộc)' : ''}
                              </p>
                              {item.description && <p className="text-white/55">{item.description}</p>}
                              {item.purchaseUrl && (
                                <a
                                  href={item.purchaseUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#d2fb05] underline"
                                >
                                  Link mua
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {routine.prepareItems.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#d2fb05]">Vật dụng cần chuẩn bị</p>
              <div className="mt-2 space-y-2">
                {routine.prepareItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-sm text-white">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        <p className="text-sm text-white/60">Không có dữ liệu chi tiết routine.</p>
      )}
        </div>

        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!canCopy || submitting}
            className="rounded-lg border border-[#d2fb05] bg-[#d2fb05] px-4 py-2 text-sm font-semibold text-black hover:border-[#e1ff56] hover:bg-[#e1ff56] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Đang copy...' : 'Xác nhận copy'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
