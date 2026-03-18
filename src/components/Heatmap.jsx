import React from 'react';

export default function Heatmap({ data }) {
    // Generate last 12 months of dates (simplified for mockup)
    // In a real app, this would be much more complex to match days of week
    const weeks = 20; // Number of weeks to display
    const days = 7;
    
    // Mock data for the heatmap if none provided
    const internalData = data || Array.from({ length: weeks * days }, (_, i) => ({
        date: new Date(Date.now() - (weeks * days - i) * 86400000).toISOString().split('T')[0],
        score: Math.floor(Math.random() * 5)
    }));

    const getColor = (score) => {
        if (!score) return 'bg-zinc-900 border-white/5';
        if (score === 1) return 'bg-lime-900/40 border-lime-800/20';
        if (score === 2) return 'bg-lime-700/60 border-lime-600/20';
        if (score === 3) return 'bg-lime-500/80 border-lime-400/20';
        return 'bg-lime-400 border-lime-300/20';
    };

    return (
        <div className="flex flex-col gap-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 min-w-max pb-2">
                {Array.from({ length: weeks }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {Array.from({ length: days }).map((_, dayIndex) => {
                            const dataPoint = internalData[weekIndex * days + dayIndex];
                            return (
                                <div
                                    key={dayIndex}
                                    title={`${dataPoint?.date}: ${dataPoint?.score} points`}
                                    className={`w-3.5 h-3.5 rounded-sm border ${getColor(dataPoint?.score)} transition-colors hover:scale-125`}
                                ></div>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 mt-1 px-1">
                 <span className="text-[10px] text-zinc-500">Less</span>
                 <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-zinc-900 border border-white/5"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-lime-900/40"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-lime-700/60"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-lime-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-lime-400"></div>
                 </div>
                 <span className="text-[10px] text-zinc-500">More</span>
            </div>
        </div>
    );
}
