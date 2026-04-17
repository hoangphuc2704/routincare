import React from 'react';
import { Link } from 'react-router-dom';
import { Archive, Target, Eye, Clock3 } from 'lucide-react';
import { repeatLabel, visibilityLabel } from '../utils/profileHelpers';

export default function RoutinesScreen({ routinesLoading, routines, isMe }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {routinesLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-lime-400"></div>
        </div>
      ) : routines.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900 rounded-3xl border border-dashed border-white/10">
          <Archive size={48} className="mx-auto text-neutral-800 mb-4" />
          <p className="text-neutral-500 font-medium">
            {isMe ? 'Chưa có routine nào. Tạo mới nhé!' : 'Thành viên này chưa có routine công khai.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide">
              {isMe ? 'Your Routines' : 'Public Routines'}
            </h3>
            <span className="text-xs text-neutral-500">{routines.length} mục</span>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
            {routines.map((routine) => (
              <Link
                to={`/customer/selfroutin/${routine.id}`}
                key={routine.id}
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black hover:border-lime-400/60 transition-all active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.22),transparent_45%)]" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center text-lime-300">
                    <Target size={18} />
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 via-black/55 to-transparent">
                  <h3 className="text-xs font-semibold text-white truncate">{routine.title}</h3>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-300">
                    <span>{routine.taskCount} task</span>
                    <span className="truncate ml-2">
                      {repeatLabel(routine.repeatType, routine.repeatDays)}
                    </span>
                  </div>
                  {isMe && (
                    <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={10} /> {visibilityLabel(routine.visibility)}
                      </span>
                      {routine.remindTime && (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={10} /> {routine.remindTime}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
