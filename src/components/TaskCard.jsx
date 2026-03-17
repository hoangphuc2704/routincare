import React from 'react';

export default function TaskCard({ task }) {
    return (
        <div className="bg-[#1a1a1a] rounded-2xl p-4">

            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-black">
                        {task.icon}
                    </div>

                    <h3 className="text-2xl font-bold">
                        {task.title}
                    </h3>
                </div>

                <span className="text-2xl font-bold">
                    {task.progress}%
                </span>
            </div>

            <div className="mb-2">
                <span className="text-[#d2fb05] text-sm font-semibold">
                    Description:
                </span>

                <p className="text-xs text-gray-300 whitespace-pre-line mt-1 leading-relaxed">
                    {task.description}
                </p>
            </div>

            <div className="flex justify-end mt-2">
                <span className="text-xs text-gray-400">
                    Status: {task.status}
                </span>
            </div>

        </div>
    );
}