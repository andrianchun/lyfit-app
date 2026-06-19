import React, { useState, useEffect } from 'react';

// --- IMPORT CAPACITOR (FULLSCREEN) ---
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

// --- IMPORT MESIN FIREBASE ---
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// --- IMPORT KOMPONEN UI ---
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import FloatingTimer from './components/FloatingTimer';

// --- IMPORT HALAMAN (PAGES) ---
import AuthPage from './pages/AuthPage';
import DashboardTab from './pages/DashboardTab'; 
import WorkoutTab from './pages/WorkoutTab';
import EditModeTab from './pages/EditModeTab';
import CalendarTab from './pages/CalendarTab';
import ProgressTab from './pages/ProgressTab';

// --- IMPORT MODALS ---
import VideoModal from './modals/VideoModal';
import ConfirmModal from './modals/ConfirmModal';
import AddExerciseModal from './modals/AddExerciseModal';
import SettingsModal from './modals/SettingsModal';
import HelpModal from './modals/HelpModal';
import LibManagerModal from './modals/LibManagerModal';

// --- IMPORT DATA & MESIN ---
import { playSoundEffect } from './utils/audio';
import { defaultMasterExercises, defaultPrograms, getLocalYMD, warmupVideos, cooldownVideos } from './data/constants';
import { Loader2 } from 'lucide-react';

export default function App() {
  // --- STATE AUTH & LOADING ---
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // --- STATE UTAMA ---
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('ID');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [defaultRestTime, setDefaultRestTime] = useState(120);

  const [exerciseLibrary, setExerciseLibrary] = useState(defaultMasterExercises);
  const [programs, setPrograms] = useState(defaultPrograms);
  const [history, setHistory] = useState({});
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [restTimer, setRestTimer] = useState(0);

  const [selectedDate, setSelectedDate] = useState(getLocalYMD(new Date()));
  const [activeProgramId, setActiveProgramId] = useState(defaultPrograms[0]?.id || null);

  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLibManager, setShowLibManager] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [activeAddModalTarget, setActiveAddModalTarget] = useState(null); 

  const [exerciseLogs, setExerciseLogs] = useState({});
  const [skippedExercises, setSkippedExercises] = useState({});
  const [extraExercises, setExtraExercises] = useState([]);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // ==========================================
  // 0. CAPACITOR: SETTING FULLSCREEN
  // ==========================================
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.hide().catch(err => console.log("Gagal menyembunyikan status bar:", err));
    }
  }, []);

  // ==========================================
  // 1. SISTEM AUTO-LOGIN FIREBASE
  // ==========================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({ 
           uid: currentUser.uid, 
           email: currentUser.email, 
           name: currentUser.displayName || 'Sobat LyFit',
           photoURL: currentUser.photoURL
        });
      } else {
        setUser(null);
        setIsDataLoaded(false);
        setHistory({});
        setPrograms(defaultPrograms);
        setExerciseLibrary(defaultMasterExercises);
        setExerciseLogs({});
        setExtraExercises([]);
        setSkippedExercises({});
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // ==========================================
  // 2. SISTEM AUTO-FETCH (TARIK DATA DARI CLOUD)
  // ==========================================
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.history) setHistory(data.history);
            if (data.programs) setPrograms(data.programs);
            if (data.exerciseLibrary) setExerciseLibrary(data.exerciseLibrary);
            if (data.settings) {
              setTheme(data.settings.theme || 'dark');
              setLanguage(data.settings.language || 'ID');
              setSoundEnabled(data.settings.soundEnabled ?? true);
              setDefaultRestTime(data.settings.defaultRestTime || 120);
            }
          }
        } catch (error) {
          console.error("Gagal menarik data dari Cloud:", error);
        } finally {
          setIsDataLoaded(true);
        }
      };
      fetchUserData();
    }
  }, [user]);

  // ==========================================
  // 3. SISTEM AUTO-SAVE KE CLOUD (DEBOUNCE)
  // ==========================================
  useEffect(() => {
    if (user && isDataLoaded) {
      const timer = setTimeout(() => {
        const docRef = doc(db, "users", user.uid);
        setDoc(docRef, {
          history,
          programs,
          exerciseLibrary,
          settings: { theme, language, soundEnabled, defaultRestTime }
        }, { merge: true }).catch(err => console.error("Auto-save Cloud gagal:", err));
      }, 1500); 
      
      return () => clearTimeout(timer);
    }
  }, [history, programs, exerciseLibrary, theme, language, soundEnabled, defaultRestTime, user, isDataLoaded]);

  // ==========================================
  // 4. PENAHAN TOMBOL BACK UNTUK MODAL VIDEO
  // ==========================================
  useEffect(() => {
    if (activeVideoModal) {
      window.history.pushState({ modal: 'video' }, '');
      const handlePopState = () => setActiveVideoModal(null);
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state?.modal === 'video') {
          window.history.back();
        }
      };
    }
  }, [activeVideoModal]);

  // ==========================================
  // 5. MESIN AUTOSAVE LOG LATIHAN KE KALENDER
  // ==========================================
  const [lastActionTime, setLastActionTime] = useState(0);

  useEffect(() => {
    if (lastActionTime === 0) return;
    
    const activeProgram = programs.find(p => p.id === activeProgramId) || programs[0];
    if (!activeProgram) return;

    setHistory(prev => ({
        ...prev,
        [selectedDate]: {
            ...prev[selectedDate], 
            programId: activeProgramId,
            programName: activeProgram.name,
            status: 'completed', 
            log: { exerciseLogs, skippedExercises, extraExercises }
        }
    }));
  }, [lastActionTime]); 

  // ==========================================

  const saveStateToHistory = () => {
     setUndoStack([...undoStack, { history: JSON.parse(JSON.stringify(history)), programs: JSON.parse(JSON.stringify(programs)) }]);
     setRedoStack([]);
  };

  const handleUndo = () => {
      playSoundEffect('click', soundEnabled);
      if(undoStack.length === 0) return;
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack([...redoStack, { history, programs }]);
      setHistory(lastState.history);
      setPrograms(lastState.programs);
      setUndoStack(undoStack.slice(0, -1));
  };

  const handleRedo = () => {
       playSoundEffect('click', soundEnabled);
       if(redoStack.length === 0) return;
       const nextState = redoStack[redoStack.length - 1];
       setUndoStack([...undoStack, { history, programs }]);
       setHistory(nextState.history);
       setPrograms(nextState.programs);
       setRedoStack(redoStack.slice(0, -1));
  };

  const exportData = () => {
      const data = { history, programs, exerciseLibrary };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `LyFit_Backup_${getLocalYMD(new Date())}.json`;
      a.click();
  };

  const handleImportFile = (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target.result);
              saveStateToHistory(); 
              if(data.history) setHistory(data.history);
              if(data.programs) setPrograms(data.programs);
              if(data.exerciseLibrary) setExerciseLibrary(data.exerciseLibrary);
              alert("Data berhasil diimpor! Cloud akan otomatis menyinkronkan data ini.");
              setShowSettings(false);
          } catch (err) { alert("Gagal membaca file backup JSON."); }
      };
      reader.readAsText(file);
  };

  const handleLogout = async () => {
    playSoundEffect('click', soundEnabled);
    try {
      await signOut(auth);
      setShowSettings(false);
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  const dict = {
    ID: { 
      workout: 'Latihan', calendar: 'Kalender', progress: 'Progres', cancel: 'Batal',
      settings: 'Pengaturan', theme: 'Tema', lang: 'Bahasa', sound: 'Suara Efek', timer: 'Istirahat (detik)',
      manageLib: 'Kelola Database Latihan', help: 'Tutorial',
      workoutDate: 'Tanggal Latihan:', warmup: 'Pemanasan', cooldown: 'Pendinginan',
      emptyProg: 'Belum ada latihan. Masuk mode edit.', addExtra: 'Tambah Latihan Ekstra',
      done: 'Selesai', set: 'Set', addSet: 'Tambah Set', updateWorkout: 'Perbarui Latihan', finishWorkout: 'Selesai Sesi',
      editMode: 'Mode Edit Master', dragHint: 'Tahan ikon garis untuk menggeser', save: 'Simpan', addEx: 'Tambah Latihan', newProg: 'Buat Program Baru',
      progTitle: 'Grafik Progres', week: 'Minggu', month: 'Bulan', year: 'Tahun', progDesc: 'Pantau pertumbuhan volume otot & beban.', progExercise: 'Per Latihan', progMuscle: 'Per Otot',
      customEx: 'Buat Latihan Kustom', searchLib: 'Cari di Library...', ytLink: 'Link Video YouTube'
    },
    EN: { 
      workout: 'Workout', calendar: 'Calendar', progress: 'Progress', cancel: 'Cancel',
      settings: 'Settings', theme: 'Theme', lang: 'Language', sound: 'Sound Effects', timer: 'Rest (seconds)',
      manageLib: 'Manage Exercise Database', help: 'Tutorial',
      workoutDate: 'Workout Date:', warmup: 'Warm-up', cooldown: 'Cool-down',
      emptyProg: 'No exercises yet. Enter edit mode.', addExtra: 'Add Extra Exercise',
      done: 'Done', set: 'Set', addSet: 'Add Set', updateWorkout: 'Update Workout', finishWorkout: 'Finish Session',
      editMode: 'Master Edit Mode', dragHint: 'Hold the line icon to drag', save: 'Save', addEx: 'Add Exercise', newProg: 'Create New Program',
      progTitle: 'Progress Chart', week: 'Week', month: 'Month', year: 'Year', progDesc: 'Monitor muscle volume & weight growth.', progExercise: 'By Exercise', progMuscle: 'By Muscle',
      customEx: 'Create Custom Exercise', searchLib: 'Search Library...', ytLink: 'YouTube Video URL'
    }
  };
  const lang = dict[language] || dict['ID'];

  const t = {
    bgApp: theme === 'dark' ? 'bg-black' : 'bg-slate-50', bgCard: theme === 'dark' ? 'bg-zinc-900' : 'bg-white',
    textMain: theme === 'dark' ? 'text-zinc-100' : 'text-slate-800', textMuted: theme === 'dark' ? 'text-zinc-400' : 'text-slate-500',
    border: theme === 'dark' ? 'border-zinc-800' : 'border-slate-200', textAccent: theme === 'dark' ? 'text-sky-400' : 'text-amber-600',
    bgAccent: theme === 'dark' ? 'bg-sky-500 text-black' : 'bg-amber-500 text-white', bgAccentSoft: theme === 'dark' ? 'bg-sky-500/10' : 'bg-amber-500/10',
    borderAccent: theme === 'dark' ? 'border-sky-500' : 'border-amber-500', borderAccentSoft: theme === 'dark' ? 'border-sky-500/30' : 'border-amber-500/30',
    ringAccent: theme === 'dark' ? 'ring-sky-500' : 'ring-amber-500', shadowAccent: theme === 'dark' ? 'shadow-sky-500/30' : 'shadow-amber-500/30',
    gradientText: theme === 'dark' ? 'from-sky-400 to-blue-400' : 'from-amber-500 to-orange-500', gradientBg: theme === 'dark' ? 'from-sky-500 to-blue-600' : 'from-amber-400 to-orange-500',
    inputBg: theme === 'dark' ? 'bg-black/40' : 'bg-slate-100', btnBg: theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-100',
    navBg: theme === 'dark' ? 'bg-black/80 backdrop-blur-md' : 'bg-white/90 backdrop-blur-md',
    navIconActive: theme === 'dark' ? 'text-sky-400' : 'text-amber-500', navIconInactive: theme === 'dark' ? 'text-zinc-500' : 'text-slate-500', 
  };

  const navigateToWorkoutDate = (dateStr, progId) => { 
    playSoundEffect('click', soundEnabled); setSelectedDate(dateStr); 
    if(progId) setActiveProgramId(progId); 
    setActiveTab('workout'); setIsEditingMode(false); 
  };

  const getDayHistory = (dateStr) => {
    const val = history[dateStr]; if (!val) return null;
    if (typeof val === 'string') { const p = programs.find(prog => prog.name === val); return { programId: p?.id, programName: val, status: 'completed', log: {} }; }
    if (val.programId && !val.programName) { const p = programs.find(prog => prog.id === val.programId); val.programName = p ? p.name : 'Unknown'; }
    return val;
  };

  useEffect(() => {
    const dayData = getDayHistory(selectedDate);
    if (dayData) {
      if (dayData.programId && programs.find(p => p.id === dayData.programId)) setActiveProgramId(dayData.programId);
      if (dayData.status === 'completed' && dayData.log) {
        setExerciseLogs(dayData.log.exerciseLogs || {}); setSkippedExercises(dayData.log.skippedExercises || {}); setExtraExercises(dayData.log.extraExercises || []);
      } else { setExerciseLogs({}); setSkippedExercises({}); setExtraExercises([]); }
    } else { setExerciseLogs({}); setSkippedExercises({}); setExtraExercises([]); }
  }, [selectedDate, activeProgramId, history, programs]);

  const getSetLogs = (ex) => {
    if (exerciseLogs[ex.id]) return exerciseLogs[ex.id];
    return Array.from({length: ex.sets || 3}).map(() => ({ w: ex.defaultWeight || 0, r: ex.reps || 10, d: ex.duration || 10, done: false }));
  };

  const handleSetChange = (exId, setIdx, field, val) => {
    setExerciseLogs(prev => {
      const ex = [...programs.map(p=>p.exercises).flat(), ...extraExercises].find(e => e.id === exId);
      const currentLogs = prev[exId] ? [...prev[exId]] : getSetLogs(ex);
      currentLogs[setIdx] = { ...currentLogs[setIdx], [field]: Number(val) };
      return { ...prev, [exId]: currentLogs };
    });
    setLastActionTime(Date.now()); // Trigger Autosave
  };

  const handleToggleSet = (exId, setIdx) => {
    playSoundEffect('click', soundEnabled);
    setExerciseLogs(prev => {
      const ex = [...programs.map(p=>p.exercises).flat(), ...extraExercises].find(e => e.id === exId);
      const currentLogs = prev[exId] ? [...prev[exId]] : getSetLogs(ex);
      const isDoneNow = !currentLogs[setIdx].done;
      currentLogs[setIdx] = { ...currentLogs[setIdx], done: isDoneNow };
      if (isDoneNow) setRestTimer(defaultRestTime); 
      return { ...prev, [exId]: currentLogs };
    });
    setLastActionTime(Date.now()); // Trigger Autosave
  };

  const handleAddSet = (exId) => {
    playSoundEffect('click', soundEnabled);
    setExerciseLogs(prev => {
      const ex = [...programs.map(p=>p.exercises).flat(), ...extraExercises].find(e => e.id === exId);
      const currentLogs = prev[exId] ? [...prev[exId]] : getSetLogs(ex);
      const lastSet = currentLogs[currentLogs.length - 1] || { w: ex.defaultWeight || 0, r: ex.reps || 10, d: ex.duration || 10 };
      currentLogs.push({ w: lastSet.w, r: lastSet.r, d: lastSet.d, done: false });
      return { ...prev, [exId]: currentLogs };
    });
    setLastActionTime(Date.now()); // Trigger Autosave
  };

  const handleRemoveSet = (exId, setIdx) => {
    playSoundEffect('click', soundEnabled);
    setExerciseLogs(prev => {
      const ex = [...programs.map(p=>p.exercises).flat(), ...extraExercises].find(e => e.id === exId);
      const currentLogs = prev[exId] ? [...prev[exId]] : getSetLogs(ex);
      currentLogs.splice(setIdx, 1);
      return { ...prev, [exId]: currentLogs };
    });
    setLastActionTime(Date.now()); // Trigger Autosave
  };

  const handleToggleSkip = (exId) => {
    playSoundEffect('click', soundEnabled);
    setSkippedExercises(prev => ({...prev, [exId]: !prev[exId]}));
    setLastActionTime(Date.now()); // Trigger Autosave
  };

  const handleRemoveExtraEx = (exId) => {
    playSoundEffect('click', soundEnabled);
    setConfirmModal({ 
        isOpen: true, 
        title: 'Hapus Latihan', 
        message: 'Yakin hapus dari sesi ini?', 
        onConfirm: () => {
            setExtraExercises(prev => prev.filter(ex => ex.id !== exId));
            setLastActionTime(Date.now()); // Trigger Autosave
        } 
    });
  };

  const handleSaveWorkout = () => {
    playSoundEffect('click', soundEnabled);
    setActiveTab('calendar');
  };

  const addExerciseTarget = (ex) => {
    if (!activeAddModalTarget) return;
    playSoundEffect('click', soundEnabled);
    saveStateToHistory(); 
    
    let defaultSets = 3; let defaultReps = 10; let defaultDuration = 10;
    if (ex.type === 'time') { defaultSets = 1; defaultReps = 0; defaultDuration = ex.duration || 15; }
    else if (ex.type === 'reps') { defaultSets = 3; defaultReps = ex.reps || 15; defaultDuration = 0; }

    if (activeAddModalTarget.type === 'program') {
      const progId = activeAddModalTarget.progId;
      setPrograms(programs.map(p => p.id === progId ? { ...p, exercises: [...p.exercises, { ...ex, id: Date.now(), sets: defaultSets, reps: defaultReps, duration: defaultDuration }] } : p));
    } else if (activeAddModalTarget.type === 'adhoc') { 
      setExtraExercises(prev => [...prev, { ...ex, id: `${ex.id}-${Date.now()}`, sets: defaultSets, reps: defaultReps, duration: defaultDuration }]); 
      setLastActionTime(Date.now()); // Trigger Autosave
    }
    setActiveAddModalTarget(null); 
  };

  const handleCreateCustomExercise = (form) => {
    playSoundEffect('click', soundEnabled);
    saveStateToHistory(); 
    const newMasterEx = { id: Date.now(), name: form.name, target: form.targets.length ? form.targets : ['Full Body'], type: form.type, equipment: form.equipment, defaultWeight: 0, ytVideo: form.ytVideo };
    setExerciseLibrary([...exerciseLibrary, newMasterEx]); 
    addExerciseTarget(newMasterEx);
  };

  const activeDayData = getDayHistory(selectedDate);
  const isCurrentlyCompleted = activeDayData?.status === 'completed';

  // ==========================================
  // RENDER PENGHALANG SAAT LOADING / CEK AUTH
  // ==========================================
  if (isAuthChecking || (user && !isDataLoaded)) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
         <Loader2 size={48} className="text-sky-500 animate-spin mb-6" />
         <h2 className="text-white font-bold animate-pulse text-lg tracking-wider uppercase">Menyiapkan Ruang Latihan...</h2>
      </div>
    );
  }

  // JIKA USER BELUM LOGIN
  if (!user) {
    return <AuthPage t={t} theme={theme} soundEnabled={soundEnabled} onLogin={setUser} />;
  }

  // JIKA USER SUDAH LOGIN
  return (
    <div className={`min-h-screen ${t.bgApp} ${t.textMain} font-sans pb-32 transition-colors duration-300`}>
      <ConfirmModal confirmModal={confirmModal} setConfirmModal={setConfirmModal} t={t} lang={lang} soundEnabled={soundEnabled} playSoundEffect={playSoundEffect} />
      <AddExerciseModal t={t} lang={lang} activeAddModalTarget={activeAddModalTarget} setActiveAddModalTarget={setActiveAddModalTarget} exerciseLibrary={exerciseLibrary} onAddExerciseTarget={addExerciseTarget} onCreateCustomExercise={handleCreateCustomExercise} />
      <HelpModal showHelp={showHelp} setShowHelp={setShowHelp} t={t} lang={lang} />
      <LibManagerModal showLibManager={showLibManager} setShowLibManager={setShowLibManager} t={t} exerciseLibrary={exerciseLibrary} setExerciseLibrary={setExerciseLibrary} soundEnabled={soundEnabled} />
      <VideoModal activeVideoModal={activeVideoModal} setActiveVideoModal={setActiveVideoModal} />
      
      <SettingsModal 
         showSettings={showSettings} setShowSettings={setShowSettings} t={t} lang={lang} 
         theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} 
         soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled}
         defaultRestTime={defaultRestTime} setDefaultRestTime={setDefaultRestTime}
         undoStack={undoStack} redoStack={redoStack} handleUndo={handleUndo} handleRedo={handleRedo}
         setShowLibManager={setShowLibManager} setShowHelp={setShowHelp}
         exportData={exportData} handleImportFile={handleImportFile}
         user={user} handleLogout={handleLogout}
      />

      <Header t={t} user={user} showSettings={showSettings} setShowSettings={setShowSettings} soundEnabled={soundEnabled} playSoundEffect={playSoundEffect} />
      
      <main className="p-4 max-w-2xl mx-auto min-h-[70vh]">
         {activeTab === 'dashboard' && (
             <DashboardTab 
               t={t} lang={lang} user={user} history={history} setHistory={setHistory} programs={programs}
               navigateToWorkoutDate={navigateToWorkoutDate} soundEnabled={soundEnabled} playSoundEffect={playSoundEffect}
               theme={theme}
             />
         )}
         
         {activeTab === 'workout' && !isEditingMode && (
             <WorkoutTab 
               t={t} lang={lang} language={language} programs={programs} selectedDate={selectedDate} setSelectedDate={setSelectedDate}
               activeProgramId={activeProgramId} setActiveProgramId={setActiveProgramId} soundEnabled={soundEnabled} playSoundEffect={playSoundEffect} 
               warmupVideos={warmupVideos} cooldownVideos={cooldownVideos} setActiveVideoModal={setActiveVideoModal}
               exerciseLogs={exerciseLogs} skippedExercises={skippedExercises} extraExercises={extraExercises}
               onSetChange={handleSetChange} onToggleSet={handleToggleSet} onAddSet={handleAddSet} onRemoveSet={handleRemoveSet}
               onToggleSkip={handleToggleSkip} onRemoveExtra={handleRemoveExtraEx}
               isCurrentlyCompleted={isCurrentlyCompleted} onSaveWorkout={handleSaveWorkout}
               onAddExtraClick={() => setActiveAddModalTarget({type: 'adhoc'})} onEditMode={() => setIsEditingMode(true)}
             />
         )}
         
         {activeTab === 'workout' && isEditingMode && (
             <EditModeTab t={t} lang={lang} programs={programs} setPrograms={setPrograms} setIsEditingMode={setIsEditingMode} setActiveAddModalTarget={setActiveAddModalTarget} soundEnabled={soundEnabled} />
         )}
         
         {activeTab === 'calendar' && (
             <CalendarTab t={t} lang={lang} theme={theme} history={history} setHistory={setHistory} programs={programs} soundEnabled={soundEnabled} playSoundEffect={playSoundEffect} navigateToWorkoutDate={navigateToWorkoutDate} />
         )}

         {activeTab === 'progress' && (
             <ProgressTab t={t} lang={lang} language={language} theme={theme} history={history} programs={programs} exerciseLibrary={exerciseLibrary} soundEnabled={soundEnabled} playSoundEffect={playSoundEffect} />
         )}
      </main>

      <FloatingTimer restTimer={restTimer} setRestTimer={setRestTimer} defaultRestTime={defaultRestTime} t={t} soundEnabled={soundEnabled} />
      <BottomNav t={t} lang={lang} activeTab={activeTab} setActiveTab={setActiveTab} setIsEditingMode={setIsEditingMode} soundEnabled={soundEnabled} playSoundEffect={playSoundEffect} />
    </div>
  );
}