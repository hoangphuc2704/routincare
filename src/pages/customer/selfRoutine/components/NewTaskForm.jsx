import React from 'react';

export default function NewTaskForm({
  newTask,
  setNewTask,
  iconOptions,
  colorOptions,
  handleAddTask,
  adding,
}) {
  return (
    <div className="mt-4 p-3 rounded-xl bg-neutral-900 border border-white/5 space-y-3">
      <h4 className="font-semibold text-white">Thêm task mới</h4>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Task name"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={newTask.type}
            onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
            className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="Checkbox">Checkbox</option>
            <option value="Number">Number</option>
          </select>
          <select
            value={newTask.difficulty}
            onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })}
            className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        {newTask.type === 'Number' && (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="1"
              value={newTask.targetValue}
              onChange={(e) => setNewTask({ ...newTask, targetValue: e.target.value })}
              className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
            <input
              type="text"
              value={newTask.unitName}
              onChange={(e) => setNewTask({ ...newTask, unitName: e.target.value })}
              className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="Unit (ml, reps)"
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={newTask.iconName}
            onChange={(e) => setNewTask({ ...newTask, iconName: e.target.value })}
            className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          >
            {iconOptions.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
          <div className="flex flex-col gap-2 bg-neutral-800 border border-white/10 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              {colorOptions.map((color) => {
                const isActive = newTask.iconColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTask({ ...newTask, iconColor: color })}
                    className={`w-8 h-8 rounded-full border transition-all ${isActive ? 'border-lime-400 ring-2 ring-lime-400/50' : 'border-white/10'}`}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                );
              })}
            </div>
            <span className="text-[11px] text-zinc-500">
              Đang chọn: <span className="text-white font-semibold">{newTask.iconColor}</span>
            </span>
          </div>
        </div>
        <textarea
          placeholder="Notes (optional)"
          value={newTask.notes}
          onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
          className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          rows={2}
        />
        <textarea
          placeholder="Tips (optional)"
          value={newTask.tips}
          onChange={(e) => setNewTask({ ...newTask, tips: e.target.value })}
          className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          rows={2}
        />
        <input
          type="text"
          placeholder="Media URL (optional)"
          value={newTask.mediaUrl}
          onChange={(e) => setNewTask({ ...newTask, mediaUrl: e.target.value })}
          className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Estimated minutes"
            value={newTask.estimatedMinutes}
            onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: e.target.value })}
            className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          />
          <input
            type="number"
            min="0"
            placeholder="Rest after (seconds)"
            value={newTask.restAfterSeconds}
            onChange={(e) => setNewTask({ ...newTask, restAfterSeconds: e.target.value })}
            className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          />
        </div>
        <button
          onClick={handleAddTask}
          disabled={adding}
          className="w-full bg-lime-400 text-black font-bold py-2 rounded-lg active:scale-95 transition-all disabled:opacity-60"
        >
          {adding ? 'Đang thêm...' : 'Thêm task'}
        </button>
      </div>
    </div>
  );
}
