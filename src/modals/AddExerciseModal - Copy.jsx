import React, { useState } from 'react';
import { X, Search, Filter, Link as LinkIcon } from 'lucide-react';
import { formatTarget, muscleOptions } from '../data/constants';

const AddExerciseModal = ({
  t, lang, 
  activeAddModalTarget, setActiveAddModalTarget,
  exerciseLibrary, 
  onAddExerciseTarget, onCreateCustomExercise
}) => {
  // Semua state pencarian dan form kustom kita kurung di sini!
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customExForm, setCustomExForm] = useState({ name: '', targets: ['Dada'], type: 'weight', ytVideo: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('All');

  if (!activeAddModalTarget) return null;

  let filteredLib = exerciseLibrary.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()));
  if (filterMuscle !== 'All') {
      filteredLib = filteredLib.filter(ex => ex.target && ex.target.includes(filterMuscle));
  }

  const handleSaveCustom = () => {
    if (!customExForm.name.trim()) return;
    onCreateCustomExercise(customExForm);
    setIsCreatingCustom(false);
    setCustomExForm({ name: '', targets: ['Dada'], type: 'weight', ytVideo: '' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in">
      <div className={`w-full max-w-md mx-auto ${t.bgCard} rounded-t-3xl sm:rounded-3xl overflow-hidden border ${t.border} flex flex-col h-[85vh] sm:h-[80vh] shadow-2xl`}>
        
        <div className={`p-5 border-b ${t.border} flex justify-between items-center bg-black/5`}>
            <h3 className="font-black text-lg">{isCreatingCustom ? (lang.customEx || 'Buat Latihan Kustom') : (lang.searchLib || 'Cari di Library...')}</h3>
            <button onClick={() => {setActiveAddModalTarget(null); setIsCreatingCustom(false);}} className={`p-2 rounded-full ${t.btnBg} hover:text-rose-500`}><X size={20}/></button>
        </div>

        {isCreatingCustom ? (
          <div className="p-6 space-y-6 flex-1 overflow-y-auto hide-scrollbar">
            <div>
                <label className={`block text-xs font-black ${t.textMuted} mb-2 uppercase tracking-wider`}>Nama Latihan Kustom</label>
                <input type="text" value={customExForm.name} onChange={(e) => setCustomExForm({...customExForm, name: e.target.value})} placeholder="Misal: Hammer Curl..." className={`w-full ${t.inputBg} ${t.textMain} px-4 py-4 rounded-xl outline-none focus:ring-2 focus:${t.ringAccent} font-bold transition-shadow`} autoFocus />
            </div>
            <div>
                <label className={`block text-xs font-black ${t.textMuted} mb-2 uppercase tracking-wider`}>Target Otot (Multi-Pilih)</label>
                <div className="flex flex-wrap gap-2">
                    {muscleOptions.map(opt => (
                        <button key={opt} onClick={() => { setCustomExForm(prev => ({ ...prev, targets: prev.targets.includes(opt) ? prev.targets.filter(t => t !== opt) : [...prev.targets, opt] })) }} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${customExForm.targets.includes(opt) ? t.bgAccent + ' border-transparent' : t.inputBg + ' ' + t.textMuted + ' border-transparent'}`}>{opt}</button>
                    ))}
                </div>
            </div>
            <div>
                <label className={`block text-xs font-black ${t.textMuted} mb-2 uppercase tracking-wider flex items-center`}><LinkIcon size={14} className="mr-1"/> {lang.ytLink || 'Link Video YouTube'}</label>
                <input type="text" value={customExForm.ytVideo} onChange={(e) => setCustomExForm({...customExForm, ytVideo: e.target.value})} placeholder="https://youtube.com/shorts/..." className={`w-full ${t.inputBg} ${t.textMain} px-4 py-4 rounded-xl outline-none focus:ring-2 focus:${t.ringAccent} text-sm transition-shadow`} />
            </div>
            <div>
                <label className={`block text-xs font-black ${t.textMuted} mb-2 uppercase tracking-wider`}>Tipe Latihan</label>
                <select value={customExForm.type} onChange={(e) => setCustomExForm({...customExForm, type: e.target.value})} className={`w-full ${t.inputBg} ${t.textMain} px-4 py-4 rounded-xl outline-none font-bold cursor-pointer`}>
                    <option value="weight">Beban & Reps</option>
                    <option value="reps">Hanya Repetisi</option>
                    <option value="time">Hanya Durasi</option>
                </select>
            </div>
            <div className="flex space-x-4 mt-8 pt-4 border-t border-dashed border-slate-500/30">
                <button onClick={() => setIsCreatingCustom(false)} className={`flex-1 py-4 rounded-xl font-bold ${t.btnBg} ${t.textMuted}`}>{lang.cancel || 'Batal'}</button>
                <button onClick={handleSaveCustom} disabled={!customExForm.name} className={`flex-1 py-4 rounded-xl font-bold text-white transition-colors ${customExForm.name ? `${t.bgAccent}` : 'bg-slate-500 cursor-not-allowed'}`}>Simpan</button>
            </div>
          </div>
        ) : (
          <>
            <div className={`p-4 border-b ${t.border} shrink-0 space-y-3`}>
                <div className={`flex items-center ${t.inputBg} rounded-xl px-4 py-3 border border-transparent focus-within:${t.borderAccentSoft} transition-colors`}>
                    <Search size={20} className={t.textMuted} />
                    <input type="text" placeholder={lang.searchLib || 'Cari di Library...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`ml-3 bg-transparent w-full outline-none ${t.textMain} font-medium`} />
                </div>
                <div className="flex items-center space-x-2 w-full overflow-x-auto hide-scrollbar pb-1">
                     <div className={`flex items-center text-xs font-bold ${t.textMuted} whitespace-nowrap pl-1`}><Filter size={14} className="mr-1"/></div>
                     <button onClick={() => setFilterMuscle('All')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${filterMuscle === 'All' ? t.bgAccent + ' border-transparent' : t.inputBg + ' ' + t.textMuted + ' border-transparent'}`}>Semua</button>
                     {muscleOptions.map(m => (
                         <button key={m} onClick={() => setFilterMuscle(m)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${filterMuscle === m ? t.bgAccent + ' border-transparent' : t.inputBg + ' ' + t.textMuted + ' border-transparent'}`}>{m}</button>
                     ))}
                </div>
            </div>
            <div className="p-3 overflow-y-auto flex-1 hide-scrollbar">
              {filteredLib.map(ex => (
                <div key={ex.id} className={`flex justify-between items-center p-4 mb-2 rounded-xl ${t.bgApp} border border-transparent hover:${t.borderAccentSoft} transition-colors group`}>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm sm:text-base">{ex.name}</span>
                        <span className="text-[10px] uppercase font-bold text-amber-500">{formatTarget(ex.target)} • {ex.type === 'time' ? 'Time' : ex.type === 'reps' ? 'Reps Only' : 'Weight & Reps'}</span>
                    </div>
                    <button onClick={() => onAddExerciseTarget(ex)} className={`px-4 py-2 rounded-lg ${t.bgAccent} font-bold text-sm opacity-90 group-hover:opacity-100 transition-opacity`}>Tambah</button>
                </div>
              ))}
              {filteredLib.length === 0 && <div className="text-center py-6 font-bold text-zinc-500">Tidak ada latihan yang cocok.</div>}
              <div className="mt-6 px-2 pb-6">
                  <button onClick={() => setIsCreatingCustom(true)} className={`w-full py-5 border-2 border-dashed ${t.border} hover:${t.borderAccentSoft} rounded-2xl ${t.textAccent} font-bold hover:${t.bgAccentSoft} transition-all`}>+ {lang.customEx || 'Buat Latihan Kustom'}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddExerciseModal;