import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomNav from "../../../components/BottomNav";
import routineApi from "../../../api/routineApi";
import {
    DumbbellIcon,
    BookOpenIcon,
    FlameIcon,
    ClockIcon,
    PlusIcon
} from "../../../components/Icons";

export default function SelfRoutinePage() {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyRoutines = async () => {
        try {
            setLoading(true);
            const res = await routineApi.getMyRoutines();
            const data = res.data?.data || res.data;

            const mapped = (data || []).map((item) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                repeatType: item.repeatType, // 0:Daily, 1:Weekly
                repeatDays: item.repeatDays,
                visibility: item.visibility,
                categoryName: item.category?.name,
                remindTime: item.remindTime,
                taskCount: item.tasks?.length ?? item.routineTasks?.length ?? item.taskCount ?? 0,
            }));

            setRoutines(mapped);
        } catch (err) {
            console.error("Failed to fetch my routines:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRoutines();
    }, []);

    const getIcon = (name) => {
        const lowerName = (name || "").toLowerCase();
        if (lowerName.includes("gym") || lowerName.includes("workout")) return <DumbbellIcon />;
        if (lowerName.includes("read") || lowerName.includes("study") || lowerName.includes("học")) return <BookOpenIcon />;
        if (lowerName.includes("medit") || lowerName.includes("thiền")) return <FlameIcon />;
        return <ClockIcon />;
    };

    const visibilityLabel = (value) => {
        if (value === 0) return "Private";
        if (value === 1) return "Public";
        if (value === 2) return "Subscribers";
        return "Unknown";
    };

    const repeatLabel = (repeatType, repeatDays) => {
        if (repeatType === 1) return `Weekly: ${repeatDays || "—"}`;
        return "Daily";
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24 relative">
            {/* Header */}
            <header className="p-4 md:max-w-md md:mx-auto pt-8 mb-4">
                <h1 className="text-3xl font-bold">Your Routine</h1>
            </header>

            <main className="px-4 md:max-w-md md:mx-auto">
                <div className="space-y-4">
                    {/* Routine List */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#d2fb05]"></div>
                        </div>
                    ) : routines.length > 0 ? (
                        routines.map((routine) => (
                            <Link
                                to={`/customer/selfroutin/${routine.id}`}
                                key={routine.id}
                                className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 flex items-start gap-3 hover:border-lime-400/50 transition-all active:scale-95"
                            >
                                <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-lime-400">
                                    {getIcon(routine.title)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-bold text-white text-lg">{routine.title}</h3>
                                    {routine.description && (
                                        <p className="text-sm text-zinc-500 line-clamp-2">{routine.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 text-[11px] text-zinc-300">
                                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                                            {repeatLabel(routine.repeatType, routine.repeatDays)}
                                        </span>
                                        {routine.remindTime && (
                                            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                                                Nhắc: {routine.remindTime}
                                            </span>
                                        )}
                                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                                            {visibilityLabel(routine.visibility)}
                                        </span>
                                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                                            {routine.taskCount} task
                                        </span>
                                        {routine.categoryName && (
                                            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                                                {routine.categoryName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-[#1a1a1a] rounded-2xl border border-dashed border-white/10">
                            <p className="text-zinc-500">Chưa có routine nào. Tạo mới nhé!</p>
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