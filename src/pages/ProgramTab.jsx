import React, { useState, useRef, useEffect } from 'react';
import { Plus, GripVertical, ArrowUp, ArrowDown, Clock, Link as LinkIcon, X, Dumbbell, ChevronRight, ChevronDown, ChevronUp, Copy, Sparkles, FolderOpen, Trash2, CheckCircle2, Calendar, Edit2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatTarget } from '../data/constants';
import { playSoundEffect } from '../utils/audio';

const SortableExerciseItem = ({ ex, idx, routineId, t, lang, soundEnabled, handleUpdateExercise, handleRemoveExercise, getEquipmentColor }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ex.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative',
  };

  const isTime = ex.type === 'time';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative p-4 rounded-2xl border ${t.border} transition-colors duration-300 ${isDragging ? 'shadow-2xl ring-2 ' + t.ringAccent + ' scale-[1.02] opacity-90' : 'hover:shadow-md'} ${t.bgCard}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          {...attributes} 
          {...listeners}
          className={`cursor-grab active:cursor-grabbing p-2 -ml-2 ${t.textMuted} hover:${t.textMain} transition-colors flex-shrink-0 touch-none`} 
          title="Tahan dan geser untuk mengurutkan"
        >
          <GripVertical size={20} />
        </div>
        <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black ${t.bgAccent} text-white flex-shrink-0`}>{idx + 1}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-base font-bold ${t.textMain} truncate`}>{ex.name}</p>
          <p className={`text-xs font-medium ${t.textAccent} truncate`}>{formatTarget(ex.target, lang?.id)}</p>
        </div>
        <button onClick={() => handleRemoveExercise(routineId, ex.id)} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors flex-shrink-0 ml-1"><X size={16} /></button>
      </div>
      <div className="flex items-center justify-between">
        {ex.equipment ? <span className={`px-3 py-1 rounded-md text-[10px] font-bold ${getEquipmentColor(ex.equipment)}`}>{ex.equipment}</span> : <div></div>}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-bold ${t.textMuted} uppercase`}>Sets</span>
            <input type="number" value={ex.sets === 0 ? '' : ex.sets} onChange={(e) => handleUpdateExercise(routineId, ex.id, 'sets', e.target.value)} placeholder="0" min="0" className={`w-14 px-2 py-1.5 rounded-xl ${t.inputBg} ${t.textMain} text-center font-bold text-sm outline-none focus:ring-1 ${t.ringAccent} transition-all`} />
          </div>
          {isTime ? (
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-bold ${t.textMuted} uppercase`}>Min</span>
              <input type="number" value={ex.duration === 0 ? '' : ex.duration} onChange={(e) => handleUpdateExercise(routineId, ex.id, 'duration', e.target.value)} placeholder="0" min="0" className={`w-14 px-2 py-1.5 rounded-xl ${t.inputBg} ${t.textMain} text-center font-bold text-sm outline-none focus:ring-1 ${t.ringAccent} transition-all`} />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-bold ${t.textMuted} uppercase`}>Reps</span>
              <input type="number" value={ex.reps === 0 ? '' : ex.reps} onChange={(e) => handleUpdateExercise(routineId, ex.id, 'reps', e.target.value)} placeholder="0" min="0" className={`w-14 px-2 py-1.5 rounded-xl ${t.inputBg} ${t.textMain} text-center font-bold text-sm outline-none focus:ring-1 ${t.ringAccent} transition-all`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProgramTab = ({ setConfirmModal, t, lang, programs, setPrograms, exerciseLibrary, soundEnabled, setActiveAddModalTarget, saveStateToHistory, openQuestionnaire, activePlanId, setActivePlanId }) => {

  // ==========================================
  // STATE
  // ==========================================
  const [expandedRoutineId, setExpandedRoutineId] = useState(null);
  const [warmupUrlInput, setWarmupUrlInput] = useState('');
  const [reorderingId, setReorderingId] = useState(null); 
  const [draggedExId, setDraggedExId] = useState(null);
  const [dragOverExId, setDragOverExId] = useState(null);

  // ==========================================
  // PROGRAM/PLAN HANDLERS
  // ==========================================
  const handleCreateRoutine = (targetPlanId) => {
    playSoundEffect('click', soundEnabled);
    const newProg = {
      id: 'prog-' + Date.now(),
      name: 'Rutinitas Baru',
      restTime: 120,
      warmupVideoUrls: [],
      exercises: [],
      planId: targetPlanId === 'custom' ? null : targetPlanId
    };
    setPrograms([...programs, newProg]);
    setExpandedRoutineId(newProg.id);
  };

  const handleDeleteRoutine = (routineId, routineName) => {
    if (programs.length <= 1) return;
    playSoundEffect('click', soundEnabled);
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Rutinitas',
      message: `Yakin ingin menghapus rutinitas "${routineName}"? Data latihan di dalamnya akan ikut terhapus.`,
      onConfirm: () => {
        const remaining = programs.filter(p => p.id !== routineId);
        setPrograms(remaining);
        if (expandedRoutineId === routineId) setExpandedRoutineId(null);
      }
    });
  };

  const handleDeletePlan = (planId, planName) => {
    playSoundEffect('click', soundEnabled);
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Seluruh Program',
      message: `PERINGATAN KERAS: Yakin ingin menghapus seluruh program "${planName}" beserta semua rutinitas di dalamnya? Tindakan ini tidak bisa dibatalkan!`,
      onConfirm: () => {
        const remaining = programs.filter(p => (p.planId || 'custom') !== planId);
        setPrograms(remaining);
        if (activePlanId === planId) {
          setActivePlanId('custom');
        }
      }
    });
  };

  const handleDuplicateRoutine = (routine) => {
    playSoundEffect('click', soundEnabled);
    const dupe = {
      ...routine,
      id: 'prog-' + Date.now(),
      name: routine.name + ' (Copy)',
      exercises: routine.exercises.map(ex => ({ ...ex })),
      warmupVideoUrls: [...(routine.warmupVideoUrls || [])]
    };
    setPrograms([...programs, dupe]);
    setExpandedRoutineId(dupe.id);
  };

  const handleRenameRoutine = (routineId, newName) => {
    setPrograms(programs.map(p => p.id === routineId ? { ...p, name: newName } : p));
  };

  // ==========================================
  // REST TIME & WARMUP
  // ==========================================
  const restPresets = [60, 90, 120, 180];
  const handleRestTimeChange = (routineId, val) => {
    setPrograms(programs.map(p => p.id === routineId ? { ...p, restTime: Number(val) } : p));
  };

  const handleToggleAssignedDay = (routineId, day) => {
    setPrograms(programs.map(p => {
      if (p.id !== routineId) return p;
      const currentDays = p.assignedDays || [];
      const newDays = currentDays.includes(day) 
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
      return { ...p, assignedDays: newDays };
    }));
  };

  // ==========================================
  // EXERCISE HANDLERS
  // ==========================================
  const handleUpdateExercise = (routineId, exId, field, val) => {
    const numVal = val === '' ? '' : Number(val);
    setPrograms(programs.map(p => p.id === routineId ? {
      ...p,
      exercises: p.exercises.map(ex => ex.id === exId ? { ...ex, [field]: numVal } : ex)
    } : p));
  };

  const handleRemoveExercise = (routineId, exId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Latihan?',
      message: 'Yakin ingin menghapus latihan ini dari rutinitas?',
      onConfirm: () => {
        playSoundEffect('click', soundEnabled);
        setPrograms(programs.map(p => p.id === routineId ? {
          ...p,
          exercises: p.exercises.filter(ex => ex.id !== exId)
        } : p));
      }
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndDnd = (event, routineId) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      playSoundEffect('swipe', soundEnabled);
      setPrograms(programs.map(p => {
        if (p.id !== routineId) return p;
        const oldIndex = p.exercises.findIndex(ex => ex.id === active.id);
        const newIndex = p.exercises.findIndex(ex => ex.id === over.id);
        return {
          ...p,
          exercises: arrayMove(p.exercises, oldIndex, newIndex)
        };
      }));
    }
  };

  const handleAddExercise = (routineId) => {
    playSoundEffect('click', soundEnabled);
    setActiveAddModalTarget({ type: 'program', progId: routineId });
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const getEquipmentColor = (eq) => {
    const colors = {
      'Dumbbell': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      'Barbell': 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
      'Smith Machine': 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
      'Cable/Machine': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      'Bodyweight': 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
    };
    return colors[eq] || 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
  };

  // Group programs by Plan (Umbrella)
  const groupedPrograms = programs.reduce((acc, prog) => {
    const key = prog.planId || 'custom';
    if (!acc[key]) acc[key] = { planId: key, planName: prog.planName || 'Custom Program', planLevel: prog.planLevel, routines: [], assignedDays: prog.assignedDays || [] };
    acc[key].routines.push(prog);
    return acc;
  }, {});

  // ==========================================
  // RENDER ROUTINE EDITOR (Accordion Body)
  // ==========================================
  const renderRoutineEditor = (routine) => {
    return (
      <div className={`p-5 bg-black/5 dark:bg-white/5 border-t ${t.border} space-y-5 animate-in slide-in-from-top-2 fade-in duration-300`}>
        
        {/* Editor Header: Rename & Actions */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className={`flex-1 min-w-0 relative group h-11 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-transparent focus-within:border-blue-500/50 dark:focus-within:border-blue-400/50 transition-all`}>
            <input
              type="text"
              value={routine.name}
              onChange={(e) => handleRenameRoutine(routine.id, e.target.value)}
              style={{
                WebkitMaskImage: 'linear-gradient(to left, transparent 40px, black 80px)',
                maskImage: 'linear-gradient(to left, transparent 40px, black 80px)'
              }}
              className={`w-full h-full bg-transparent pl-4 pr-11 font-bold text-lg ${t.textMain} outline-none transition-all`}
              placeholder="Nama Rutinitas..."
            />
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${t.textMuted} group-hover:text-blue-500 transition-colors pointer-events-none opacity-50 group-focus-within:opacity-100 group-focus-within:text-blue-500`}>
              <Edit2 size={16} />
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => handleDuplicateRoutine(routine)} className={`flex items-center justify-center w-11 h-11 rounded-xl ${t.bgCard} border ${t.border} ${t.textMuted} hover:${t.textAccent} transition-colors`}><Copy size={16} /></button>
            <button onClick={() => handleDeleteRoutine(routine.id, routine.name)} disabled={programs.length <= 1} className={`flex items-center justify-center w-11 h-11 rounded-xl border transition-colors ${programs.length <= 1 ? 'opacity-30 cursor-not-allowed border-gray-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20'}`}><Trash2 size={16} /></button>
          </div>
        </div>

        {/* Assigned Days Selector */}
        <div className={`p-4 rounded-2xl ${t.bgCard} shadow-sm border ${t.border}`}>
          <div className="flex items-center gap-2 mb-3">
            <h4 className={`font-bold text-sm ${t.textMain}`}>Jadwal Hari</h4>
          </div>
          <div className="flex justify-between w-full gap-1 sm:gap-2">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => {
              const isSelected = (routine.assignedDays || []).includes(day);
              return (
                <button 
                  key={day}
                  onClick={() => { playSoundEffect('click', soundEnabled); handleToggleAssignedDay(routine.id, day); }}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-150 ${isSelected ? `${t.bgAccent} text-white shadow-md scale-105` : `${t.inputBg} ${t.textMuted} hover:${t.textMain}`}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rest Time */}
        <div className={`p-4 rounded-2xl ${t.bgCard} shadow-sm border ${t.border}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h4 className={`font-bold text-sm ${t.textMain}`}>Waktu Istirahat (Set)</h4>
            </div>
            <span className={`text-lg font-black ${t.textAccent}`}>{routine.restTime || 120}s</span>
          </div>
          
          <div className="px-1 mb-4">
            <input 
              type="range" 
              min="0" 
              max="300" 
              step="5" 
              value={routine.restTime || 120} 
              onChange={(e) => handleRestTimeChange(routine.id, parseInt(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${t.inputBg} outline-none`}
            />
            <div className={`flex justify-between mt-2 text-[10px] font-bold ${t.textMuted}`}>
              <span>0s</span>
              <span>150s</span>
              <span>300s</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {restPresets.map(preset => (
              <button key={preset} onClick={() => { playSoundEffect('click', soundEnabled); handleRestTimeChange(routine.id, preset); }} className={`py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${(routine.restTime || 120) === preset ? `${t.bgAccent} text-white shadow-md scale-105` : `${t.inputBg} ${t.textMuted} hover:${t.textMain}`}`}>{preset}s</button>
            ))}
          </div>
        </div>

        {/* Exercises */}
        <div className={`p-4 rounded-2xl ${t.bgCard} shadow-sm border ${t.border}`}>
          <div className="flex items-center gap-2 mb-4">
            <h4 className={`font-bold text-sm ${t.textMain}`}>Daftar Latihan ({routine.exercises.length})</h4>
          </div>

          {routine.exercises.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-6 rounded-2xl border-2 border-dashed ${t.borderAccentSoft}`}>
              <p className={`text-sm ${t.textMuted} mb-3`}>Belum ada latihan di rutinitas ini.</p>
              <button onClick={() => handleAddExercise(routine.id)} className={`flex items-center px-4 py-2 rounded-xl text-white font-bold text-xs ${t.bgAccent} shadow-md hover:opacity-90 transition-all active:scale-95`}><Plus size={14} className="mr-1" /> Tambah Latihan</button>
            </div>
          ) : (
            <div className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEndDnd(e, routine.id)}
              >
                <SortableContext items={routine.exercises.map(ex => ex.id)} strategy={verticalListSortingStrategy}>
                  {routine.exercises.map((ex, idx) => (
                    <SortableExerciseItem
                      key={ex.id}
                      ex={ex}
                      idx={idx}
                      routineId={routine.id}
                      t={t}
                      lang={lang}
                      soundEnabled={soundEnabled}
                      handleUpdateExercise={handleUpdateExercise}
                      handleRemoveExercise={handleRemoveExercise}
                      getEquipmentColor={getEquipmentColor}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}

          {routine.exercises.length > 0 && (
            <button onClick={() => handleAddExercise(routine.id)} className={`w-full mt-3 py-3 border-2 border-dashed ${t.borderAccentSoft} hover:${t.borderAccent} hover:${t.bgAccentSoft} rounded-xl ${t.textAccent} font-bold text-sm flex justify-center items-center transition-all duration-200 active:scale-[0.98]`}>
              <Plus size={16} className="mr-1.5" /> Tambah Latihan
            </button>
          )}
        </div>

      </div>
    );
  };

  // ==========================================
  // RENDER MAIN
  // ==========================================
  return (
    <div className="flex flex-col animate-in fade-in duration-300 pb-20 max-w-2xl mx-auto w-full space-y-6">

      {/* Banner AI Coach */}
      <div 
        onClick={openQuestionnaire}
        className={`w-full text-left p-5 rounded-3xl ${t.bgAccentSoft} border ${t.borderAccentSoft} shadow-sm relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] active:scale-95`}
      >
        <div className={`absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500 ${t.textAccent}`}>
          <Sparkles size={80} />
        </div>
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <Sparkles size={18} className={t.textAccent} />
          <h3 className={`font-black text-lg ${t.textAccent}`}>Buat Program</h3>
        </div>
        <p className={`text-sm ${t.textMuted} mb-4 relative z-10 pr-10`}>
          Jawab beberapa pertanyaan dan biarkan algoritma cerdas kami meracik program latihan terbaik yang dipersonalisasi untuk Anda.
        </p>
        <button 
          onClick={() => { playSoundEffect('click', soundEnabled); setShowQuestionnaire(true); }}
          className={`w-full py-3 rounded-xl font-black text-white bg-gradient-to-r ${t.gradientBg} shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 relative z-10`}
        >
          <Plus size={18} /> Mulai Buat Program
        </button>
      </div>

      {/* Programs List */}
      <div className="space-y-6">
        {Object.entries(groupedPrograms).map(([planId, group]) => {
          const isActive = activePlanId === planId;

          return (
            <div key={planId} className={`rounded-3xl border-2 ${isActive ? t.borderAccent : t.border} ${t.bgCard} shadow-sm overflow-hidden transition-colors`}>
              
              {/* PLAN HEADER */}
              <div className={`p-5 ${isActive ? t.bgAccentSoft : ''}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className={`font-black text-xl flex items-center gap-2 ${isActive ? t.textAccent : t.textMain}`}>
                      {planId !== 'custom' && <Sparkles size={18} className={isActive ? t.textAccent : "text-amber-500"}/>}
                      {group.planName}
                    </h2>
                    {group.planLevel && (
                      <p className={`text-[10px] font-black uppercase mt-1 px-2 py-0.5 inline-block rounded-md ${t.bgAccentSoft} ${t.textAccent}`}>
                        Level: {group.planLevel === 'beginner' ? 'Pemula' : group.planLevel === 'intermediate' ? 'Menengah' : group.planLevel === 'advanced' ? 'Mahir' : group.planLevel}
                      </p>
                    )}
                  </div>
                  {planId !== 'custom' && (
                    <button 
                      onClick={() => handleDeletePlan(planId, group.planName)}
                      className={`p-2 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors`}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => { 
                    playSoundEffect('success', soundEnabled); 
                    if (isActive) {
                      setActivePlanId(null);
                    } else {
                      setActivePlanId(planId); 
                    }
                  }}
                  className={`w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${isActive ? `${t.bgAccent} text-white shadow-md` : `${t.inputBg} ${t.textMuted} hover:${t.textMain}`}`}
                >
                  {isActive ? <><CheckCircle2 size={18} /> Program Aktif</> : 'Jadikan Aktif'}
                </button>
              </div>

              {/* ACCORDION CONTENT */}
              <div className={`transition-all duration-300 ${isActive ? 'pb-5' : 'h-0 overflow-hidden'}`}>
                <div className="flex flex-col">
                  {group.routines.map((routine, idx) => {
                    const isExpanded = expandedRoutineId === routine.id;
                    const estDuration = Math.round(routine.exercises.reduce((acc, ex) => acc + (parseInt(ex.sets) || 3), 0) * (45 + (parseInt(routine.restTime) || 90)) / 60);
                    return (
                      <div key={routine.id} className={`border-t ${t.border}`}>
                        <button 
                          onClick={() => { playSoundEffect('swipe', soundEnabled); setExpandedRoutineId(isExpanded ? null : routine.id); }}
                          className={`w-full p-4 flex items-center justify-between transition-colors ${isExpanded ? t.bgCard : `hover:${t.inputBg}`}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isActive ? t.bgAccentSoft + ' ' + t.textAccent : t.inputBg + ' ' + t.textMuted}`}>
                              {idx + 1}
                            </span>
                            <div className="text-left">
                              <h4 className={`font-bold text-base ${t.textMain}`}>{routine.name}</h4>
                              <p className={`text-xs ${t.textMuted}`}>{routine.exercises.length} Latihan • {routine.restTime}s Istirahat • ~{estDuration} mnt</p>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp size={20} className={t.textAccent} /> : <ChevronDown size={20} className={t.textMuted} />}
                        </button>
                        
                        {isExpanded && renderRoutineEditor(routine)}
                      </div>
                    );
                  })}

                  {/* Add Custom Routine Button (only for custom plan) */}
                  {planId === 'custom' && (
                    <div className={`p-4 border-t ${t.border}`}>
                      <button 
                        onClick={() => handleCreateRoutine('custom')}
                        className={`w-full py-3 rounded-xl font-bold text-sm border-2 border-dashed ${t.borderAccentSoft} ${t.textAccent} hover:${t.bgAccentSoft} transition-all active:scale-95 flex items-center justify-center gap-2`}
                      >
                        <Plus size={16} /> Rutinitas Baru
                      </button>
                    </div>
                  )}
                </div>
              </div>  
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ProgramTab;
