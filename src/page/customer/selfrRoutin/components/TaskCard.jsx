import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TaskActions from './TaskActions';
import PrepareItemEditor from './PrepareItemEditor';

export default function TaskCard({
  task,
  taskIndex,
  taskId,
  taskStateKey,
  taskLog,
  normalizedStatus,
  editingTask,
  isExpanded,
  iconOptions,
  colorOptions,
  prepareCategoryOptions,
  taskPrepareEditing,
  setTaskPrepareEditing,
  getTaskDraft,
  setTaskPrepareDrafts,
  taskEditing,
  setTaskEditing,
  setPreviewTask,
  toggleTaskExpanded,
  createTaskEditDraft,
  handleDeleteTask,
  deletingTaskId,
  handleUpdateTask,
  savingTaskId,
  cancelTaskEdit,
  handleTaskPrepareEdit,
  handleTaskPrepareDelete,
  handleTaskPrepareAdd,
  resolveTaskId,
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
    <div className="p-3 rounded-xl bg-neutral-900 border border-white/5 h-fit">
      <div className="mb-2 text-[11px] uppercase tracking-[0.15em] text-zinc-500 font-semibold">
        Task {taskIndex + 1}
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-white">{task.title || task.name}</h4>
          {typeof task.targetValue !== 'undefined' && (
            <span className="text-xs text-zinc-500">
              Target: {task.targetValue} {task.unitName || ''}
            </span>
          )}
          {task.description && <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{task.description}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-[11px] px-2 py-1 rounded-full border ${statusColor(normalizedStatus)}`}>
            {statusLabel(normalizedStatus)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewTask(task)}
              className="text-[11px] px-2 py-1 rounded-lg border border-lime-400/40 text-lime-300"
            >
              Xem popup
            </button>
            <button
              onClick={() => toggleTaskExpanded(taskStateKey)}
              className="text-[11px] px-2 py-1 rounded-lg border border-white/10 text-zinc-200 inline-flex items-center gap-1"
            >
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {isExpanded ? 'Thu gọn' : 'Mở rộng'}
            </button>
            <button
              onClick={() => createTaskEditDraft(task)}
              className="text-[11px] px-2 py-1 rounded-lg border border-white/10 text-white"
            >
              Sửa task
            </button>
            <button
              onClick={() => handleDeleteTask(taskId)}
              disabled={deletingTaskId === taskId}
              className="text-[11px] px-2 py-1 rounded-lg border border-red-500/40 text-red-400 disabled:opacity-60"
            >
              {deletingTaskId === taskId ? 'Đang xóa...' : 'Xóa task'}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && editingTask && (
        <div className="mt-3 p-3 rounded-xl bg-neutral-800 border border-white/10 space-y-2">
          <input
            type="text"
            value={editingTask.title}
            onChange={(e) =>
              setTaskEditing((prev) => ({
                ...prev,
                [taskId]: { ...editingTask, title: e.target.value },
              }))
            }
            className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            placeholder="Tên task"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={editingTask.unitType}
              onChange={(e) =>
                setTaskEditing((prev) => ({
                  ...prev,
                  [taskId]: { ...editingTask, unitType: e.target.value },
                }))
              }
              className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="Checkbox">Checkbox</option>
              <option value="Number">Number</option>
            </select>
            <select
              value={editingTask.iconName}
              onChange={(e) =>
                setTaskEditing((prev) => ({
                  ...prev,
                  [taskId]: { ...editingTask, iconName: e.target.value },
                }))
              }
              className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            >
              {iconOptions.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </div>
          {editingTask.unitType === 'Number' && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="1"
                value={editingTask.targetValue}
                onChange={(e) =>
                  setTaskEditing((prev) => ({
                    ...prev,
                    [taskId]: { ...editingTask, targetValue: e.target.value },
                  }))
                }
                className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Target"
              />
              <input
                type="text"
                value={editingTask.unitName}
                onChange={(e) =>
                  setTaskEditing((prev) => ({
                    ...prev,
                    [taskId]: { ...editingTask, unitName: e.target.value },
                  }))
                }
                className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Unit"
              />
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {colorOptions.map((color) => {
              const active = editingTask.iconColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setTaskEditing((prev) => ({
                      ...prev,
                      [taskId]: { ...editingTask, iconColor: color },
                    }))
                  }
                  className={`h-8 rounded-lg border ${active ? 'border-lime-400 ring-2 ring-lime-400/50' : 'border-white/10'}`}
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateTask(taskId)}
              disabled={savingTaskId === taskId}
              className="flex-1 bg-lime-400 text-black font-bold py-2 rounded-lg disabled:opacity-60"
            >
              {savingTaskId === taskId ? 'Đang lưu...' : 'Lưu task'}
            </button>
            <button
              onClick={() => cancelTaskEdit(taskId)}
              className="px-3 py-2 rounded-lg border border-white/10 text-white text-sm"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {isExpanded && (
        <TaskActions
          taskId={taskId}
          taskStateKey={taskStateKey}
          taskLog={taskLog}
          normalizedStatus={normalizedStatus}
          logLoading={logLoading}
          logInputs={logInputs}
          setLogInputs={setLogInputs}
          evidenceInputs={evidenceInputs}
          setEvidenceInputs={setEvidenceInputs}
          evidenceFiles={evidenceFiles}
          setEvidenceFiles={setEvidenceFiles}
          handleCheckin={handleCheckin}
          handleSkip={handleSkip}
          handleUndo={handleUndo}
          handleLogQuantity={handleLogQuantity}
          handleEvidence={handleEvidence}
          resolveEvidenceUrl={resolveEvidenceUrl}
          isLikelyImageEvidence={isLikelyImageEvidence}
          statusColor={statusColor}
          statusLabel={statusLabel}
        />
      )}

      {isExpanded && (
        <PrepareItemEditor
          task={task}
          taskStateKey={taskStateKey}
          taskPrepareEditing={taskPrepareEditing}
          setTaskPrepareEditing={setTaskPrepareEditing}
          prepareCategoryOptions={prepareCategoryOptions}
          iconOptions={iconOptions}
          getTaskDraft={getTaskDraft}
          setTaskPrepareDrafts={setTaskPrepareDrafts}
          handleTaskPrepareEdit={handleTaskPrepareEdit}
          handleTaskPrepareDelete={handleTaskPrepareDelete}
          handleTaskPrepareAdd={handleTaskPrepareAdd}
          resolveTaskId={resolveTaskId}
        />
      )}
    </div>
  );
}
