import React, { useState } from 'react';
import { X, Search, Trash2 } from 'lucide-react';
import { formatTarget } from '../data/constants';
import { playSoundEffect } from '../utils/audio';

const LibManagerModal = ({ showLibManager, setShowLibManager, t, exerciseLibrary, setExerciseLibrary, soundEnabled }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!showLibManager) return null;

  const filteredLib = exerciseLibrary.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDelete = (id) => {
    playSoundEffect('click', soundEnabled);
    if (window.confirm('Yakin ingin menghapus latihan ini dari database master?')) {
        setExerciseLibrary(exerciseLibrary.filter(ex => ex.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in">
      <div className={`w-full max-w-lg mx-auto ${t.bgCard} rounded-t-3xl sm:rounded-3xl overflow-hidden border ${t.border} flex flex-col h-[85vh] sm:h-[80vh] shadow-2xl`}>
         
         <div className={`p-5 border-b ${t.border} flex justify-between items-center bg-black/5`}>
            <h3 className="font-black text-lg">Kelola Database Latihan</h3>
            <button onClick={() => setShowLibManager(false)} className={`p-2 rounded-full ${t.btnBg} hover:text-rose-500`}><X size={20}/></button>
         </div>
         
         <div className={`p-4 border-b ${t.border} shrink-0`}>
            <div className={`flex items-center ${t.inputBg} rounded-xl px-4 py-3 border border-transparent focus-within:${t.borderAccentSoft} transition-colors`}>
                <Search size={20} className={t.textMuted} />
                <input type="text" placeholder="Cari latihan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`ml-3 bg-transparent w-full outline-none ${t.textMain} font-medium`} />
            </div>
         </div>
         
         <div className="p-3 overflow-y-auto flex-1 hide-scrollbar">
            {filteredLib.map(ex => (
                <div key={ex.id} className={`flex justify-between items-center p-4 mb-2 rounded-xl ${t.bgApp} border border-transparent hover:${t.borderAccentSoft} transition-colors group`}>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm sm:text-base">{ex.name}</span>
                        <span className="text-[10px] uppercase font-bold text-amber-500">{formatTarget(ex.target)} • {ex.type === 'time' ? 'Time' : ex.type === 'reps' ? 'Reps Only' : 'Weight & Reps'}</span>
                    </div>
                    <button onClick={() => handleDelete(ex.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={18}/></button>
                </div>
            ))}
            {filteredLib.length === 0 && <div className="text-center py-6 font-bold text-zinc-500">Tidak ada latihan yang cocok.</div>}
         </div>
         
      </div>
    </div>
  );
};

export default LibManagerModal;