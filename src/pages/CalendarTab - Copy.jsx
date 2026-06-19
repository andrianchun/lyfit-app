import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info, CheckCircle, CalendarDays, Edit2, PlayCircle, Trash2, X, Copy, Repeat, ArrowRightLeft } from 'lucide-react';
import { getLocalYMD } from '../data/constants';

const CalendarTab = ({ t, lang, theme, history, setHistory, programs, soundEnabled, playSoundEffect, navigateToWorkoutDate }) => {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [activeDateModal, setActiveDateModal] = useState(null);
  
  // State untuk Fitur Copy/Move/Repeat
  const [showActionMenu, setShowActionMenu] = useState(null); 
  const [targetDateInput, setTargetDateInput] = useState('');
  const [repeatDays, setRepeatDays] = useState(1);
  const [repeatCount, setRepeatCount] = useState(4);
  const [draggedDate, setDraggedDate] = useState(null);

  const getDayHistory = (dateStr) => {
    const val = history[dateStr]; if (!val) return null;
    if (typeof val === 'string') { const p = programs.find(prog => prog.name === val); return { programId: p?.id, programName: val, status: 'completed', log: {} }; }
    if (val.programId && !val.programName) { const p = programs.find(prog => prog.id === val.programId); val.programName = p ? p.name : 'Unknown'; }
    return val;
  };

  const copyLastWeekSchedule = () => {
    playSoundEffect('click', soundEnabled);
    const today = new Date(); today.setHours(0,0,0,0); const newHistory = { ...history }; let copiedCount = 0;
    for(let i=0; i<7; i++) {
      const targetDate = new Date(today); targetDate.setDate(today.getDate() + i);
      const sourceDate = new Date(targetDate); sourceDate.setDate(targetDate.getDate() - 7);
      const targetStr = getLocalYMD(targetDate); const sourceStr = getLocalYMD(sourceDate);
      const srcData = getDayHistory(sourceStr);
      if (srcData && srcData.programId) { newHistory[targetStr] = { programId: srcData.programId, programName: srcData.programName, status: 'planned', log: {} }; copiedCount++; }
    }
    setHistory(newHistory); 
    alert(copiedCount > 0 ? 'Jadwal 7 hari disalin!' : 'Tidak ada jadwal di minggu lalu.');
  };

  // FUNGSI COPY / MOVE MANUAL
  const handleCopyOrMove = (actionType) => {
    if (!targetDateInput) return alert('Silakan pilih tanggal tujuan terlebih dahulu!');
    playSoundEffect('click', soundEnabled);
    
    const h = { ...history };
    const sourceData = h[activeDateModal];
    if (!sourceData) return;
    
    h[targetDateInput] = {
        programId: sourceData.programId,
        programName: sourceData.programName,
        status: 'planned', 
        log: {}
    };
    
    if (actionType === 'move') h[activeDateModal] = null;
    
    setHistory(h);
    setActiveDateModal(null);
    setShowActionMenu(null);
  };

  // FUNGSI RECURRING (ULANGI BERKALA)
  const handleRepeat = () => {
    playSoundEffect('click', soundEnabled);
    const h = { ...history };
    const sourceData = h[activeDateModal];
    if (!sourceData) return;

    let copied = 0;
    const baseDate = new Date(activeDateModal);
    
    for (let i = 1; i <= repeatCount; i++) {
        const targetDate = new Date(baseDate);
        targetDate.setDate(baseDate.getDate() + (repeatDays * i));
        const targetStr = getLocalYMD(targetDate);
        h[targetStr] = {
            programId: sourceData.programId,
            programName: sourceData.programName,
            status: 'planned',
            log: {}
        };
        copied++;
    }
    
    setHistory(h);
    setActiveDateModal(null);
    setShowActionMenu(null);
    alert(`Berhasil menjadwalkan ulang sebanyak ${copied} kali!`);
  };

  // FUNGSI DRAG & DROP (DESKTOP)
  const handleDragStart = (e, dateStr) => {
    setDraggedDate(dateStr);
    e.dataTransfer.setData('text/plain', dateStr);
  };
  const handleDrop = (e, targetDateStr) => {
    e.preventDefault();
    if (!draggedDate || draggedDate === targetDateStr) return;
    const h = { ...history };
    const sourceData = h[draggedDate];
    if (!sourceData) return;

    h[targetDateStr] = {
        programId: sourceData.programId,
        programName: sourceData.programName,
        status: 'planned', 
        log: {}
    };
    h[draggedDate] = null; 
    setHistory(h);
    setDraggedDate(null);
    playSoundEffect('click', soundEnabled);
  };

  const year = calendarDate.getFullYear(); const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate(); const startDay = new Date(year, month, 1).getDay(); 
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1); const blanks = Array.from({ length: startDay }, (_, i) => i);
  const isID = lang.workout === 'Latihan';
  const monthName = calendarDate.toLocaleDateString(isID ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });
  const todayStr = getLocalYMD(new Date());

  // Bagian Modal Data
  const modalData = activeDateModal ? getDayHistory(activeDateModal) : null; 
  const isCompleted = modalData?.status === 'completed'; 
  const isPlanned = modalData?.status === 'planned';
  const modalProgram = isCompleted || isPlanned ? programs.find(p => p.id === modalData.programId) : null;
  const combinedLogExercises = []; 
  if (modalProgram) combinedLogExercises.push(...modalProgram.exercises); 
  if (modalData?.log?.extraExercises) combinedLogExercises.push(...modalData.log.extraExercises);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* KALENDER UTAMA */}
      <div className={`${t.bgCard} rounded-xl p-4 border ${t.border} shadow-sm`}>
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => { playSoundEffect('click', soundEnabled); setCalendarDate(new Date(year, month - 1, 1));}} className={`p-2 rounded-lg ${t.btnBg} hover:${t.bgAccentSoft} hover:${t.textAccent} transition-colors`}><ChevronLeft size={20}/></button>
          <h2 className={`text-lg font-bold ${t.textMain} uppercase tracking-wider`}>{monthName}</h2>
          <button onClick={() => { playSoundEffect('click', soundEnabled); setCalendarDate(new Date(year, month + 1, 1));}} className={`p-2 rounded-lg ${t.btnBg} hover:${t.bgAccentSoft} hover:${t.textAccent} transition-colors`}><ChevronRight size={20}/></button>
        </div>
        
        <div className="flex justify-between items-center mb-4 border-b border-dashed pb-3 border-slate-500/30">
           <div className={`text-xs ${t.textMuted} flex items-center`}><Info size={14} className="mr-1"/> Tip: Geser (Drag) jadwal di PC</div>
           <button onClick={copyLastWeekSchedule} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${t.bgAccentSoft} ${t.textAccent} hover:opacity-70 transition-opacity`}>+ Ulangi 7 Hari Lalu</button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (<div key={i} className={`text-center text-xs font-bold ${t.textMuted}`}>{day}</div>))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {blanks.map(b => <div key={`blank-${b}`} className="p-2"></div>)}
          {days.map(day => {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = getDayHistory(dateKey); const isToday = dateKey === todayStr; const isDayCompleted = dayData?.status === 'completed'; const isDayPlanned = dayData?.status === 'planned';
            let cellStyle = `border border-transparent hover:border-slate-500/30 ${t.textMain}`;
            if (isDayCompleted) cellStyle = `${t.bgAccent} shadow-sm`; 
            else if (isDayPlanned) cellStyle = `${t.bgAccentSoft} border-dashed ${t.borderAccentSoft} ${t.textAccent}`;
            if (isToday && !isDayCompleted && !isDayPlanned) cellStyle = `ring-2 ${t.ringAccent} ${t.textMain}`;
            if (isToday && (isDayCompleted || isDayPlanned)) cellStyle += ` ring-2 ring-offset-2 ring-offset-${theme==='dark'?'black':'white'} ${t.ringAccent}`;
            
            return (
              <div 
                key={day} 
                onClick={() => { playSoundEffect('click', soundEnabled); setActiveDateModal(dateKey);}} 
                draggable={!!dayData}
                onDragStart={(e) => handleDragStart(e, dateKey)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, dateKey)}
                className={`aspect-square p-1 relative flex flex-col items-center justify-start rounded-lg transition-all cursor-pointer ${cellStyle}`}
              >
                <span className={`text-sm font-medium ${isDayCompleted ? 'text-white' : ''}`}>{day}</span>
                {dayData && <span className={`text-[8px] leading-tight font-bold text-center w-full truncate px-1 mt-1 rounded ${isDayCompleted ? 'text-white/90' : t.textAccent}`}>{dayData.programName}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL KETIKA TANGGAL DIKLIK */}
      {activeDateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in">
           <div className={`w-full max-w-sm mx-auto ${t.bgCard} rounded-t-3xl sm:rounded-3xl overflow-hidden border ${t.border} p-5 pb-8 sm:pb-5 shadow-2xl max-h-[85vh] flex flex-col`}>
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="font-black text-lg">{new Date(activeDateModal).toLocaleDateString(isID ? 'id-ID' : 'en-US', {dateStyle:'long'})}</h3>
                <button onClick={() => {setActiveDateModal(null); setShowActionMenu(null);}} className={`p-2 rounded-full ${t.btnBg} hover:text-rose-500`}><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1">
                  {(isCompleted || isPlanned) && (
                      <div className="flex space-x-2 mb-4">
                          <button onClick={() => { playSoundEffect('click', soundEnabled); setShowActionMenu(showActionMenu === 'copyMove' ? null : 'copyMove');}} className={`flex-1 py-2 rounded-xl text-[10px] sm:text-xs font-bold ${t.btnBg} border ${showActionMenu === 'copyMove' ? t.borderAccent : t.border} flex items-center justify-center transition-colors`}><Copy size={14} className="mr-1"/> Salin/Pindah</button>
                          <button onClick={() => { playSoundEffect('click', soundEnabled); setShowActionMenu(showActionMenu === 'repeat' ? null : 'repeat');}} className={`flex-1 py-2 rounded-xl text-[10px] sm:text-xs font-bold ${t.btnBg} border ${showActionMenu === 'repeat' ? t.borderAccent : t.border} flex items-center justify-center transition-colors`}><Repeat size={14} className="mr-1"/> Ulangi Jadwal</button>
                      </div>
                  )}

                  {/* MENU SALIN / PINDAH */}
                  {showActionMenu === 'copyMove' && (
                     <div className={`p-3 rounded-xl mb-4 bg-black/5 dark:bg-white/5 border border-dashed ${t.border} animate-in zoom-in-95`}>
                         <label className="text-xs font-bold mb-2 block">Pilih Tanggal Tujuan:</label>
                         <input type="date" value={targetDateInput} onChange={(e) => setTargetDateInput(e.target.value)} className={`w-full ${t.inputBg} ${t.textMain} px-3 py-2 rounded-lg text-sm mb-3 outline-none focus:ring-1 focus:${t.ringAccent}`} />
                         <div className="flex space-x-2">
                             <button onClick={() => handleCopyOrMove('copy')} className={`flex-1 py-2 rounded-lg font-bold text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20`}>Salin ke Sini</button>
                             <button onClick={() => handleCopyOrMove('move')} className={`flex-1 py-2 rounded-lg font-bold text-xs bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20`}>Pindah ke Sini</button>
                         </div>
                     </div>
                  )}

                  {/* MENU RECURRING */}
                  {showActionMenu === 'repeat' && (
                     <div className={`p-3 rounded-xl mb-4 bg-black/5 dark:bg-white/5 border border-dashed ${t.border} animate-in zoom-in-95`}>
                         <div className="flex justify-between items-center mb-3">
                             <span className="text-xs font-bold">Ulangi setiap</span>
                             <div className="flex items-center space-x-2">
                                <input type="number" value={repeatDays} onChange={(e) => setRepeatDays(Number(e.target.value))} className={`w-16 ${t.inputBg} ${t.textMain} px-2 py-1 rounded-lg text-sm text-center outline-none`} min="1" />
                                <span className="text-xs font-bold w-6">Hari</span>
                             </div>
                         </div>
                         <div className="flex justify-between items-center mb-3">
                             <span className="text-xs font-bold">Sebanyak</span>
                             <div className="flex items-center space-x-2">
                                <input type="number" value={repeatCount} onChange={(e) => setRepeatCount(Number(e.target.value))} className={`w-16 ${t.inputBg} ${t.textMain} px-2 py-1 rounded-lg text-sm text-center outline-none`} min="1" />
                                <span className="text-xs font-bold w-6">Kali</span>
                             </div>
                         </div>
                         <button onClick={handleRepeat} className={`w-full py-2 rounded-lg font-bold text-xs ${t.bgAccent} text-white hover:opacity-90`}>Terapkan Jadwal Berkala</button>
                     </div>
                  )}

                  {isCompleted && modalProgram ? (
                    <>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 font-bold text-xs mb-4 border border-emerald-500/30"><CheckCircle size={14} className="mr-1"/> Selesai: {modalProgram.name}</div>
                      <h4 className={`font-bold text-sm ${t.textMuted} mb-3`}>Ringkasan Latihan:</h4>
                      <div className="space-y-3 mb-6">
                        {combinedLogExercises.map(ex => {
                           const sets = modalData.log?.exerciseLogs?.[ex.id] || [];
                           const done = sets.filter(s=>s.done).length;
                           const maxW = Math.max(...sets.map(s=>s.w||0), 0);
                           const maxR = Math.max(...sets.map(s=>s.r||0), 0);
                           const skipped = modalData.log?.skippedExercises?.[ex.id]; const exType = ex.type || 'weight';
                           return (
                             <div key={ex.id} className={`p-3 rounded-xl bg-black/5 dark:bg-white/5 flex flex-col ${skipped ? 'opacity-50' : ''}`}>
                                <span className="font-bold text-sm mb-1">{ex.name}</span>
                                <div className={`flex justify-between text-xs font-bold ${t.textMuted}`}><span>{skipped ? 'Skipped' : `${done}/${sets.length} Sets`}</span>{!skipped && (<span className={t.textAccent}>{exType === 'weight' ? `Max: ${maxR}R × ${maxW}kg` : exType === 'reps' ? `Max: ${maxR} Reps` : `Max: ${maxW} Mins`}</span>)}</div>
                             </div>
                           )
                        })}
                      </div>
                      <button onClick={() => { setActiveDateModal(null); navigateToWorkoutDate(activeDateModal, modalProgram.id); }} className={`w-full p-4 rounded-xl font-bold text-white transition-colors bg-gradient-to-r ${t.gradientBg} shadow-lg ${t.shadowAccent} flex justify-center items-center`}><Edit2 size={18} className="mr-2"/> Edit Riwayat Ini</button>
                    </>
                  ) : (
                    <>
                      {isPlanned && <div className={`inline-flex items-center px-3 py-1 rounded-full ${t.bgAccentSoft} ${t.textAccent} font-bold text-xs mb-4 border ${t.borderAccentSoft}`}><CalendarDays size={14} className="mr-1"/> Direncanakan: {modalData.programName}</div>}
                      {isPlanned && <button onClick={() => { setActiveDateModal(null); navigateToWorkoutDate(activeDateModal, modalProgram?.id); }} className={`w-full p-4 mb-6 rounded-xl font-bold text-white transition-colors bg-gradient-to-r ${t.gradientBg} shadow-lg ${t.shadowAccent} flex justify-center items-center`}><PlayCircle size={18} className="mr-2"/> Mulai Latihan</button>}
                      
                      <p className={`text-sm ${t.textMuted} mb-3 font-bold`}>Pilih jadwal untuk tanggal:</p>
                      <div className="space-y-2">
                         {programs.map(p => (
                            <button key={p.id} onClick={() => { playSoundEffect('click', soundEnabled); setHistory(prev => ({...prev, [activeDateModal]: { programId: p.id, programName: p.name, status: 'planned', log: {} }})); }} className={`w-full p-4 rounded-xl border ${modalData?.programId === p.id ? t.borderAccent + ' ' + t.bgAccentSoft + ' ' + t.textAccent : t.border + ' ' + t.textMain} font-bold text-left transition-colors flex justify-between items-center`}>{p.name}{modalData?.programId === p.id && <CheckCircle size={18} />}</button>
                         ))}
                      </div>
                    </>
                  )}
              </div>
              {modalData && <button onClick={() => { if(window.confirm('Yakin ingin menghapus data untuk tanggal ini?')) { const h = {...history}; h[activeDateModal] = null; setHistory(h); setActiveDateModal(null); } }} className="w-full mt-4 shrink-0 p-4 rounded-xl bg-rose-500/10 text-rose-500 font-bold border border-rose-500/30 flex items-center justify-center hover:bg-rose-500/20"><Trash2 size={18} className="mr-2"/> Hapus Rencana/Riwayat</button>}
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarTab;