import React from 'react';

export default function PrepareItemEditor({
  task,
  taskStateKey,
  taskPrepareEditing,
  setTaskPrepareEditing,
  prepareCategoryOptions,
  iconOptions,
  getTaskDraft,
  setTaskPrepareDrafts,
  handleTaskPrepareEdit,
  handleTaskPrepareDelete,
  handleTaskPrepareAdd,
  resolveTaskId,
}) {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">Prepare items</span>
        <span className="text-[11px] text-zinc-500">{task.prepareItems?.length || 0} item(s)</span>
      </div>
      {task.prepareItems && task.prepareItems.length > 0 ? (
        <div className="space-y-2">
          {task.prepareItems.map((p) => {
            const editing = taskPrepareEditing[p.id];
            return (
              <div key={p.id} className="p-2 rounded-lg bg-neutral-800 border border-white/10">
                {editing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editing.name}
                      onChange={(e) =>
                        setTaskPrepareEditing((prev) => ({
                          ...prev,
                          [p.id]: { ...editing, name: e.target.value },
                        }))
                      }
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <textarea
                      value={editing.description}
                      onChange={(e) =>
                        setTaskPrepareEditing((prev) => ({
                          ...prev,
                          [p.id]: { ...editing, description: e.target.value },
                        }))
                      }
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      rows={2}
                      placeholder="Mô tả"
                    />
                    <input
                      type="text"
                      value={editing.purchaseUrl}
                      onChange={(e) =>
                        setTaskPrepareEditing((prev) => ({
                          ...prev,
                          [p.id]: { ...editing, purchaseUrl: e.target.value },
                        }))
                      }
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      placeholder="Link mua"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editing.category}
                        onChange={(e) =>
                          setTaskPrepareEditing((prev) => ({
                            ...prev,
                            [p.id]: { ...editing, category: e.target.value },
                          }))
                        }
                        className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        {prepareCategoryOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editing.iconName}
                        onChange={(e) =>
                          setTaskPrepareEditing((prev) => ({
                            ...prev,
                            [p.id]: { ...editing, iconName: e.target.value },
                          }))
                        }
                        className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        {[...iconOptions, 'package', 'box', 'shopping-bag'].map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={!!editing.isRequired}
                        onChange={(e) =>
                          setTaskPrepareEditing((prev) => ({
                            ...prev,
                            [p.id]: { ...editing, isRequired: e.target.checked },
                          }))
                        }
                        className="accent-lime-400"
                      />
                      Bắt buộc
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTaskPrepareEdit(resolveTaskId(task), p.id)}
                        className="flex-1 bg-lime-400 text-black font-bold py-2 rounded-lg active:scale-95 transition-all"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() =>
                          setTaskPrepareEditing((prev) => {
                            const next = { ...prev };
                            delete next[p.id];
                            return next;
                          })
                        }
                        className="px-3 py-2 rounded-lg border border-white/10 text-white text-sm"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm text-white">{p.name}</p>
                      <p className="text-xs text-zinc-500">{p.category}</p>
                      {p.description && <p className="text-xs text-zinc-500">{p.description}</p>}
                      {p.purchaseUrl && (
                        <a
                          className="text-xs text-lime-400 hover:underline"
                          href={p.purchaseUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Link mua
                        </a>
                      )}
                      <span className="text-[11px] text-zinc-500">{p.isRequired ? 'Required' : 'Optional'}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() =>
                          setTaskPrepareEditing((prev) => ({
                            ...prev,
                            [p.id]: { ...p },
                          }))
                        }
                        className="text-xs px-3 py-1 rounded-lg border border-white/10 text-white"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleTaskPrepareDelete(resolveTaskId(task), p.id)}
                        className="text-xs px-3 py-1 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-zinc-600">Chưa có vật dụng.</p>
      )}

      <div className="p-3 rounded-lg bg-neutral-800 border border-white/10 space-y-2">
        <h5 className="text-xs text-white font-semibold">Thêm vật dụng cho task</h5>
        <input
          type="text"
          placeholder="Tên vật dụng"
          value={getTaskDraft(taskStateKey).name}
          onChange={(e) =>
            setTaskPrepareDrafts((prev) => ({
              ...prev,
              [taskStateKey]: {
                ...getTaskDraft(taskStateKey),
                name: e.target.value,
              },
            }))
          }
          className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
        />
        <textarea
          placeholder="Mô tả (optional)"
          value={getTaskDraft(taskStateKey).description}
          onChange={(e) =>
            setTaskPrepareDrafts((prev) => ({
              ...prev,
              [taskStateKey]: {
                ...getTaskDraft(taskStateKey),
                description: e.target.value,
              },
            }))
          }
          className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          rows={2}
        />
        <input
          type="text"
          placeholder="Link mua (optional)"
          value={getTaskDraft(taskStateKey).purchaseUrl}
          onChange={(e) =>
            setTaskPrepareDrafts((prev) => ({
              ...prev,
              [taskStateKey]: {
                ...getTaskDraft(taskStateKey),
                purchaseUrl: e.target.value,
              },
            }))
          }
          className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={getTaskDraft(taskStateKey).category}
            onChange={(e) =>
              setTaskPrepareDrafts((prev) => ({
                ...prev,
                [taskStateKey]: {
                  ...getTaskDraft(taskStateKey),
                  category: e.target.value,
                },
              }))
            }
            className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          >
            {prepareCategoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <select
            value={getTaskDraft(taskStateKey).iconName}
            onChange={(e) =>
              setTaskPrepareDrafts((prev) => ({
                ...prev,
                [taskStateKey]: {
                  ...getTaskDraft(taskStateKey),
                  iconName: e.target.value,
                },
              }))
            }
            className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          >
            {[...iconOptions, 'package', 'box', 'shopping-bag'].map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={!!getTaskDraft(taskStateKey).isRequired}
            onChange={(e) =>
              setTaskPrepareDrafts((prev) => ({
                ...prev,
                [taskStateKey]: {
                  ...getTaskDraft(taskStateKey),
                  isRequired: e.target.checked,
                },
              }))
            }
            className="accent-lime-400"
          />
          Bắt buộc
        </label>
        <button
          onClick={() => handleTaskPrepareAdd(resolveTaskId(task), taskStateKey)}
          className="w-full bg-white text-black font-bold py-2 rounded-lg active:scale-95 transition-all"
        >
          Thêm vật dụng
        </button>
      </div>
    </div>
  );
}
