import React from 'react';

export default function TaskActions({
  taskId,
  taskStateKey,
  taskLog,
  normalizedStatus,
  logLoading,
  logInputs,
  setLogInputs,
  evidenceInputs,
  setEvidenceInputs,
  evidenceFiles,
  setEvidenceFiles,
  handleCheckin,
  handleSkip,
  handleUndo,
  handleLogQuantity,
  handleEvidence,
  resolveEvidenceUrl,
  isLikelyImageEvidence,
  statusColor,
  statusLabel,
}) {
  return (
    <div className="mt-3 p-3 rounded-xl bg-neutral-800 border border-white/10 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">Check-in / Log</span>
        {logLoading ? (
          <span className="text-[11px] text-zinc-500">Đang tải...</span>
        ) : (
          <span
            className={`text-[11px] px-2 py-1 rounded-full border ${statusColor(normalizedStatus)}`}
          >
            {statusLabel(normalizedStatus)}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCheckin(taskId, normalizedStatus)}
          disabled={normalizedStatus === 1}
          className="px-3 py-2 rounded-lg bg-[#22C55E] text-black text-sm font-bold active:scale-95 disabled:opacity-60"
        >
          Check-in
        </button>
        <button
          onClick={() => handleSkip(taskLog?.id)}
          className="px-3 py-2 rounded-lg border border-white/10 text-white text-sm active:scale-95"
        >
          Skip
        </button>
        <button
          onClick={() => handleUndo(taskLog?.id)}
          className="px-3 py-2 rounded-lg border border-[#EF4444]/40 text-[#EF4444] text-sm active:scale-95"
        >
          Hủy log
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 items-center">
        <input
          type="number"
          min="0"
          value={logInputs[taskStateKey] || ''}
          onChange={(e) =>
            setLogInputs((prev) => ({
              ...prev,
              [taskStateKey]: e.target.value,
            }))
          }
          className="col-span-2 bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          placeholder="Giá trị (ml, reps...)"
        />
        <button
          onClick={() => handleLogQuantity(taskId)}
          className="w-full bg-white text-black font-bold py-2 rounded-lg active:scale-95 text-sm"
        >
          Ghi log
        </button>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 items-center">
          {/* <input
            type="text"
            value={evidenceInputs[taskStateKey] || ''}
            onChange={(e) =>
              setEvidenceInputs((prev) => ({
                ...prev,
                [taskStateKey]: e.target.value,
              }))
            }
            className="col-span-2 bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            placeholder="Evidence URL"
          /> */}
          {/* <button
            onClick={() => handleEvidence(taskLog?.id, taskId)}
            className="w-full bg-zinc-200 text-black font-bold py-2 rounded-lg active:scale-95 text-sm"
          >
            Lưu link / ảnh
          </button> */}
        </div>
        {/* <div className="grid grid-cols-3 gap-2 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setEvidenceFiles((prev) => ({
                ...prev,
                [taskStateKey]: file,
              }));
            }}
            className="col-span-2 text-xs text-white"
          />
          <span className="text-[11px] text-zinc-500">
            {evidenceFiles[taskStateKey]?.name || 'Chọn ảnh'}
          </span>
        </div> */}
      </div>

      {taskLog?.currentValue !== undefined && (
        <p className="text-[11px] text-zinc-500">Giá trị hiện tại: {taskLog?.currentValue}</p>
      )}
      {resolveEvidenceUrl(taskLog) && (
        <div className="p-2 rounded-lg bg-neutral-900 border border-white/10 space-y-2">
          <p className="text-[11px] text-zinc-500">Minh chứng đã lưu</p>
          {isLikelyImageEvidence(resolveEvidenceUrl(taskLog)) ? (
            <img
              src={resolveEvidenceUrl(taskLog)}
              alt="Evidence"
              className="w-full max-h-52 object-cover rounded-lg border border-white/10"
            />
          ) : (
            <a
              href={resolveEvidenceUrl(taskLog)}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-lime-400 hover:underline break-all"
            >
              {resolveEvidenceUrl(taskLog)}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
