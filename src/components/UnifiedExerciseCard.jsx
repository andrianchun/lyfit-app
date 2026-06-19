import React from 'react';
import { Heart, Edit2, Trash2 } from 'lucide-react';
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
        {(() => {
           const ytId = getVideoId(ex.ytVideo);
           if (ytId) {
              return <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={ex.name} loading="lazy" className={`w-12 h-12 rounded-xl border ${t.border} object-cover flex-shrink-0 bg-black/5`} />;
           } else if (ex.gifUrl) {
              return <img src={ex.gifUrl} alt={ex.name} loading="lazy" className={`w-12 h-12 rounded-xl border ${t.border} object-cover flex-shrink-0 bg-black/5`} />;
           } else {
              return (
                <div className={`w-12 h-12 rounded-xl border ${t.border} flex items-center justify-center flex-shrink-0 ${t.inputBg}`}>
                  <EquipmentIcon equipment={ex.equipment} size={20} className={t.textMuted} />
                </div>
              );
           }
        })()}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="body-lg font-black text-slate-100 truncate flex items-center gap-1.5">
             {ex.name}
             {isCustom && <span className={`px-1.5 py-0.5 rounded font-black text-[10px] ${t.bgAccentSoft} ${t.textAccent}`}>C</span>}
          </h4>
          <p className={`body-md ${t.textAccent} truncate`}>{formatTarget(ex.target, lang?.id)}</p>
          <p className={`text-[10px] font-bold ${t.textMuted}`}>
            {ex.equipment || 'Lainnya'} · {exerciseTypeLabels[ex.type] || ex.type}
          </p>
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
                <Trash2 size={16} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UnifiedExerciseCard;
