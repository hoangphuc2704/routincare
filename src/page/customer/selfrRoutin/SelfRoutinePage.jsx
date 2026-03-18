import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomNav from "../../../components/BottomNav";
import TaskCard from "../../../components/TaskCard";
import taskLogApi from "../../../api/taskLogApi";
import {
    DumbbellIcon,
    BookOpenIcon,
    FlameIcon,
    ClockIcon,
    PlusIcon
} from "../../../components/Icons";

export default function SelfRoutinePage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTodayTasks = async () => {
        try {
            setLoading(true);
            const res = await taskLogApi.getToday();
            const data = res.data?.data || res.data;
            
            // Map API data to UI format
            const mappedTasks = (data || []).map(log => ({
                id: log.id,
                title: log.taskName || log.routineName,
                progress: log.type === 'Checkbox' 
                    ? (log.status === 'Done' ? 100 : 0)
                    : Math.round(((log.loggedValue || 0) / (log.targetValue || 1)) * 100),
                description: `Type: ${log.type}\nTarget: ${log.targetValue || '-'}\nLogged: ${log.loggedValue || 0}`,
                icon: getIcon(log.taskName || log.routineName),
                status: log.status,
                original: log
            }));

            setTasks(mappedTasks);
        } catch (err) {
            console.error("Failed to fetch today tasks:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayTasks();
    }, []);

    const getIcon = (name) => {
        const lowerName = (name || "").toLowerCase();
        if (lowerName.includes("gym") || lowerName.includes("workout")) return <DumbbellIcon />;
        if (lowerName.includes("read") || lowerName.includes("study") || lowerName.includes("học")) return <BookOpenIcon />;
        if (lowerName.includes("medit") || lowerName.includes("thiền")) return <FlameIcon />;
        return <ClockIcon />;
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24 relative">
            {/* Header */}
            <header className="p-4 md:max-w-md md:mx-auto pt-8 mb-4">
                <h1 className="text-3xl font-bold">Your Routine</h1>
            </header>

            <main className="px-4 md:max-w-md md:mx-auto">
                <div className="space-y-4">
                    {/* Task List */}
                    {loading ? (
                         <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#d2fb05]"></div>
                         </div>
                    ) : tasks.length > 0 ? (
                        tasks.map((task) => (
                            <TaskCard key={task.id} task={task} onUpdate={fetchTodayTasks} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-[#1a1a1a] rounded-2xl border border-dashed border-white/10">
                            <p className="text-zinc-500">No tasks for today. Time to relax or add a new one!</p>
                        </div>
                    )}

                    {/* Add Button */}
                    <Link
                        to="/customer/selfroutin/create"
                        className="w-full h-32 bg-[#1a1a1a] rounded-2xl flex flex-col items-center justify-center text-zinc-600 hover:text-lime-400 hover:bg-[#1a1a1a] border border-dashed border-white/5 hover:border-lime-400/50 transition-all group active:scale-95"
                    >
                        <div className="w-12 h-12 rounded-full bg-zinc-900 group-hover:bg-lime-400/10 flex items-center justify-center mb-2 transition-all">
                            <PlusIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#444] group-hover:text-lime-400">Add New Plan</span>
                    </Link>
                </div>
            </main>

            <BottomNav activeItem="target" />
        </div>
    );
}