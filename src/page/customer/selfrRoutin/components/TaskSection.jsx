import React, { useState } from 'react';
import { Search, LayoutGrid, Rows3, Plus, X } from 'lucide-react';
import TaskCard from './TaskCard';
import NewTaskForm from './NewTaskForm';

export default function TaskSection({
  tasks,
  taskStats,
  taskQuery,
  setTaskQuery,
  taskViewMode,
  setTaskViewMode,
  taskFilterOptions,
  taskFilter,
  setTaskFilter,
  filteredTasks,
  resolveTaskId,
  resolveTaskStateKey,
  getLogByTask,
  normalizeTaskStatus,
  taskEditing,
  expandedTaskMap,
  iconOptions,
  colorOptions,
  prepareCategoryOptions,
  taskPrepareEditing,
  setTaskPrepareEditing,
  getTaskDraft,
  setTaskPrepareDrafts,
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
  newTask,
  setNewTask,
  handleAddTask,
  adding,
}) {
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

  return (
    <section className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Tasks</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{tasks.length} task(s)</span>
          <button
            onClick={() => setShowAddTaskForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-400 text-black text-xs font-bold hover:bg-lime-300 transition-colors"
          >
            {showAddTaskForm ? <X size={14} /> : <Plus size={14} />}
            {showAddTaskForm ? 'Đóng' : 'Thêm task'}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="p-2 rounded-xl bg-black/30 border border-white/10">
            <p className="text-[10px] text-zinc-500">Total</p>
            <p className="text-sm font-semibold text-white">{taskStats.total}</p>
          </div>
          <div className="p-2 rounded-xl bg-black/30 border border-white/10">
            <p className="text-[10px] text-zinc-500">InProgress</p>
            <p className="text-sm font-semibold text-[#F97316]">{taskStats.inProgress}</p>
          </div>
          <div className="p-2 rounded-xl bg-black/30 border border-white/10">
            <p className="text-[10px] text-zinc-500">Completed</p>
            <p className="text-sm font-semibold text-[#22C55E]">{taskStats.completed}</p>
          </div>
          <div className="p-2 rounded-xl bg-black/30 border border-white/10">
            <p className="text-[10px] text-zinc-500">Skipped</p>
            <p className="text-sm font-semibold text-[#EF4444]">{taskStats.skipped}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={taskQuery}
              onChange={(e) => setTaskQuery(e.target.value)}
              placeholder="Tìm task..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-white"
            />
          </div>
          <div className="inline-flex rounded-xl bg-black/30 border border-white/10 p-1">
            <button
              onClick={() => setTaskViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 ${taskViewMode === 'grid' ? 'bg-white text-black font-semibold' : 'text-zinc-300'}`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setTaskViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 ${taskViewMode === 'list' ? 'bg-white text-black font-semibold' : 'text-zinc-300'}`}
            >
              <Rows3 size={14} /> List
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {taskFilterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTaskFilter(opt.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs border ${taskFilter === opt.value ? 'bg-white text-black border-white font-semibold' : 'bg-black/30 text-zinc-300 border-white/10'}`}
            >
              {opt.label} ({opt.count})
            </button>
          ))}
        </div>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-zinc-500">Chưa có task nào trong routine này.</p>
      ) : filteredTasks.length === 0 ? (
        <p className="text-sm text-zinc-500">Không có task phù hợp với bộ lọc hiện tại.</p>
      ) : (
        <div
          className={
            taskViewMode === 'grid'
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3'
              : 'grid grid-cols-1 gap-3'
          }
        >
          {filteredTasks.map((task, taskIndex) => {
            const taskId = resolveTaskId(task);
            const taskStateKey = resolveTaskStateKey(task, taskIndex);
            const taskLog = getLogByTask(taskId || task.id || task.taskId);
            const normalizedStatus = normalizeTaskStatus(taskLog?.status);

            return (
              <TaskCard
                key={taskStateKey}
                task={task}
                taskIndex={taskIndex}
                taskId={taskId}
                taskStateKey={taskStateKey}
                taskLog={taskLog}
                normalizedStatus={normalizedStatus}
                editingTask={taskEditing[taskId]}
                isExpanded={!!expandedTaskMap[taskStateKey]}
                iconOptions={iconOptions}
                colorOptions={colorOptions}
                prepareCategoryOptions={prepareCategoryOptions}
                taskPrepareEditing={taskPrepareEditing}
                setTaskPrepareEditing={setTaskPrepareEditing}
                getTaskDraft={getTaskDraft}
                setTaskPrepareDrafts={setTaskPrepareDrafts}
                taskEditing={taskEditing}
                setTaskEditing={setTaskEditing}
                setPreviewTask={setPreviewTask}
                toggleTaskExpanded={toggleTaskExpanded}
                createTaskEditDraft={createTaskEditDraft}
                handleDeleteTask={handleDeleteTask}
                deletingTaskId={deletingTaskId}
                handleUpdateTask={handleUpdateTask}
                savingTaskId={savingTaskId}
                cancelTaskEdit={cancelTaskEdit}
                handleTaskPrepareEdit={handleTaskPrepareEdit}
                handleTaskPrepareDelete={handleTaskPrepareDelete}
                handleTaskPrepareAdd={handleTaskPrepareAdd}
                resolveTaskId={resolveTaskId}
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
            );
          })}
        </div>
      )}

      {showAddTaskForm && (
        <NewTaskForm
          newTask={newTask}
          setNewTask={setNewTask}
          iconOptions={iconOptions}
          colorOptions={colorOptions}
          handleAddTask={handleAddTask}
          adding={adding}
        />
      )}
    </section>
  );
}
