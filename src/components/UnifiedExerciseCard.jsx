import React from 'react';
import { Heart, Edit2, X } from 'lucide-react';
import { formatTarget, getVideoId, exerciseTypeLabels } from '../data/constants';
import EquipmentIcon from './EquipmentIcon';

const UnifiedExerciseCard = ({ t, lang, ex, onEdit, onDelete, onToggleFavorite, index, onOpenDetail, isCustom, actionButton }) => {
  const isFav = !!ex.isFavorite;
  
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border ${t.border} ${t.bgCard} shadow-sm hover:shadow-md transition-all duration-200 group`}
      style={index !== undefined ? { animationDelay: `${(index % 15) * 20}ms` } : {}}
    >
      {/* Clickable Area for Detail */}
      <div 
        className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
        onClick={onOpenDetail}
      >
        {/* Thumbnail or Equipment Icon */}
        <div className="relative inline-block flex-shrink-0">
          <div className={`w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center overflow-hidden border ${t.border} relative`}>
            {(() => {
               const ytId = getVideoId(ex.ytVideo);
               if (ytId) {
                  return <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={ex.name} loading="lazy" className="w-full h-full object-cover" />;
               } else if (ex.gifUrl) {
                  return <img src={ex.gifUrl} alt={ex.name} loading="lazy" className="w-full h-full object-cover" />;
               } else {
                  return <EquipmentIcon equipment={ex.equipment} size={20} className={t.textMuted} />;
               }
            })()}
            {isCustom && <div className="absolute bottom-0 inset-x-0 bg-slate-900/90 backdrop-blur text-emerald-400 text-[6.5px] font-black uppercase tracking-widest text-center py-0.5 leading-none">CUSTOM</div>}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className={`body-lg font-black ${t.textMain} truncate flex items-center gap-1.5 flex-wrap`}>
             {ex.name}
          </h4>
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex gap-1.5 flex-wrap items-center">
               <span className={`text-[10px] font-black uppercase tracking-wider ${t.textAccent}`}>{ex.equipment || 'Lainnya'}</span>
               <span className={`text-[10px] font-bold ${t.textMuted}`}>•</span>
               <span className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted}`}>{exerciseTypeLabels[ex.type] || ex.type}</span>
            </div>
            <div className="flex gap-1 flex-wrap items-center -ml-1.5">{Array.isArray(ex.target) ? ex.target.map(m => (
                <span key={m} className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${t.inputBg} ${t.textMuted} border ${t.border}`}>{formatTarget(m, lang?.id)}</span>
              )) : ex.target && (
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${t.inputBg} ${t.textMuted} border ${t.border}`}>{formatTarget(ex.target, lang?.id)}</span>
              )}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 flex-shrink-0 z-10">
        {actionButton ? actionButton : (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(ex); }}
              className={`p-2.5 rounded-xl transition-all ${isFav ? t.bgAccentSoft + ' ' + t.textAccent : `${t.inputBg} ${t.textMuted} hover:${t.textAccent}`} active:scale-90`}
              title={isFav ? "Hapus dari Favorit" : "Tambah ke Favorit"}
            >
              <Heart size={16} fill={isFav ? "currentColor" : "none"} className={isFav ? t.textAccent : ""} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit && onEdit(ex); }}
              className={`p-2.5 rounded-xl ${t.inputBg} ${t.textAccent} hover:opacity-80 active:scale-90 transition-all opacity-70 group-hover:opacity-100`}
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            {isCustom && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete && onDelete(ex); }}
                className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 active:scale-90 transition-all opacity-70 group-hover:opacity-100"
                title="Hapus"
              >
                <X size={16} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UnifiedExerciseCard;
