import React, { useState } from 'react';
import { X, Search, Replace } from 'lucide-react';
import { formatTarget, getVideoId } from '../data/constants';
import { playSoundEffect } from '../utils/audio';
import { getCachedExercises } from '../utils/exerciseDbApi';
import EquipmentIcon from './EquipmentIcon';

const AlternativeExerciseModal = ({ 
  isOpen, 
  onClose, 
  originalEx, 
  exerciseLibrary, 
  onSelectAlternative,
  t, 
  lang,
  soundEnabled
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineExercises, setOnlineExercises] = useState([]);
  
  React.useEffect(() => {
    setOnlineExercises(getCachedExercises());
  }, []);

  if (!isOpen || !originalEx) return null;

  const combinedLibrary = React.useMemo(() => {
    const localNames = new Set(exerciseLibrary.map(ex => ex.name.toLowerCase()));
    const onlineToAdd = onlineExercises.filter(ex => !localNames.has(ex.name.toLowerCase()));
    return [...exerciseLibrary, ...onlineToAdd];
  }, [exerciseLibrary, onlineExercises]);

  // Filter library: Must have at least one intersecting target muscle OR body part
  let alternatives = combinedLibrary.filter(ex => {
    if (ex.id === originalEx.id) return false;
    
    // Check if targets intersect
    const hasSameTarget = ex.target?.some(t => originalEx.target?.includes(t));
    const hasSameBodyPart = ex.bodyParts?.some(b => originalEx.bodyParts?.includes(b));
    
    // Smart search logic
    let matchesSearch = true;
    if (searchTerm.trim()) {
      const queryWords = searchTerm.toLowerCase().trim().split(/\s+/);
      const nameStr = ex.name.toLowerCase();
      const targetStr = ex.target ? formatTarget(ex.target, lang?.id).toLowerCase() : '';
      matchesSearch = queryWords.every(word => nameStr.includes(word) || targetStr.includes(word));
    }

    return (hasSameTarget || hasSameBodyPart) && matchesSearch;
  });

  // Limit to 100 for performance
  alternatives = alternatives.slice(0, 100);

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in`} onClick={onClose}>
      <div className={`w-full max-w-md mx-auto ${t.bgCard} rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border ${t.border}`} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className={`p-4 border-b ${t.border} flex justify-between items-center`}>
          <div>
            <h3 className={`font-black h2 ${t.textMain}`}>Alternatif Latihan</h3>
            <p className={`body-md ${t.textMuted}`}>Pengganti untuk {originalEx.name}</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors ${t.textMain}`}>
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className={`p-4 border-b ${t.border} bg-black/5`}>
          <div className="relative">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textMuted}`} />
            <input 
              type="text"
              placeholder="Cari alternatif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl ${t.inputBg} ${t.textMain} body-lg font-bold outline-none focus:ring-2 ${t.ringAccent} transition-all`}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {alternatives.length === 0 ? (
            <div className={`text-center py-12 ${t.textMuted}`}>
              <p className="body-lg font-bold">Tidak ada alternatif yang mirip.</p>
            </div>
          ) : (
            alternatives.map(ex => (
              <div 
                key={ex.id}
                onClick={() => {
                  playSoundEffect('click', soundEnabled);
                  const exToAdd = ex.source === 'exercisedb' ? { ...ex, id: Date.now() + Math.floor(Math.random() * 1000) } : ex;
                  onSelectAlternative(exToAdd);
                }}
                className={`p-3 rounded-2xl border ${t.border} ${t.bgCard} flex items-center justify-between gap-3 hover:${t.borderAccentSoft} cursor-pointer transition-all active:scale-95`}
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl bg-black/5 flex-shrink-0 flex items-center justify-center overflow-hidden border border-black/5">
                   {(() => {
                      const ytId = getVideoId(ex.ytVideo);
                      if (ex.gifUrl) {
                         return <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover opacity-80" />;
                      } else if (ytId) {
                         return <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} alt={ex.name} className="w-full h-full object-cover opacity-80" />;
                      } else {
                         return <EquipmentIcon equipment={ex.equipment} size={20} className={t.textMuted} />;
                      }
                   })()}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-black body-lg ${t.textMain} truncate flex items-center gap-1`}>
                    {ex.name}
                    {ex.source === 'exercisedb' && <span className={`px-1 py-0.5 rounded text-[8px] ${t.bgAccentSoft} ${t.textAccent} uppercase tracking-wider`}>Online</span>}
                  </h4>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {ex.target?.map(m => (
                      <span key={m} className={`px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800/50 text-slate-300 border border-slate-700/50`}>{formatTarget(m, lang?.id)}</span>
                    ))}
                  </div>
                </div>

                <div className={`p-2 rounded-xl ${t.bgAccentSoft} ${t.textAccent}`}>
                  <Replace size={18} />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default AlternativeExerciseModal;
