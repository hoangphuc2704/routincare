import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Clock3 } from 'lucide-react';
import { message } from 'antd';
import BottomNav from '../../../components/BottomNav';
import routineApi from '../../../api/routineApi';
import taskLogApi from '../../../api/taskLogApi';

const RoutineDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const iconOptions = ['droplet', 'check', 'flame', 'activity', 'sun', 'moon'];
  const colorOptions = ['#22C55E', '#F97316', '#EF4444'];
  const prepareCategoryOptions = ['Equipment', 'Accessory', 'Food', 'Other'];
  const categoryMap = { Equipment: 0, Accessory: 1, Food: 2, Other: 3 };
  const [logs, setLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logInputs, setLogInputs] = useState({});
  const [evidenceInputs, setEvidenceInputs] = useState({});
  const [editForm, setEditForm] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'Checkbox',
    targetValue: 1,
    unitName: 'times',
    difficulty: 'Easy',
    notes: '',
    tips: '',
    estimatedMinutes: '',
    mediaUrl: '',
    restAfterSeconds: '',
    iconName: 'droplet',
    iconColor: '#22C55E',
  });
  const [newPrepare, setNewPrepare] = useState({
    name: '',
    description: '',
    purchaseUrl: '',
    category: 'Equipment',
    iconName: 'package',
    isRequired: true,
  });
  const [taskPrepareDrafts, setTaskPrepareDrafts] = useState({});
  const [taskPrepareEditing, setTaskPrepareEditing] = useState({});
  const [evidenceFiles, setEvidenceFiles] = useState({});

  const normalizeRemindTimeForInput = (value) => {
    if (!value) return '';
    const str = String(value).trim();
    if (!str) return '';

    // API may return "HH:mm:ss" while <input type="time"> usually binds as "HH:mm".
    if (str.includes(':')) {
      return str.slice(0, 5);
    }
    return str;
  };

  const normalizeRemindTimeForApi = (value) => {
    const str = String(value || '').trim();
    if (!str) return null;

    // Ensure backend receives TimeSpan-compatible format.
    if (/^\d{2}:\d{2}$/.test(str)) return `${str}:00`;
    if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str;
    return null;
  };

  const normalizeVisibility = (value, defaultValue = 1) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;

    const str = String(value || '').trim().toLowerCase();
    if (str === 'private') return 0;
    if (str === 'public') return 1;
    if (str === 'subscribersonly' || str === 'subscribers') return 2;
    return defaultValue;
  };

  const normalizeRepeatType = (value, defaultValue = 0) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;

    const str = String(value || '').trim().toLowerCase();
    if (str === 'daily') return 0;
    if (str === 'weekly') return 1;
    return defaultValue;
  };

  const fetchRoutine = async () => {
    try {
      setLoading(true);
      const res = await routineApi.getById(id);
      const data = res.data?.data || res.data;
      const normalizedRepeatType = normalizeRepeatType(data?.repeatType, 0);
      const normalizedVisibility = normalizeVisibility(data?.visibility, 1);

      setRoutine({
        ...data,
        repeatType: normalizedRepeatType,
        visibility: normalizedVisibility,
      });
      setEditForm({
        title: data?.title || '',
        description: data?.description || '',
        remindTime: normalizeRemindTimeForInput(data?.remindTime),
        repeatType: normalizedRepeatType,
        repeatDays: data?.repeatDays || '',
        visibility: normalizedVisibility,
        categoryId: data?.categoryId || data?.category?.id || '',
      });
    } catch (err) {
      console.error('Failed to fetch routine detail:', err.response?.data || err);
      message.error('Không tải được routine');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogLoading(true);
      const res = await taskLogApi.getToday();
      const data = res.data?.data || res.data || [];
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch task logs:', err.response?.data || err);
    } finally {
      setLogLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRoutine();
      fetchLogs();
    }
  }, [id]);

  const visibilityLabel = (value) => {
    const normalized = normalizeVisibility(value, -1);
    if (normalized === 0) return 'Private';
    if (normalized === 1) return 'Public';
    if (normalized === 2) return 'SubscribersOnly';
    return 'Unknown';
  };

  const resolveTaskArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];

    const nestedCandidates = [value.items, value.results, value.data, value.$values];
    for (const candidate of nestedCandidates) {
      if (Array.isArray(candidate)) return candidate;
    }

    return [];
  };

  const resolveTasksFromRoutine = (routineData) => {
    const taskCandidates = [
      routineData?.tasks,
      routineData?.routineTasks,
      routineData?.routine_tasks,
      routineData?.taskDtos,
    ];

    for (const candidate of taskCandidates) {
      const resolved = resolveTaskArray(candidate);
      if (resolved.length > 0) return resolved;
    }

    for (const candidate of taskCandidates) {
      if (Array.isArray(candidate) && candidate.length === 0) return candidate;
    }

    return [];
  };

  const todayStr = () => new Date().toISOString().slice(0, 10);
  const getLogByTask = (taskId) => logs.find((log) => log.taskId === taskId);
  const tasks = resolveTasksFromRoutine(routine);
  const prepareItems = routine?.prepareItems || [];
  const completedCount = tasks.reduce(
    (sum, t) => (getLogByTask(t.id || t.taskId)?.status === 1 ? sum + 1 : sum),
    0
  );
  const statusLabel = (status) => {
    if (status === 1) return 'Completed';
    if (status === 2) return 'Skipped';
    return 'InProgress';
  };
  const statusColor = (status) => {
    if (status === 1) return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30';
    if (status === 2) return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';
    return 'text-[#F97316] bg-[#F97316]/10 border-[#F97316]/30';
  };

  const handleUpdateRoutine = async () => {
    if (!editForm?.title?.trim()) {
      message.warning('Nhập tiêu đề routine');
      return;
    }
    setSavingUpdate(true);
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description || null,
        remindTime: normalizeRemindTimeForApi(editForm.remindTime),
        repeatType: editForm.repeatType,
        repeatDays: editForm.repeatType === 1 ? editForm.repeatDays || null : null,
        visibility: editForm.visibility,
        categoryId: editForm.categoryId || null,
      };
      await routineApi.update(id, payload);
      message.success('Đã cập nhật routine');
      fetchRoutine();
    } catch (err) {
      console.error('Update routine failed:', err.response?.data || err);
      const errorData = err.response?.data;
      const validationErrors = errorData?.errors;
      let errorMsg = 'Không thể cập nhật routine';
      if (validationErrors) {
        errorMsg = Object.entries(validationErrors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join(' | ');
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      }
      message.error(errorMsg, 10);
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleDeleteRoutine = async () => {
    if (!window.confirm('Xóa routine này?')) return;
    setDeleting(true);
    try {
      await routineApi.delete(id);
      message.success('Đã xóa routine');
      navigate('/customer/selfroutin');
    } catch (err) {
      console.error('Delete routine failed:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Không thể xóa routine');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddPrepareItem = async () => {
    if (!newPrepare.name.trim()) {
      message.warning('Nhập tên vật dụng');
      return;
    }
    try {
      const payload = {
        name: newPrepare.name,
        description: newPrepare.description?.trim() || null,
        imageUrl: null,
        purchaseUrl: newPrepare.purchaseUrl?.trim() || null,
        iconName: newPrepare.iconName || 'package',
        category: categoryMap[newPrepare.category] ?? 0,
        isRequired: !!newPrepare.isRequired,
        orderIndex: prepareItems.length,
      };
      await routineApi.addPrepareItem(id, payload);
      message.success('Đã thêm vật dụng');
      setNewPrepare({
        name: '',
        description: '',
        purchaseUrl: '',
        category: 'Equipment',
        iconName: 'package',
        isRequired: true,
      });
      fetchRoutine();
    } catch (err) {
      console.error('Add prepare item failed:', err.response?.data || err);
      const errorData = err.response?.data;
      const validationErrors = errorData?.errors;
      let errorMsg = 'Không thể thêm vật dụng';
      if (validationErrors) {
        errorMsg = Object.entries(validationErrors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join(' | ');
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      }
      message.error(errorMsg, 10);
    }
  };

  const handleDeletePrepareItem = async (itemId) => {
    if (!window.confirm('Xóa vật dụng này?')) return;
    try {
      await routineApi.deletePrepareItem(id, itemId);
      message.success('Đã xóa vật dụng');
      fetchRoutine();
    } catch (err) {
      console.error('Delete prepare item failed:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Không thể xóa vật dụng');
    }
  };

  const defaultPreparePayload = () => ({
    name: '',
    description: '',
    purchaseUrl: '',
    category: 'Equipment',
    iconName: 'package',
    isRequired: true,
  });

  const getTaskDraft = (taskId) => taskPrepareDrafts[taskId] || defaultPreparePayload();

  const handleTaskPrepareAdd = async (taskId) => {
    const draft = getTaskDraft(taskId);
    if (!draft.name.trim()) {
      message.warning('Nhập tên vật dụng');
      return;
    }
    try {
      const payload = {
        name: draft.name,
        description: draft.description?.trim() || null,
        imageUrl: null,
        purchaseUrl: draft.purchaseUrl?.trim() || null,
        iconName: draft.iconName || 'package',
        category: categoryMap[draft.category] ?? 0,
        isRequired: !!draft.isRequired,
        orderIndex: tasks.find((t) => (t.id || t.taskId) === taskId)?.prepareItems?.length || 0,
      };
      await routineApi.addTaskPrepareItem(id, taskId, payload);
      message.success('Đã thêm vật dụng cho task');
      setTaskPrepareDrafts((prev) => ({ ...prev, [taskId]: defaultPreparePayload() }));
      fetchRoutine();
    } catch (err) {
      console.error('Add task prepare item failed:', err.response?.data || err);
      const errorData = err.response?.data;
      const validationErrors = errorData?.errors;
      let errorMsg = 'Không thể thêm vật dụng';
      if (validationErrors) {
        errorMsg = Object.entries(validationErrors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join(' | ');
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      }
      message.error(errorMsg, 10);
    }
  };

  const handleTaskPrepareEdit = async (taskId, itemId) => {
    const draft = taskPrepareEditing[itemId];
    if (!draft?.name?.trim()) {
      message.warning('Nhập tên vật dụng');
      return;
    }
    try {
      const payload = {
        name: draft.name,
        description: draft.description?.trim() || null,
        imageUrl: null,
        purchaseUrl: draft.purchaseUrl?.trim() || null,
        iconName: draft.iconName || 'package',
        category: categoryMap[draft.category] ?? 0,
        isRequired: !!draft.isRequired,
        orderIndex: draft.orderIndex ?? 0,
      };
      await routineApi.updateTaskPrepareItem(id, taskId, itemId, payload);
      message.success('Đã cập nhật vật dụng');
      setTaskPrepareEditing((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      fetchRoutine();
    } catch (err) {
      console.error('Update task prepare item failed:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Không thể cập nhật vật dụng');
    }
  };

  const handleTaskPrepareDelete = async (taskId, itemId) => {
    if (!window.confirm('Xóa vật dụng này?')) return;
    try {
      await routineApi.deleteTaskPrepareItem(id, taskId, itemId);
      message.success('Đã xóa vật dụng');
      fetchRoutine();
    } catch (err) {
      console.error('Delete task prepare item failed:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Không thể xóa vật dụng');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      message.warning('Nhập tên task');
      return;
    }
    setAdding(true);
    try {
      const unitTypeMap = {
        Checkbox: 0,
        Number: 1,
      };
      const difficultyMap = {
        Easy: 0,
        Medium: 1,
        Hard: 2,
      };
      const parseNumber = (value, fallback) => {
        const n = parseInt(value, 10);
        return Number.isFinite(n) ? n : fallback;
      };
      const payload = {
        title: newTask.title,
        unitType: unitTypeMap[newTask.type] ?? 0,
        targetValue: newTask.type === 'Number' ? parseNumber(newTask.targetValue, 1) : 1,
        unitName: newTask.type === 'Number' ? newTask.unitName || 'ml' : 'times',
        iconName: newTask.iconName || 'droplet',
        iconColor: newTask.iconColor || '#3B82F6',
        notes: newTask.notes?.trim() || null,
        tips: newTask.tips?.trim() || null,
        estimatedMinutes: parseNumber(newTask.estimatedMinutes, 0),
        mediaUrl: newTask.mediaUrl?.trim() || null,
        difficultyLevel: difficultyMap[newTask.difficulty] ?? 0,
        restAfterSeconds:
          newTask.restAfterSeconds === '' ? null : parseNumber(newTask.restAfterSeconds, null),
        prepareItems: [],
      };

      await routineApi.addTask(id, payload);
      message.success('Đã thêm task');
      setNewTask({
        title: '',
        type: 'Checkbox',
        targetValue: 1,
        unitName: 'times',
        difficulty: 'Easy',
        notes: '',
        tips: '',
        estimatedMinutes: '',
        mediaUrl: '',
        restAfterSeconds: '',
        iconName: 'droplet',
        iconColor: '#3B82F6',
      });
      fetchRoutine();
    } catch (err) {
      console.error('Add task failed:', err.response?.data || err);
      const errorData = err.response?.data;
      const validationErrors = errorData?.errors;
      let errorMsg = 'Không thể thêm task';
      if (validationErrors) {
        errorMsg = Object.entries(validationErrors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join(' | ');
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      }
      message.error(errorMsg, 10);
    } finally {
      setAdding(false);
    }
  };

  const handleCheckin = async (taskId) => {
    try {
      await taskLogApi.checkin({ taskId, date: todayStr() });
      message.success('Đã check-in');
      fetchLogs();
    } catch (err) {
      console.error('Check-in failed:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Check-in thất bại');
    }
  };

  const handleLogQuantity = async (taskId) => {
    const value = parseInt(logInputs[taskId], 10);
    if (!Number.isFinite(value) || value < 0) {
      message.warning('Nhập giá trị số hợp lệ');
      return;
    }
    try {
      await taskLogApi.logQuantity({ taskId, value });
      message.success('Đã ghi log');
      fetchLogs();
    } catch (err) {
      console.error('Log quantity failed:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Không thể ghi log');
    }
  };

  const handleSkip = async (logId) => {
    if (!logId) {
      message.warning('Chưa có log để skip');
      return;
    }
    try {
      await taskLogApi.skip(logId);
      message.success('Đã skip');
      fetchLogs();
    } catch (err) {
      console.error('Skip failed:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Không thể skip');
    }
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

  const handleEvidence = async (logId, taskId) => {
    const url = evidenceInputs[taskId]?.trim();
    const file = evidenceFiles[taskId];
    if (!url && !file) {
      message.warning('Nhập URL hoặc chọn ảnh');
      return;
    }
    try {
      let evidencePayload = url || null;
      if (file) {
        evidencePayload = await fileToDataUrl(file);
      }
      await taskLogApi.updateEvidence(logId, { evidenceUrl: evidencePayload });
      message.success('Đã cập nhật minh chứng');
      setEvidenceFiles((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      setEvidenceInputs((prev) => ({ ...prev, [taskId]: '' }));
      fetchLogs();
    } catch (err) {
      console.error('Update evidence failed:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Không thể cập nhật minh chứng');
    }
  };

  const handleUndo = async (logId) => {
    if (!logId) {
      message.warning('Chưa có log để hủy');
      return;
    }
    try {
      await taskLogApi.delete(logId);
      message.success('Đã hủy check-in');
      fetchLogs();
    } catch (err) {
      console.error('Delete log failed:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Không thể hủy log');
    }
  };

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

      <main className="px-4 md:max-w-md md:mx-auto space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-lime-400"></div>
          </div>
        ) : !routine ? (
          <div className="text-center py-16 text-zinc-500">Không tìm thấy routine.</div>
        ) : (
          <>
            <section className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 space-y-3">
              <h2 className="text-lg font-bold">{routine.title}</h2>
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
            </section>

            {editForm && (
              <section className="p-4 rounded-2xl bg-[#101010] border border-white/5 space-y-3">
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
              </section>
            )}

            <section className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Tasks</h3>
                <span className="text-xs text-zinc-500">{tasks.length} task(s)</span>
              </div>
              {tasks.length === 0 ? (
                <p className="text-sm text-zinc-500">Chưa có task nào trong routine này.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id || task.taskId}
                      className="p-3 rounded-xl bg-neutral-900 border border-white/5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-white">{task.title || task.name}</h4>
                          {typeof task.targetValue !== 'undefined' && (
                            <span className="text-xs text-zinc-500">
                              Target: {task.targetValue} {task.unitName || ''}
                            </span>
                          )}
                          {task.description && (
                            <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-[11px] px-2 py-1 rounded-full border ${statusColor(getLogByTask(task.id || task.taskId)?.status)}`}
                        >
                          {statusLabel(getLogByTask(task.id || task.taskId)?.status)}
                        </span>
                      </div>
                      <div className="mt-3 p-3 rounded-xl bg-neutral-800 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400">Check-in / Log</span>
                          {logLoading ? (
                            <span className="text-[11px] text-zinc-500">Đang tải...</span>
                          ) : (
                            <span
                              className={`text-[11px] px-2 py-1 rounded-full border ${statusColor(getLogByTask(task.id || task.taskId)?.status)}`}
                            >
                              {statusLabel(getLogByTask(task.id || task.taskId)?.status)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleCheckin(task.id || task.taskId)}
                            className="px-3 py-2 rounded-lg bg-[#22C55E] text-black text-sm font-bold active:scale-95"
                          >
                            Check-in
                          </button>
                          <button
                            onClick={() => handleSkip(getLogByTask(task.id || task.taskId)?.id)}
                            className="px-3 py-2 rounded-lg border border-white/10 text-white text-sm active:scale-95"
                          >
                            Skip
                          </button>
                          <button
                            onClick={() => handleUndo(getLogByTask(task.id || task.taskId)?.id)}
                            className="px-3 py-2 rounded-lg border border-[#EF4444]/40 text-[#EF4444] text-sm active:scale-95"
                          >
                            Hủy log
                          </button>
                        </div>

                        {/* Quantity log */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <input
                            type="number"
                            min="0"
                            value={logInputs[task.id || task.taskId] || ''}
                            onChange={(e) =>
                              setLogInputs((prev) => ({
                                ...prev,
                                [task.id || task.taskId]: e.target.value,
                              }))
                            }
                            className="col-span-2 bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="Giá trị (ml, reps...)"
                          />
                          <button
                            onClick={() => handleLogQuantity(task.id || task.taskId)}
                            className="w-full bg-white text-black font-bold py-2 rounded-lg active:scale-95 text-sm"
                          >
                            Ghi log
                          </button>
                        </div>

                        {/* Evidence */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2 items-center">
                            <input
                              type="text"
                              value={evidenceInputs[task.id || task.taskId] || ''}
                              onChange={(e) =>
                                setEvidenceInputs((prev) => ({
                                  ...prev,
                                  [task.id || task.taskId]: e.target.value,
                                }))
                              }
                              className="col-span-2 bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                              placeholder="Evidence URL"
                            />
                            <button
                              onClick={() =>
                                handleEvidence(
                                  getLogByTask(task.id || task.taskId)?.id,
                                  task.id || task.taskId
                                )
                              }
                              className="w-full bg-zinc-200 text-black font-bold py-2 rounded-lg active:scale-95 text-sm"
                            >
                              Lưu link / ảnh
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 items-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                setEvidenceFiles((prev) => ({
                                  ...prev,
                                  [task.id || task.taskId]: file,
                                }));
                              }}
                              className="col-span-2 text-xs text-white"
                            />
                            <span className="text-[11px] text-zinc-500">
                              {evidenceFiles[task.id || task.taskId]?.name || 'Chọn ảnh'}
                            </span>
                          </div>
                        </div>
                        {getLogByTask(task.id || task.taskId)?.currentValue !== undefined && (
                          <p className="text-[11px] text-zinc-500">
                            Giá trị hiện tại: {getLogByTask(task.id || task.taskId)?.currentValue}
                          </p>
                        )}
                      </div>

                      {/* Task-level prepare items (placed after log for clarity) */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500">Prepare items</span>
                          <span className="text-[11px] text-zinc-500">
                            {task.prepareItems?.length || 0} item(s)
                          </span>
                        </div>
                        {task.prepareItems && task.prepareItems.length > 0 ? (
                          <div className="space-y-2">
                            {task.prepareItems.map((p) => {
                              const editing = taskPrepareEditing[p.id];
                              return (
                                <div
                                  key={p.id}
                                  className="p-2 rounded-lg bg-neutral-800 border border-white/10"
                                >
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
                                          {[...iconOptions, 'package', 'box', 'shopping-bag'].map(
                                            (icon) => (
                                              <option key={icon} value={icon}>
                                                {icon}
                                              </option>
                                            )
                                          )}
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
                                          onClick={() =>
                                            handleTaskPrepareEdit(task.id || task.taskId, p.id)
                                          }
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
                                        {p.description && (
                                          <p className="text-xs text-zinc-500">{p.description}</p>
                                        )}
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
                                        <span className="text-[11px] text-zinc-500">
                                          {p.isRequired ? 'Required' : 'Optional'}
                                        </span>
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
                                          onClick={() =>
                                            handleTaskPrepareDelete(task.id || task.taskId, p.id)
                                          }
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

                        {/* Add prepare item to task */}
                        <div className="p-3 rounded-lg bg-neutral-800 border border-white/10 space-y-2">
                          <h5 className="text-xs text-white font-semibold">
                            Thêm vật dụng cho task
                          </h5>
                          <input
                            type="text"
                            placeholder="Tên vật dụng"
                            value={getTaskDraft(task.id || task.taskId).name}
                            onChange={(e) =>
                              setTaskPrepareDrafts((prev) => ({
                                ...prev,
                                [task.id || task.taskId]: {
                                  ...getTaskDraft(task.id || task.taskId),
                                  name: e.target.value,
                                },
                              }))
                            }
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                          />
                          <textarea
                            placeholder="Mô tả (optional)"
                            value={getTaskDraft(task.id || task.taskId).description}
                            onChange={(e) =>
                              setTaskPrepareDrafts((prev) => ({
                                ...prev,
                                [task.id || task.taskId]: {
                                  ...getTaskDraft(task.id || task.taskId),
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
                            value={getTaskDraft(task.id || task.taskId).purchaseUrl}
                            onChange={(e) =>
                              setTaskPrepareDrafts((prev) => ({
                                ...prev,
                                [task.id || task.taskId]: {
                                  ...getTaskDraft(task.id || task.taskId),
                                  purchaseUrl: e.target.value,
                                },
                              }))
                            }
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={getTaskDraft(task.id || task.taskId).category}
                              onChange={(e) =>
                                setTaskPrepareDrafts((prev) => ({
                                  ...prev,
                                  [task.id || task.taskId]: {
                                    ...getTaskDraft(task.id || task.taskId),
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
                              value={getTaskDraft(task.id || task.taskId).iconName}
                              onChange={(e) =>
                                setTaskPrepareDrafts((prev) => ({
                                  ...prev,
                                  [task.id || task.taskId]: {
                                    ...getTaskDraft(task.id || task.taskId),
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
                              checked={!!getTaskDraft(task.id || task.taskId).isRequired}
                              onChange={(e) =>
                                setTaskPrepareDrafts((prev) => ({
                                  ...prev,
                                  [task.id || task.taskId]: {
                                    ...getTaskDraft(task.id || task.taskId),
                                    isRequired: e.target.checked,
                                  },
                                }))
                              }
                              className="accent-lime-400"
                            />
                            Bắt buộc
                          </label>
                          <button
                            onClick={() => handleTaskPrepareAdd(task.id || task.taskId)}
                            className="w-full bg-white text-black font-bold py-2 rounded-lg active:scale-95 transition-all"
                          >
                            Thêm vật dụng
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                        Đang chọn:{' '}
                        <span className="text-white font-semibold">{newTask.iconColor}</span>
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
            </section>

            <section className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Prepare items</h3>
                <span className="text-xs text-zinc-500">{prepareItems.length} item(s)</span>
              </div>
              {prepareItems.length === 0 ? (
                <p className="text-sm text-zinc-500">Chưa có vật dụng nào.</p>
              ) : (
                <div className="space-y-3">
                  {prepareItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-neutral-900 border border-white/5 flex items-start gap-3"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-white">{item.name}</h4>
                            <p className="text-xs text-zinc-500">{item.category}</p>
                          </div>
                          <span className="text-[11px] px-2 py-1 rounded-full border border-white/10 text-zinc-300">
                            {item.isRequired ? 'Required' : 'Optional'}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-zinc-500">{item.description}</p>
                        )}
                        {item.purchaseUrl && (
                          <a
                            href={item.purchaseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-lime-400 hover:underline"
                          >
                            Link mua
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeletePrepareItem(item.id)}
                        className="text-xs text-red-400 border border-red-500/40 px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 p-3 rounded-xl bg-neutral-900 border border-white/5 space-y-3">
                <h4 className="font-semibold text-white">Thêm vật dụng</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Tên vật dụng"
                    value={newPrepare.name}
                    onChange={(e) => setNewPrepare({ ...newPrepare, name: e.target.value })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <textarea
                    placeholder="Mô tả (optional)"
                    value={newPrepare.description}
                    onChange={(e) => setNewPrepare({ ...newPrepare, description: e.target.value })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    rows={2}
                  />
                  <input
                    type="text"
                    placeholder="Link mua (optional)"
                    value={newPrepare.purchaseUrl}
                    onChange={(e) => setNewPrepare({ ...newPrepare, purchaseUrl: e.target.value })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newPrepare.category}
                      onChange={(e) => setNewPrepare({ ...newPrepare, category: e.target.value })}
                      className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      {prepareCategoryOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newPrepare.iconName}
                      onChange={(e) => setNewPrepare({ ...newPrepare, iconName: e.target.value })}
                      className="bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
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
                      checked={newPrepare.isRequired}
                      onChange={(e) =>
                        setNewPrepare({ ...newPrepare, isRequired: e.target.checked })
                      }
                      className="accent-lime-400"
                    />
                    Bắt buộc
                  </label>
                  <button
                    onClick={handleAddPrepareItem}
                    className="w-full bg-lime-400 text-black font-bold py-2 rounded-lg active:scale-95 transition-all"
                  >
                    Thêm vật dụng
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <BottomNav activeItem="target" />
    </div>
  );
};

export default RoutineDetailPage;
