import React from 'react';
import { FolderHeart } from 'lucide-react';

/**
 * Shared program card used identically in:
 *  - CreatePostModal (staging preview)
 *  - CommunityTab feed
 *
 * Props:
 *  post     – the post / postDataOverrides object
 *  isDark   – boolean
 *  t        – theme tokens (textMain, textMuted, border, etc.)
 */
export default function ProgramCard({ post, isDark, t }) {
  const programName = post.programName || post.programData?.name || 'Custom Program';
  const routines    = post.routines    || post.programData?.routines || [];
  const exercises   = post.exercises   || post.programData?.exercises || [];

  // Prefer routines structure; fall back to flat list
  const hasRoutines = routines.length > 0;

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-black/8'}`}>

      {/* ── Header ── */}
      <div className={`flex items-center gap-3 px-4 py-3 ${isDark ? 'bg-sky-500/10 border-b border-white/10' : 'bg-sky-50 border-b border-black/8'}`}>
        <div className={`p-2 rounded-xl shrink-0 ${isDark ? 'bg-sky-500/20' : 'bg-sky-100'}`}>
          <FolderHeart size={15} className="text-sky-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
            Program Latihan
          </p>
          <h4 className={`font-black text-sm leading-tight truncate ${isDark ? 'text-white' : 'text-black'}`}>
            {programName}
          </h4>
        </div>
        <p className={`text-[10px] font-bold shrink-0 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
          {hasRoutines ? `${routines.length} Hari` : `${exercises.length} Latihan`}
        </p>
      </div>

      {/* ── Routines view ── */}
      {hasRoutines && (
        <div className="px-4 py-2 flex flex-col divide-y divide-white/5">
          {routines.map((routine, ri) => (
            <div key={ri} className="py-2.5">
              <p className={`text-[11px] font-black mb-1.5 ${isDark ? 'text-white/90' : 'text-black/80'}`}>
                {routine.name}
              </p>
              <div className="flex flex-wrap gap-1">
                {(routine.exercises || []).map((ex, ei) => (
                  <span
                    key={ei}
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-white/8 text-white/55' : 'bg-black/6 text-black/50'
                    }`}
                  >
                    {ex.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Flat exercise list fallback ── */}
      {!hasRoutines && exercises.length > 0 && (
        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {exercises.slice(0, 12).map((ex, i) => (
              <span
                key={i}
                className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-white/8 text-white/55' : 'bg-black/6 text-black/50'
                }`}
              >
                {ex.name}
              </span>
            ))}
            {exercises.length > 12 && (
              <span className={`text-[9px] font-bold px-2 py-0.5 ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                +{exercises.length - 12} lagi
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
