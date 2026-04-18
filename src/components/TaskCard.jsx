import React, { useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import taskLogApi from '../services/api/taskLogApi';
import { message } from 'antd';

export default function TaskCard({ task, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const isCompleted = task.status === 'Done';

    const handleCheckIn = async (e) => {
        e.stopPropagation();
        if (loading) return;
        
        try {
            setLoading(true);
            // In a real app, we would need to pass more data from the 'original' object if checkin requires it.
            // Based on full.md, checkin needs { taskId, date, status, etc. }
            const payload = {
                taskId: task.original?.taskId || task.id,
                status: isCompleted ? 'InProgress' : 'Done',
                date: new Date().toISOString().split('T')[0]
            };
            await taskLogApi.checkin(payload);
            message.success(isCompleted ? 'Task un-checked' : 'Task completed!');
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Check-in error:', err);
            message.error('Failed to update task status');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="bg-[#1a1a1a] rounded-2xl p-4">

            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleCheckIn}
                        disabled={loading}
                        className={`flex items-center justify-center p-1 rounded-full transition-all ${isCompleted ? 'text-lime-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        {loading ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : isCompleted ? (
                            <CheckCircle2 size={28} />
                        ) : (
                            <Circle size={28} />
                        )}
                    </button>
                    
                    <h3 className={`text-2xl font-bold transition-all ${isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}>
                        {task.title}
                    </h3>
                </div>

                <span className={`text-2xl font-bold ${isCompleted ? 'text-lime-400' : 'text-white'}`}>
                    {task.progress}%
                </span>
            </div>

            <div className="mb-2">
                <span className={`text-sm font-semibold ${isCompleted ? 'text-zinc-600' : 'text-[#d2fb05]'}`}>
                    Description:
                </span>

                <p className={`text-xs whitespace-pre-line mt-1 leading-relaxed ${isCompleted ? 'text-zinc-700' : 'text-gray-300'}`}>
                    {task.description}
                </p>
            </div>

            <div className="flex justify-end mt-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Status: {task.status}
                </span>
            </div>

        </div>
    );
}