import React from 'react';

export default function Heatmap({ data }) {
    const weeks = 20; // Number of weeks to display
    const days = 7;

    const toNumber = (value) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    };

    const toDateKey = (value) => {
        if (!value) return null;
        if (typeof value === 'string') return value.slice(0, 10);
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        return d.toISOString().slice(0, 10);
    };

    const normalizeScore = (raw) => {
        // Normalize to 0..4 intensity levels.
        const v = toNumber(raw);
        if (v <= 0) return 0;
        if (v <= 1) return 1;
        if (v <= 2) return 2;
        if (v <= 4) return 3;
        return 4;
    };

    const scoreByDate = new Map();
    (Array.isArray(data) ? data : []).forEach((item) => {
        const dateKey = toDateKey(item?.date || item?.day || item?.summaryDate);
        if (!dateKey) return;
        const rawScore =
            item?.score ??
            item?.count ??
            item?.value ??
            item?.completedTasks ??
            item?.completedCount ??
            0;
        scoreByDate.set(dateKey, normalizeScore(rawScore));
    });

    const totalCells = weeks * days;
    const internalData = Array.from({ length: totalCells }, (_, i) => {
        const diff = totalCells - 1 - i;
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - diff);
        const key = d.toISOString().slice(0, 10);
        return {
            date: key,
            score: scoreByDate.get(key) ?? 0,
        };
    });

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
                                    title={`${dataPoint?.date}: ${dataPoint?.score} activity`}
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
