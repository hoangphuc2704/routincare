import React from 'react';

export default function TaskPreviewModal({
  previewTask,
  taskLog,
  onClose,
  normalizeTaskStatus,
  statusLabel,
  statusColor,
  resolveEvidenceUrl,
  isLikelyImageEvidence,
}) {
  if (!previewTask) return null;

  const normalizedStatus = normalizeTaskStatus(taskLog?.status);
  const evidenceUrl = resolveEvidenceUrl(taskLog);

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-[#111] border border-white/10 rounded-2xl p-4 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">Task Detail</p>
            <h3 className="text-xl font-bold text-white mt-1">
              {previewTask?.title || previewTask?.name || 'Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-white/15 text-sm text-zinc-300 hover:text-white"
          >
            Đóng
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-xl bg-neutral-900 border border-white/10">
            <p className="text-zinc-500 text-xs">Trạng thái</p>
            <span
              className={`mt-1 inline-flex text-[11px] px-2 py-1 rounded-full border ${statusColor(normalizedStatus)}`}
            >
              {statusLabel(normalizedStatus)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-900 border border-white/10">
            <p className="text-zinc-500 text-xs">Mục tiêu</p>
            <p className="mt-1 text-white font-semibold">
              {previewTask?.targetValue ?? '-'} {previewTask?.unitName || ''}
            </p>
          </div>
        </div>

        {previewTask?.description && (
          <div className="mt-3 p-3 rounded-xl bg-neutral-900 border border-white/10">
            <p className="text-zinc-500 text-xs">Mô tả</p>
            <p className="mt-1 text-sm text-zinc-200 whitespace-pre-wrap">{previewTask.description}</p>
          </div>
        )}

        {typeof taskLog?.currentValue !== 'undefined' && (
          <div className="mt-3 p-3 rounded-xl bg-neutral-900 border border-white/10">
            <p className="text-zinc-500 text-xs">Giá trị hiện tại</p>
            <p className="mt-1 text-sm text-zinc-200">{taskLog.currentValue}</p>
          </div>
        )}

        {evidenceUrl && (
          <div className="mt-3 p-3 rounded-xl bg-neutral-900 border border-white/10 space-y-2">
            <p className="text-zinc-500 text-xs">Minh chứng</p>
            {isLikelyImageEvidence(evidenceUrl) ? (
              <img
                src={evidenceUrl}
                alt="Task evidence"
                className="w-full max-h-[360px] object-contain rounded-lg border border-white/10 bg-black"
              />
            ) : (
              <a
                href={evidenceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-lime-400 hover:underline break-all"
              >
                {evidenceUrl}
              </a>
            )}
          </div>
        )}

        
      </div>
    </div>
  );
}
