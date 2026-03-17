import React from "react";
import { Link } from "react-router-dom";
import BottomNav from "../../../components/BottomNav";
import TaskCard from "../../../components/TaskCard";
import {
    DumbbellIcon,
    BookOpenIcon,
} from "../../../components/Icons";

export default function SelfRoutinePage() {
    const tasks = [
        {
            id: 1,
            title: "Gym",
            progress: 68,
            description:
                "Category: Fitness\nTime: 6:30 AM – 7:30 AM\nDuration: 60 minutes\nFrequency: 5 days/week (Mon–Fri)",
            icon: <DumbbellIcon className="w-6 h-6" />,
            status: "Processing",
        },
        {
            id: 2,
            title: "Study",
            progress: 20,
            description:
                "Improve your English with a 1-hour nightly study.\nCategory: Learning\nTime: 8:00 PM – 9:00 PM\nDuration: 60 min",
            icon: <BookOpenIcon className="w-6 h-6" />,
            status: "Processing",
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24 relative">
            {/* Header */}
            <header className="p-4 md:max-w-md md:mx-auto pt-8 mb-4">
                <h1 className="text-3xl font-bold">Your Routine</h1>
            </header>

            <main className="px-4 md:max-w-md md:mx-auto">
                <div className="space-y-4">
                    {/* Task List */}
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}

                    {/* Add Button */}
                    <Link
                        to="/customer/selfroutin/workout"
                        className="w-full h-32 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-16 h-16"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </Link>
                </div>
            </main>

            <BottomNav activeItem="target" />
        </div>
    );
}