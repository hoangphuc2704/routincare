import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../../../components/BottomNav";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    DumbbellIcon,
    CheckIcon,
    PauseIcon,
} from "../../../../components/Icons";

export default function WorkoutPage() {
    const navigate = useNavigate();

    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const activeDays = [0, 1, 2, 3, 4, 6];

    const exercises = [
        { id: 1, title: "Flat Barbell Bench Press", status: "completed" },
        { id: 2, title: "Incline Dumbbell Press", status: "completed" },
        {
            id: 3,
            title: "Cable Fly (High to Low)",
            status: "active",
            sets: [
                { id: 1, reps: 15, checked: true },
                { id: 2, reps: 15, checked: false },
                { id: 3, reps: 12, checked: false },
            ],
        },
        { id: 4, title: "Push-up (Till Failure)", status: "pending" },
        { id: 5, title: "Cardio Finisher", status: "pending" },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24">
            {/* Header */}
            <header className="p-4 flex flex-col md:max-w-md md:mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white/70 hover:bg-[#2a2a2a] transition-colors"
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4">
                        <button className="text-gray-500">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>

                        <h1 className="text-2xl font-bold tracking-wide">Gym</h1>

                        <button className="text-gray-500">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="w-10"></div>
                </div>

                {/* Days */}
                <div className="flex justify-between items-center mb-6 px-2">
                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${activeDays.includes(index)
                                ? "border-[#d2fb05] text-[#d2fb05]"
                                : "border-white/20 text-white/50"
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="text-[#d2fb05]">
                        <DumbbellIcon className="w-8 h-8" />
                    </div>

                    <div className="w-8 h-8 border-2 border-[#ff9f0a] rounded-full flex items-center justify-center text-[10px] font-bold text-white relative">
                        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ff9f0a] rotate-45"></span>
                        68%
                    </div>

                    <div className="flex-1 bg-[#1a1a1a] h-10 rounded-full flex items-center px-4 relative overflow-hidden">
                        <div className="absolute left-1 top-1 bottom-1 w-[40%] bg-[#d2fb05] rounded-full"></div>
                        <span className="relative ml-auto font-bold text-white pr-2">
                            40%
                        </span>
                    </div>
                </div>

                {/* Exercises */}
                <div className="space-y-3">
                    {exercises.map((exercise) => (
                        <div key={exercise.id}>
                            {/* Completed */}
                            {exercise.status === "completed" && (
                                <div className="bg-[#d2fb05] rounded-full py-4 px-6 flex items-center justify-between text-black font-bold">
                                    <span>{exercise.title}</span>
                                    <CheckIcon className="w-6 h-6" />
                                </div>
                            )}

                            {/* Active */}
                            {exercise.status === "active" && (
                                <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-gray-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-bold">{exercise.title}</span>
                                        <div className="w-6 h-6 rounded-full border-2 border-[#d2fb05] border-t-transparent animate-spin"></div>
                                    </div>

                                    <div className="bg-[#d2fb05] rounded-full px-4 py-1.5 inline-flex items-center gap-2 mb-4">
                                        <span className="font-bold text-black text-sm">Done</span>
                                        <CheckIcon className="w-4 h-4 text-black" />
                                    </div>

                                    <div className="space-y-3">
                                        {exercise.sets?.map((set) => (
                                            <div key={set.id} className="flex items-center gap-4">
                                                <span className="font-bold text-xl w-4">
                                                    {set.id}
                                                </span>

                                                <div className="bg-[#d2fb05] text-black font-bold rounded-full px-6 py-1 min-w-[3rem] text-center">
                                                    {set.reps}
                                                </div>

                                                <div
                                                    className={`w-5 h-5 rounded-full border-2 ${set.checked
                                                        ? "bg-[#d2fb05] border-[#d2fb05]"
                                                        : "border-gray-600"
                                                        }`}
                                                ></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pending */}
                            {exercise.status === "pending" && (
                                <div className="bg-[#1a1a1a] rounded-full py-4 px-6 flex items-center justify-between border border-gray-800">
                                    <span>{exercise.title}</span>
                                    <button className="text-[#d2fb05]">
                                        <PauseIcon className="w-8 h-8" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </header>

            <BottomNav activeItem="target" />
        </div>
    );
}