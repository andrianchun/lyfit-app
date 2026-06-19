import React from 'react';
import { Trash2, SkipForward, Video, CheckCircle } from 'lucide-react';
import SwipeInput from './SwipeInput';
import { formatTarget } from '../data/constants';
import { playSoundEffect } from '../utils/audio';

const ExerciseCard = ({
  ex, idx, isExtra = false,
  t, lang, soundEnabled,
  isSkip, onToggleSkip, onRemoveExtra, onOpenVideo,
  sets, onUpdateSet, onToggleSet, onAddSet, onRemoveSet
}) => {
  const exType = ex.type || 'weight';
  const doneCount = sets.filter(s => s.done).length;
  const totalSets = sets.length;
  const isAllDone = doneCount === totalSets && totalSets > 0;
  const progressPercent = totalSets > 0 ? (doneCount / totalSets) * 100 : 0;

  return (
    <div className={`${t.bgCard} rounded-2xl p-4 sm:p-5 border ${isAllDone ? `${t.borderAccent} ${t.bgAccentSoft}` : t.border} ${isSkip ? 'opacity-50 grayscale' : ''} relative overflow-hidden shadow-sm transition-all`}>
      
      {/* HEADER KARTU */}
      <div className="flex justify-between items-start mb-3">
        <div className="pr-2">
           <h3 className={`font-bold text-[15px] sm:text-lg leading-tight ${isSkip ? 'line-through text-zinc-500' : t.textMain}`}>
              <span className={t.textAccent}>{isExtra ? '+' : `${idx + 1}.`}</span> {ex.name}
           </h3>
           <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${t.textMuted}`}>
              {formatTarget(ex.target)} • {exType === 'time' ? 'Time' : exType === 'reps' ? 'Reps' : 'Weight'}
           </span>
        </div>
        <div className="flex space-x-1 sm:space-x-2 shrink-0">
          {isExtra && (
              <button onClick={() => onRemoveExtra(ex.id)} className={`${t.textMuted} p-1.5 sm:p-2 ${t.btnBg} hover:bg-rose-500 hover:text-white rounded-xl transition-colors`}>
                  <Trash2 size={16} />
              </button>
          )}
          <button onClick={() => { playSoundEffect('click', soundEnabled); onToggleSkip(ex.id); }} className={`${t.textMuted} p-1.5 sm:p-2 ${isSkip ? 'bg-rose-500 text-white' : t.btnBg + ' hover:text-rose-500 hover:bg-rose-500/10'} rounded-xl transition-colors`}>
              <SkipForward size={16} className={isSkip ? "text-white" : ""} />
          </button>
          {ex.ytVideo && (
              <button onClick={() => { playSoundEffect('click', soundEnabled); onOpenVideo(ex); }} className={`${t.textMuted} p-1.5 sm:p-2 ${t.btnBg} rounded-xl hover:text-rose-500 transition-colors`}>
                  <Video size={16} />
              </button>
          )}
        </div>
      </div>
      
      {/* BARIS PROGRES */}
      <div className="mb-3">
         <div className={`text-xs ${t.textMuted} flex justify-between items-center`}>
             <span className={`${t.btnBg} px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider`}>Target: {totalSets} Sets</span>
             <span className={`font-extrabold text-xs ${t.textAccent}`}>{doneCount}/{totalSets} {lang.done}</span>
         </div>
         {!isSkip && (
             <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                 <div className={`h-full ${t.bgAccent} transition-all duration-500 ease-out`} style={{width: `${progressPercent}%`}}></div>
             </div>
         )}
      </div>

      {/* DAFTAR SET LATIHAN */}
      {!isSkip && (
        <div className="mt-3">
          <div className={`grid ${exType==='weight' ? 'grid-cols-[1.5fr_2.5fr_2.5fr_1.5fr]' : 'grid-cols-[1.5fr_3fr_1.5fr]'} gap-1 mb-1 px-1 text-[9px] font-black uppercase tracking-wider ${t.textMuted} text-center items-center`}>
            <div>{lang.set}</div>
            {exType === 'weight' && <div>kg</div>}
            {exType === 'time' && <div>Mins</div>}
            {(exType === 'weight' || exType === 'reps') && <div>Reps</div>}
            <div>{lang.done}</div>
          </div>

          {sets.map((s, setIdx) => (
            <div key={setIdx} className={`grid ${exType==='weight' ? 'grid-cols-[1.5fr_2.5fr_2.5fr_1.5fr]' : 'grid-cols-[1.5fr_3fr_1.5fr]'} gap-1 mb-1 items-center text-center transition-all ${s.done ? 'opacity-50' : ''}`}>
              
              <div className="relative flex justify-center">
                <div className={`text-xs font-bold rounded w-full max-w-[40px] h-8 flex items-center justify-center ${t.btnBg}`}>{setIdx + 1}</div>
                {setIdx === sets.length - 1 && (
                  <button onClick={() => onRemoveSet(ex.id, setIdx)} className="absolute -left-2 -top-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">×</button>
                )}
              </div>

              {exType === 'weight' && (
                <div><SwipeInput value={s.w} onChange={(val)=>onUpdateSet(ex.id, setIdx, 'w', val)} disabled={s.done} step={2.5} soundEnabled={soundEnabled} className={`w-full ${t.inputBg} h-8 rounded text-center font-black ${t.textMain} no-spinners transition-colors text-sm`} /></div>
              )}
              {exType === 'time' && (
                <div><SwipeInput value={s.d} onChange={(val)=>onUpdateSet(ex.id, setIdx, 'd', val)} disabled={s.done} step={1} soundEnabled={soundEnabled} className={`w-full ${t.inputBg} h-8 rounded text-center font-black ${t.textMain} no-spinners transition-colors text-sm`} /></div>
              )}
              {(exType === 'weight' || exType === 'reps') && (
                <div><SwipeInput value={s.r} onChange={(val)=>onUpdateSet(ex.id, setIdx, 'r', val)} disabled={s.done} step={1} soundEnabled={soundEnabled} className={`w-full ${t.inputBg} h-8 rounded text-center font-black ${t.textMain} no-spinners transition-colors text-sm`} /></div>
              )}

              <div className="flex justify-center">
                <button onClick={() => { playSoundEffect('click', soundEnabled); onToggleSet(ex.id, setIdx); }} className={`w-full max-w-[40px] h-8 rounded-lg flex justify-center items-center font-bold text-white transition-all ${s.done ? t.bgAccent : 'bg-black/10 dark:bg-white/10 text-black dark:text-white hover:bg-black/20 dark:hover:bg-white/20'}`}>
                  <CheckCircle size={16} />
                </button>
              </div>

            </div>
          ))}

          <button onClick={() => { playSoundEffect('click', soundEnabled); onAddSet(ex.id); }} className={`w-full mt-2 py-2 text-[11px] font-bold border-2 border-dashed ${t.border} rounded-lg ${t.textMuted} hover:${t.textAccent} transition-colors`}>
            + {lang.addSet || 'Tambah Set'}
          </button>
        </div>
      )}

    </div>
  );
};

export default ExerciseCard;