import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Clock3 } from 'lucide-react';
import { message } from 'antd';
import BottomNav from '../../../components/BottomNav';
import TaskPreviewModal from './components/TaskPreviewModal';
import TaskSection from './components/TaskSection';
import routineApi from '../../../api/routineApi';
import taskLogApi from '../../../api/taskLogApi';
import mediaApi from '../../../api/mediaApi';
import {
  normalizeId,
  normalizeTaskStatus,
  normalizePrepareCategoryLabel,
  resolveTaskId,
  resolveTaskStateKey,
  normalizeTaskUnitType,
  resolveEvidenceUrl,
  isLikelyImageEvidence,
  normalizeRemindTimeForInput,
  normalizeRemindTimeForApi,
  normalizeVisibility,
  normalizeRepeatType,
  resolveTasksFromRoutine,
  statusLabel,
  statusColor,
  isValidHttpUrl,
} from './utils/routineDetailHelpers';

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
  const [taskPrepareDrafts, setTaskPrepareDrafts] = useState({});
  const [taskPrepareEditing, setTaskPrepareEditing] = useState({});
  const [evidenceFiles, setEvidenceFiles] = useState({});
  const [taskEditing, setTaskEditing] = useState({});
  const [savingTaskId, setSavingTaskId] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [previewTask, setPreviewTask] = useState(null);
  const [taskQuery, setTaskQuery] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');
  const [taskViewMode, setTaskViewMode] = useState('grid');
  const [expandedTaskMap, setExpandedTaskMap] = useState({});
  const [showEditRoutine, setShowEditRoutine] = useState(false);

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
      const list = Array.isArray(data)
        ? data
        : data?.items || data?.results || data?.$values || data?.data || [];

      const normalized = (Array.isArray(list) ? list : []).map((item) => ({
        ...item,
        id: item?.id || item?.taskLogId || item?.logId || null,
        taskId: item?.taskId || item?.task_id || item?.task?.id || item?.task?.taskId || null,
        status: normalizeTaskStatus(item?.status ?? item?.statusName ?? item?.taskStatus),
      }));

      setLogs(normalized);
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

  const getLogByTask = (taskId) =>
    logs.find((log) => normalizeId(log?.taskId) === normalizeId(taskId));
  const tasks = resolveTasksFromRoutine(routine);
  const completedCount = tasks.reduce(
    (sum, t) => (normalizeTaskStatus(getLogByTask(resolveTaskId(t))?.status) === 1 ? sum + 1 : sum),
    0
  );
  const getTaskNormalizedStatus = (task) =>
    normalizeTaskStatus(getLogByTask(resolveTaskId(task))?.status);

  const taskStats = tasks.reduce(
    (acc, task) => {
      const status = getTaskNormalizedStatus(task);
      acc.total += 1;
      if (status === 1) acc.completed += 1;
      else if (status === 2) acc.skipped += 1;
      else acc.inProgress += 1;
      return acc;
    },
    { total: 0, inProgress: 0, completed: 0, skipped: 0 }
  );

  const taskFilterOptions = [
    { value: 'all', label: 'All', count: taskStats.total },
    { value: 'inprogress', label: 'InProgress', count: taskStats.inProgress },
    { value: 'completed', label: 'Completed', count: taskStats.completed },
    { value: 'skipped', label: 'Skipped', count: taskStats.skipped },
  ];

  const filteredTasks = tasks.filter((task) => {
    const keyword = taskQuery.trim().toLowerCase();
    const title = String(task?.title || task?.name || '').toLowerCase();
    const matchKeyword = !keyword || title.includes(keyword);
    if (!matchKeyword) return false;

    if (taskFilter === 'all') return true;
    const status = getTaskNormalizedStatus(task);
    if (taskFilter === 'completed') return status === 1;
    if (taskFilter === 'skipped') return status === 2;
    return status === 0;
  });

  const toggleTaskExpanded = (taskKey) => {
    setExpandedTaskMap((prev) => ({ ...prev, [taskKey]: !prev[taskKey] }));
  };

  const createTaskEditDraft = (task) => {
    const taskId = resolveTaskId(task);
    if (!taskId) {
      message.warning('Không tìm thấy taskId hợp lệ');
      return;
    }

    setTaskEditing((prev) => ({
      ...prev,
      [taskId]: {
        title: task?.title || task?.name || '',
        unitType: normalizeTaskUnitType(task?.unitType),
        targetValue: task?.targetValue ?? 1,
        unitName: task?.unitName || 'times',
        iconName: task?.iconName || 'droplet',
        iconColor: task?.iconColor || '#22C55E',
      },
    }));
  };

  const cancelTaskEdit = (taskId) => {
    setTaskEditing((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
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

  const defaultPreparePayload = () => ({
    name: '',
    description: '',
    purchaseUrl: '',
    category: 'Equipment',
    iconName: 'package',
    isRequired: true,
  });

  const getTaskDraft = (taskId) => taskPrepareDrafts[taskId] || defaultPreparePayload();

  const handleTaskPrepareAdd = async (taskId, draftKey = taskId) => {
    if (!taskId) {
      message.warning('Không tìm thấy taskId hợp lệ');
      return;
    }
    const draft = getTaskDraft(draftKey);
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
        orderIndex:
          tasks.find((t) => normalizeId(resolveTaskId(t)) === normalizeId(taskId))?.prepareItems
            ?.length || 0,
      };
      await routineApi.addTaskPrepareItem(id, taskId, payload);
      message.success('Đã thêm vật dụng cho task');
      setTaskPrepareDrafts((prev) => ({ ...prev, [draftKey]: defaultPreparePayload() }));
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
    if (!taskId) {
      message.warning('Không tìm thấy taskId hợp lệ');
      return;
    }
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
    if (!taskId) {
      message.warning('Không tìm thấy taskId hợp lệ');
      return;
    }
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

  const handleUpdateTask = async (taskId) => {
    const draft = taskEditing[taskId];
    if (!taskId || !draft) {
      message.warning('Thiếu dữ liệu task để cập nhật');
      return;
    }
    if (!draft.title?.trim()) {
      message.warning('Nhập tên task');
      return;
    }

    try {
      setSavingTaskId(taskId);
      const payload = {
        title: draft.title.trim(),
        unitType: draft.unitType === 'Number' ? 1 : 0,
        targetValue:
          draft.unitType === 'Number'
            ? Math.max(1, Number.parseInt(draft.targetValue, 10) || 1)
            : 1,
        unitName: draft.unitType === 'Number' ? draft.unitName?.trim() || 'ml' : 'times',
        iconName: draft.iconName || 'droplet',
        iconColor: draft.iconColor || '#22C55E',
      };

      await routineApi.updateTask(id, taskId, payload);
      message.success('Đã cập nhật task');
      cancelTaskEdit(taskId);
      fetchRoutine();
    } catch (err) {
      console.error('Update task failed:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Không thể cập nhật task');
    } finally {
      setSavingTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) {
      message.warning('Không tìm thấy taskId hợp lệ');
      return;
    }
    if (!window.confirm('Xóa task này?')) return;

    try {
      setDeletingTaskId(taskId);
      await routineApi.deleteTask(id, taskId);
      message.success('Đã xóa task');
      cancelTaskEdit(taskId);
      fetchRoutine();
      fetchLogs();
    } catch (err) {
      console.error('Delete task failed:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Không thể xóa task');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleCheckin = async (taskId, currentStatus) => {
    if (normalizeTaskStatus(currentStatus) === 1) {
      message.info('Task đã hoàn thành. Dùng Hủy log để check-in lại.');
      return;
    }
    try {
      await taskLogApi.checkin({ taskId });
      message.success('Đã check-in');
      fetchLogs();
    } catch (err) {
      console.error('Check-in failed:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Check-in thất bại');
    }
  };

  const handleLogQuantity = async (taskId) => {
    if (!taskId) {
      message.warning('Không tìm thấy taskId hợp lệ');
      return;
    }
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

  const uploadEvidenceImage = async (file) => {
    if (!file.type?.startsWith('image/')) {
      throw new Error('Vui lòng chọn file ảnh hợp lệ');
    }

    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Ảnh tối đa 8MB');
    }

    const signRes = await mediaApi.signUpload({ folder: 'routin/evidence', resourceType: 'image' });
    const signData = signRes.data?.data || signRes.data;

    if (!signData?.uploadUrl || !signData?.apiKey || !signData?.timestamp || !signData?.signature) {
      throw new Error('Không lấy được thông tin upload ảnh');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', String(signData.apiKey));
    formData.append('timestamp', String(signData.timestamp));
    formData.append('signature', String(signData.signature));
    if (signData.folder) {
      formData.append('folder', String(signData.folder));
    }

    const uploadRes = await fetch(signData.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error('Tải ảnh minh chứng thất bại');
    }

    const uploaded = await uploadRes.json();
    const secureUrl = uploaded.secure_url || uploaded.url;
    if (!secureUrl) {
      throw new Error('Upload thành công nhưng không có URL ảnh');
    }

    return secureUrl;
  };

  const handleEvidence = async (logId, taskId) => {
    const url = evidenceInputs[taskId]?.trim();
    const file = evidenceFiles[taskId];
    if (!url && !file) {
      message.warning('Nhập URL hoặc chọn ảnh');
      return;
    }
    if (!logId) {
      message.warning('Bạn cần check-in task trước khi thêm minh chứng');
      return;
    }
    if (url && !isValidHttpUrl(url)) {
      message.warning('Evidence URL không hợp lệ');
      return;
    }
    try {
      let evidencePayload = url || null;
      if (file) {
        evidencePayload = await uploadEvidenceImage(file);
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
