import React, { useState } from "react";
import BottomNav from "../../../components/BottomNav";
import ProfileTabs from "../../../components/ProfileTabs";
import UserHeader from "../../../components/UserHeader";
import TaskCard from "../../../components/TaskCard";
import {
  ChevronDownIcon,
  DumbbellIcon,
  BookOpenIcon,
} from "../../../components/Icons";

export default function MyFeedsPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Processing");

  const statusOptions = ["Queue", "Processing", "Completed", "Cancel"];

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
      <UserHeader />

      <main className="px-4 md:max-w-md md:mx-auto">
        <ProfileTabs activeTab="routine" />

        {/* Filter */}
        <div className="flex items-center justify-between mb-4 relative">
          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-orange-500/50 hover:bg-[#2a2a2a]"
            >
              <span className="text-orange-500 text-sm font-medium">
                {selectedStatus}
              </span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-32 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-xl z-30">
                {statusOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedStatus(option);
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#2a2a2a] ${selectedStatus === option
                        ? "text-orange-500 font-medium"
                        : "text-gray-300"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            {/* Queue */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full border-2 border-white mb-1"></div>
              <span className="text-xs font-bold">5</span>
            </div>

            {/* Processing */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center mb-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              </div>
              <span className="text-xs font-bold">2</span>
            </div>

            {/* Completed */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-[#d2fb05] flex items-center justify-center mb-1 text-black">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="w-2 h-2"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-xs font-bold">1</span>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </main>

      <BottomNav activeItem="target" />
    </div>
  );
}