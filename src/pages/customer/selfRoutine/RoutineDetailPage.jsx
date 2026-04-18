import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Clock3 } from 'lucide-react';
import BottomNav from '../../../components/BottomNav';
import TaskPreviewModal from './components/TaskPreviewModal';
import TaskSection from './components/TaskSection';
import useRoutineDetailController from './hooks/useRoutineDetailController';
import {
  normalizeTaskStatus,
  resolveTaskId,
  resolveTaskStateKey,
  resolveEvidenceUrl,
  isLikelyImageEvidence,
  statusLabel,
  statusColor,
} from './utils/routineDetailHelpers';

const RoutineDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    routine,
    loading,
    adding,
    savingUpdate,
    deleting,
    iconOptions,
    colorOptions,
    prepareCategoryOptions,
    logLoading,
    logInputs,
    setLogInputs,
    evidenceInputs,
    setEvidenceInputs,
    editForm,
    setEditForm,
    newTask,
    setNewTask,
    setTaskPrepareDrafts,
    taskPrepareEditing,
    setTaskPrepareEditing,
    evidenceFiles,
    setEvidenceFiles,
    taskEditing,
    setTaskEditing,
    savingTaskId,
    deletingTaskId,
    previewTask,
    setPreviewTask,
    taskQuery,
    setTaskQuery,
    taskFilter,
    setTaskFilter,
    taskViewMode,
    setTaskViewMode,
    expandedTaskMap,
    showEditRoutine,
    setShowEditRoutine,
    visibilityLabel,
    getLogByTask,
    tasks,
    completedCount,
    taskStats,
    taskFilterOptions,
    filteredTasks,
    toggleTaskExpanded,
    createTaskEditDraft,
    cancelTaskEdit,
    handleUpdateRoutine,
    handleDeleteRoutine,
    getTaskDraft,
    handleTaskPrepareAdd,
    handleTaskPrepareEdit,
    handleTaskPrepareDelete,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    handleCheckin,
    handleLogQuantity,
    handleSkip,
    handleEvidence,
    handleUndo,
  } = useRoutineDetailController({ routineId: id, navigate });

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-36 md:pb-24 md:pl-[96px]">
      <header className="p-4 flex items-center gap-3 sticky top-0 bg-black/80 backdrop-blur-md z-30">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">
            Routine Detail
          </p>
          <h1 className="text-xl font-bold text-white">{routine?.title || 'Loading...'}</h1>
          {routine && (
            <div className="mt-1 inline-flex items-center gap-2 text-xs text-zinc-400">
              <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                Hôm nay: {completedCount}/{tasks.length} task hoàn thành
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-lime-400"></div>
          </div>
        ) : !routine ? (
          <div className="text-center py-16 text-zinc-500">Không tìm thấy routine.</div>
        ) : (
          <>
            <section className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold">{routine.title}</h2>
                {editForm && (
                  <button
                    onClick={() => setShowEditRoutine((prev) => !prev)}
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-zinc-200 hover:bg-white/10 transition-colors"
                  >
                    {showEditRoutine ? 'Ẩn chỉnh sửa' : 'Chỉnh sửa routine'}
                  </button>
                )}
              </div>
              {routine.description && (
                <p className="text-sm text-zinc-400 leading-relaxed">{routine.description}</p>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5">
                  <Calendar size={14} />
                  {routine.repeatType === 1 ? `Weekly: ${routine.repeatDays || '—'}` : 'Daily'}
                </span>
                {routine.remindTime && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5">
                    <Clock3 size={14} />
                    {routine.remindTime}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5">
                  <Eye size={14} />
                  {visibilityLabel(routine.visibility)}
                </span>
                {routine.category?.name && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5">
                    {routine.category.name}
                  </span>
                )}
              </div>

              {editForm && showEditRoutine && (
                <div className="mt-2 p-3 rounded-xl bg-[#101010] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Chỉnh sửa routine</h3>
                    <button
                      onClick={handleDeleteRoutine}
                      disabled={deleting}
                      className="text-xs text-red-400 border border-red-500/40 px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-60"
                    >
                      {deleting ? 'Đang xóa...' : 'Xóa routine'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      placeholder="Tiêu đề"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      rows={2}
                      placeholder="Mô tả"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editForm.repeatType}
                        onChange={(e) =>
                          setEditForm({ ...editForm, repeatType: parseInt(e.target.value, 10) })
                        }
                        className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value={0}>Daily</option>
                        <option value={1}>Weekly</option>
                      </select>
                      <select
                        value={editForm.visibility}
                        onChange={(e) =>
                          setEditForm({ ...editForm, visibility: parseInt(e.target.value, 10) })
                        }
                        className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value={0}>Private</option>
                        <option value={1}>Public</option>
                        <option value={2}>SubscribersOnly</option>
                      </select>
                    </div>
                    {editForm.repeatType === 1 && (
                      <input
                        type="text"
                        value={editForm.repeatDays}
                        onChange={(e) => setEditForm({ ...editForm, repeatDays: e.target.value })}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Ngày lặp (vd: 2,4,6)"
                      />
                    )}
                    <input
                      type="time"
                      value={editForm.remindTime || ''}
                      onChange={(e) => setEditForm({ ...editForm, remindTime: e.target.value })}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />

                    <button
                      onClick={handleUpdateRoutine}
                      disabled={savingUpdate}
                      className="w-full bg-white text-black font-bold py-2 rounded-lg active:scale-95 transition-all disabled:opacity-60"
                    >
                      {savingUpdate ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </div>
              )}
            </section>

            <TaskSection
              tasks={tasks}
              taskStats={taskStats}
              taskQuery={taskQuery}
              setTaskQuery={setTaskQuery}
              taskViewMode={taskViewMode}
              setTaskViewMode={setTaskViewMode}
              taskFilterOptions={taskFilterOptions}
              taskFilter={taskFilter}
              setTaskFilter={setTaskFilter}
              filteredTasks={filteredTasks}
              resolveTaskId={resolveTaskId}
              resolveTaskStateKey={resolveTaskStateKey}
              getLogByTask={getLogByTask}
              normalizeTaskStatus={normalizeTaskStatus}
              taskEditing={taskEditing}
              expandedTaskMap={expandedTaskMap}
              iconOptions={iconOptions}
              colorOptions={colorOptions}
              prepareCategoryOptions={prepareCategoryOptions}
              taskPrepareEditing={taskPrepareEditing}
              setTaskPrepareEditing={setTaskPrepareEditing}
              getTaskDraft={getTaskDraft}
              setTaskPrepareDrafts={setTaskPrepareDrafts}
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
              newTask={newTask}
              setNewTask={setNewTask}
              handleAddTask={handleAddTask}
              adding={adding}
            />

          </>
        )}
      </main>

      {previewTask && (
        <TaskPreviewModal
          previewTask={previewTask}
          taskLog={getLogByTask(resolveTaskId(previewTask) || previewTask?.id || previewTask?.taskId)}
          onClose={() => setPreviewTask(null)}
          normalizeTaskStatus={normalizeTaskStatus}
          statusLabel={statusLabel}
          statusColor={statusColor}
          resolveEvidenceUrl={resolveEvidenceUrl}
          isLikelyImageEvidence={isLikelyImageEvidence}
        />
      )}

      <BottomNav activeItem="target" />
    </div>
  );
};

export default RoutineDetailPage;
