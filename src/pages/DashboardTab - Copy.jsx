import React, { useMemo, useState, useEffect } from 'react';
import { Activity, Zap, Brain, Footprints, HeartPulse, Moon, Droplets, Scale, RefreshCw, Trophy } from 'lucide-react';
import { getLocalYMD } from '../data/constants';
import DashboardModals from '../components/DashboardModals';
import DashboardChart from '../components/DashboardChart';

const DashboardTab = ({ t, lang, user, history, setHistory, programs, navigateToWorkoutDate, soundEnabled, playSoundEffect, theme }) => {
  const todayStr = getLocalYMD(new Date());

  // ==========================================
  // STATE KONEKSI & SINKRONISASI
  // ==========================================
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [connectedApps, setConnectedApps] = useState({ xiaomi: false, samsung: false, lyfeat: false });
  const [isSyncing, setIsSyncing] = useState(false);

  // ==========================================
  // STATE MODAL INPUT MANUAL & TANGGAL
  // ==========================================
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualTab, setManualTab] = useState('komposisi'); 
  const [modalDate, setModalDate] = useState(todayStr);

  const emptyBio = {
    bodyScore: 0, weight: 0, height: 0, bmi: 0, bmiStatus: '-', bodyFat: 0, bodyFatStatus: '-',
    muscleMass: 0, musclePercent: 0, waterPercent: 0, visceralFat: 0, bmr: 0, bodyAge: 0, 
    waist: 0, waistToHip: 0, proteinPercent: 0, bodyType: '-', weightSuggestion: '-',
    steps: 0, activeMinutes: 0, activityCalories: 0, sleep: '', energyScore: 0, 
    heartRate: 0, minHeartRate: 0, maxHeartRate: 0, bloodPressure: '', waterIntake: 0,
    weeklyDuration: 0, weeklySessions: 0, weeklyCalories: 0
  };

  const [formBio, setFormBio] = useState({ ...emptyBio });

  const bioData = useMemo(() => {
     if (history[todayStr] && history[todayStr].bioData) return history[todayStr].bioData;
     return { ...emptyBio, height: 170, weight: 70 }; 
  }, [history, todayStr]);

  // ==========================================
  // FUNGSI AKSI (TOMBOL & FORM)
  // ==========================================
  const handleToggleApp = (appKey) => {
     setConnectedApps(prev => ({ ...prev, [appKey]: !prev[appKey] }));
  };

  const handleFetchData = () => {
     playSoundEffect('click', soundEnabled);
     setIsSyncing(true);
     // Nanti kita akan isi ini dengan perintah penarikan data dari Health Connect!
     setTimeout(() => setIsSyncing(false), 2000); 
  };

  useEffect(() => {
     if (showManualModal) {
         if (history[modalDate] && history[modalDate].bioData) {
             setFormBio(history[modalDate].bioData);
         } else {
             setFormBio({ ...emptyBio, height: bioData.height || 170, weight: bioData.weight || 70 });
         }
     }
  }, [modalDate, showManualModal, history]);

  const evaluateBiometrics = (data) => {
     let newData = { ...data };
     if (newData.height > 0 && newData.weight > 0) {
         const hMeter = newData.height / 100;
         newData.bmi = Number((newData.weight / (hMeter * hMeter)).toFixed(1));
         if (newData.bmi < 18.5) newData.bmiStatus = 'Underweight';
         else if (newData.bmi <= 22.9) newData.bmiStatus = 'Normal';
         else if (newData.bmi <= 24.9) newData.bmiStatus = 'Overweight';
         else newData.bmiStatus = 'Obese';
     }
     if (newData.bodyFat > 0) {
         if (newData.bodyFat < 10) newData.bodyFatStatus = 'Rendah';
         else if (newData.bodyFat <= 20) newData.bodyFatStatus = 'Normal';
         else if (newData.bodyFat <= 25) newData.bodyFatStatus = 'Overfat';
         else newData.bodyFatStatus = 'Obese';
     }
     return newData;
  };

  const getScoreColor = (score) => {
      if (!score) return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
      if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500';
      if (score >= 80) return 'text-lime-500 bg-lime-500/10 border-lime-500';
      if (score >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500';
      return 'text-rose-500 bg-rose-500/10 border-rose-500';
  };

  const handleSaveManualData = () => {
     playSoundEffect('click', soundEnabled);
     const evaluatedData = evaluateBiometrics(formBio);
     
     setHistory(prev => ({
         ...prev,
         [modalDate]: {
             ...(prev[modalDate] || {}),
             bioData: evaluatedData
         }
     }));
     setShowManualModal(false);
  };

  const handleDeleteBioData = () => {
     playSoundEffect('click', soundEnabled);
     if(window.confirm(`Yakin ingin menghapus data biometrik di tanggal ${modalDate}?`)) {
         setHistory(prev => {
             const newHistory = { ...prev };
             if (newHistory[modalDate]) {
                 delete newHistory[modalDate].bioData;
                 if (!newHistory[modalDate].programId && !newHistory[modalDate].status) {
                     delete newHistory[modalDate];
                 }
             }
             return newHistory;
         });
         setShowManualModal(false);
     }
  };

  const handleChartPointClick = (clickedDateStr) => {
      playSoundEffect('click', soundEnabled);
      setModalDate(clickedDateStr);
      setManualTab('komposisi');
      setShowManualModal(true);
  };

  // ==========================================
  // MESIN PSEUDO-AI: ANALISIS PEMULIHAN
  // ==========================================
  const analysis = useMemo(() => {
    const todayData = history[todayStr];
    const isTodayDone = todayData?.status === 'completed';
    const todayPlanned = todayData?.status === 'planned' ? todayData.programName : null;

    const muscleFatigue = {};
    const msPerDay = 86400000;
    
    for (let i = 0; i <= 3; i++) {
        const dStr = getLocalYMD(new Date(new Date().getTime() - (i * msPerDay)));
        const h = history[dStr];
        if (h?.status === 'completed' && h.log?.exerciseLogs) {
            Object.keys(h.log.exerciseLogs).forEach(exId => {
                const baseId = exId.includes('-') ? Number(exId.split('-')[0]) : Number(exId);
                const ex = programs.flatMap(p => p.exercises).find(e => e.id === baseId);
                if (ex && ex.target) {
                    const targets = Array.isArray(ex.target) ? ex.target : [ex.target];
                    targets.forEach(m => { if (!muscleFatigue[m] || i < muscleFatigue[m]) muscleFatigue[m] = i; });
                }
            });
        }
    }

    const ready = [];
    ['Dada Tengah', 'Punggung Atas', 'Quads', 'Hams', 'Deltoid Depan', 'Biceps', 'Triceps'].forEach(m => {
        if (muscleFatigue[m] !== 0 && muscleFatigue[m] !== 1) ready.push(m);
    });

    let recommendation = ""; let medicalTip = "";
    if (isTodayDone) {
        recommendation = "Latihan hari ini selesai! Fase anabolik telah dimulai, biarkan tubuh melakukan perbaikan seluler.";
        medicalTip = "Tip Nutrisi: Maksimalkan sintesis protein otot (MPS). Konsumsi ikan segar atau ayam organik pasca-latihan sangat optimal untuk recovery.";
    } else if (todayPlanned) {
        recommendation = `Fokus hari ini: ${todayPlanned}. Siapkan mental dan lakukan pemanasan dinamis untuk melumasi persendian.`;
        medicalTip = "Tip Klinis: Jaga hidrasi dan konsumsi kafein 30 menit sebelum latihan untuk menstimulasi kewaspadaan Sistem Saraf Pusat (CNS).";
    } else {
        if (ready.length > 0) {
            recommendation = `Otot ${ready.slice(0, 2).join(' & ')} sudah pulih dari DOMS. Sangat ideal untuk dilatih hari ini!`;
            medicalTip = "Tip Fisiologi: Jeda 48-72 jam pada otot besar sudah cukup untuk memulihkan neuromuscular junction.";
        } else {
            recommendation = "Mayoritas otot masih dalam masa pemulihan. Pertimbangkan Active Rest hari ini.";
            medicalTip = "Tip Medis: Memaksakan latihan saat otot masih meradang kronis dapat mengganggu pemulihan motorik saraf.";
        }
    }

    return { recommendation, medicalTip };
  }, [history, programs, todayStr]);

  const isAnyAppConnected = connectedApps.xiaomi || connectedApps.samsung || connectedApps.lyfeat;
  const scoreStyle = getScoreColor(bioData.bodyScore);

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-6">
      
      {/* HEADER & INTEGRASI APPS */}
      <div className="pt-2 flex justify-between items-center mb-2">
         <div>
            <h1 className={`text-2xl font-black ${t.textMain}`}>Halo, {user?.name?.split(' ')[0] || 'Kawan'} 👋</h1>
            <div className="flex items-center space-x-1.5 mt-1">
               <p className={`text-xs font-bold ${t.textMuted}`}>{new Date().toLocaleDateString(lang.workout === 'Latihan' ? 'id-ID' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
            </div>
         </div>
         
         <div className="flex flex-col space-y-2 items-end">
             <button onClick={() => { playSoundEffect('click', soundEnabled); setShowSyncModal(true); }} className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all ${isAnyAppConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : t.btnBg + ' ' + t.border + ' ' + t.textMuted}`}>
                {isAnyAppConnected ? 'Kelola Koneksi (Aktif)' : 'Hubungkan App'}
             </button>
             
             {isAnyAppConnected && (
                 <button onClick={handleFetchData} disabled={isSyncing} className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black shadow-lg transition-all ${isSyncing ? t.bgCard + ' ' + t.textMuted + ' border ' + t.border : t.bgAccent + ' text-white hover:opacity-90'}`}>
                    <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                    <span>{isSyncing ? 'Menarik Data...' : 'Tarik Data'}</span>
                 </button>
             )}
         </div>
      </div>

      {/* MODULAR CHART COMPONENT */}
      <DashboardChart 
         t={t} theme={theme} history={history} 
         soundEnabled={soundEnabled} playSoundEffect={playSoundEffect} 
         onPointClick={handleChartPointClick} 
      />

      {/* 1. KARTU BODY COMPOSITION */}
      <div className={`p-5 rounded-2xl border ${t.border} ${t.bgCard} shadow-sm relative overflow-hidden`}>
         <div className="flex justify-between items-center mb-5 relative z-10">
             <div className="flex items-center space-x-2">
                 <Scale size={18} className={t.textAccent} />
                 <h3 className={`font-black text-sm ${t.textMain} uppercase tracking-wider`}>Komposisi Tubuh</h3>
             </div>
             <button onClick={() => { playSoundEffect('click', soundEnabled); setModalDate(todayStr); setManualTab('komposisi'); setShowManualModal(true); }} className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl ${t.btnBg} ${t.textMuted} hover:${t.textMain} border ${t.border}`}>Update Hari Ini</button>
         </div>
         
         <div className="flex items-center space-x-6 mb-6 relative z-10">
             <div className={`w-20 h-20 shrink-0 rounded-full flex flex-col items-center justify-center border-4 ${scoreStyle} shadow-lg shadow-black/5`}>
                <span className="text-2xl font-black leading-none">{bioData.bodyScore || '-'}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-80">Score</span>
             </div>
             <div className="flex-1 space-y-2">
                 <div className="flex justify-between items-center border-b border-dashed border-slate-500/30 pb-1">
                     <span className={`text-xs font-bold ${t.textMuted}`}>BMI (Asia)</span>
                     <div className="text-right">
                        <span className={`text-sm font-black ${t.textMain} mr-1`}>{bioData.bmi || '-'}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${bioData.bmiStatus === 'Normal' ? 'bg-emerald-500/20 text-emerald-500' : bioData.bmiStatus === 'Overweight' ? 'bg-amber-500/20 text-amber-500' : bioData.bmiStatus === 'Obese' ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-500'}`}>{bioData.bmiStatus}</span>
                     </div>
                 </div>
                 <div className="flex justify-between items-center border-b border-dashed border-slate-500/30 pb-1">
                     <span className={`text-xs font-bold ${t.textMuted}`}>Body Fat</span>
                     <div className="text-right">
                        <span className={`text-sm font-black ${t.textMain} mr-1`}>{bioData.bodyFat || '-'}%</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${bioData.bodyFatStatus === 'Normal' ? 'bg-emerald-500/20 text-emerald-500' : bioData.bodyFatStatus === 'Overfat' ? 'bg-amber-500/20 text-amber-500' : bioData.bodyFatStatus === 'Obese' ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-500'}`}>{bioData.bodyFatStatus}</span>
                     </div>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className={`text-[11px] font-bold ${t.textMuted}`}>Lingkar Perut</span>
                     <div className="text-right">
                        <span className={`text-sm font-black ${t.textMain} mr-1`}>{bioData.waist || '-'} <span className="text-[9px] text-zinc-500">cm</span></span>
                        {bioData.waist > 0 && ( <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${bioData.waist < 90 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>{bioData.waist < 90 ? 'Aman' : 'Risiko'}</span> )}
                     </div>
                 </div>
             </div>
         </div>

         <div className="grid grid-cols-4 gap-2 relative z-10 text-xs">
             <div className={`p-2 rounded-xl ${t.inputBg} flex flex-col items-center text-center`}><span className={`text-[11px] font-black ${t.textMain}`}>{bioData.muscleMass || '-'} kg</span><span className={`text-[8px] font-bold ${t.textMuted} uppercase mt-0.5`}>Massa Otot</span></div>
             <div className={`p-2 rounded-xl ${t.inputBg} flex flex-col items-center text-center`}><span className={`text-[11px] font-black ${t.textMain}`}>{bioData.musclePercent || '-'} %</span><span className={`text-[8px] font-bold ${t.textMuted} uppercase mt-0.5`}>Otot (%)</span></div>
             <div className={`p-2 rounded-xl ${t.inputBg} flex flex-col items-center text-center`}><span className={`text-[11px] font-black ${t.textMain}`}>{bioData.proteinPercent || '-'} %</span><span className={`text-[8px] font-bold ${t.textMuted} uppercase mt-0.5`}>Protein</span></div>
             <div className={`p-2 rounded-xl ${t.inputBg} flex flex-col items-center text-center`}><span className={`text-[11px] font-black ${t.textMain}`}>{bioData.waterPercent || '-'} %</span><span className={`text-[8px] font-bold ${t.textMuted} uppercase mt-0.5`}>Kadar Air</span></div>
             <div className={`p-2 rounded-xl ${t.inputBg} flex flex-col items-center text-center`}><span className={`text-[11px] font-black ${t.textMain}`}>{bioData.visceralFat || '-'}</span><span className={`text-[8px] font-bold ${t.textMuted} uppercase mt-0.5`}>Visceral</span></div>
             <div className={`p-2 rounded-xl ${t.inputBg} flex flex-col items-center text-center`}><span className={`text-[11px] font-black ${t.textMain}`}>{bioData.bmr || '-'}</span><span className={`text-[8px] font-bold ${t.textMuted} uppercase mt-0.5`}>BMR</span></div>
             <div className={`p-2 rounded-xl ${t.inputBg} flex flex-col items-center text-center`}><span className={`text-[11px] font-black ${t.textMain}`}>{bioData.waistToHip || '-'}</span><span className={`text-[8px] font-bold ${t.textMuted} uppercase mt-0.5`}>Rasio W/H</span></div>
             <div className={`p-2 rounded-xl ${t.inputBg} flex flex-col items-center text-center`}><span className={`text-[11px] font-black ${t.textMain}`}>{bioData.bodyAge || '-'} th</span><span className={`text-[8px] font-bold ${t.textMuted} uppercase mt-0.5`}>Usia Tubuh</span></div>
         </div>
      </div>

      {/* 2. KARTU AKTIVITAS HARIAN & MINGGUAN */}
      <div className={`p-5 rounded-2xl border ${t.border} ${t.bgCard} shadow-sm`}>
         <div className="flex justify-between items-center mb-4">
             <div className="flex items-center space-x-2">
                 <Activity size={18} className="text-blue-500" />
                 <h3 className={`font-black text-sm ${t.textMain} uppercase tracking-wider`}>Aktivitas Harian</h3>
             </div>
             <button onClick={() => { playSoundEffect('click', soundEnabled); setModalDate(todayStr); setManualTab('harian'); setShowManualModal(true); }} className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl ${t.btnBg} ${t.textMuted} hover:${t.textMain} border ${t.border}`}>Update Hari Ini</button>
         </div>

         <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`p-3 rounded-xl ${t.inputBg} flex flex-col`}>
               <div className="flex justify-between items-center mb-1"><div className="flex items-center space-x-1.5 text-emerald-500"><Footprints size={14}/> <span className="text-[9px] font-black uppercase">Langkah Kaki</span></div></div>
               <span className={`text-base font-black ${t.textMain}`}>{bioData.steps || '-'}</span>
               <span className="text-[9px] font-bold text-zinc-500 mt-0.5">{bioData.activeMinutes || '0'} Menit Aktif • {bioData.activityCalories || '0'} kcal</span>
            </div>
            
            <div className={`p-3 rounded-xl ${t.inputBg} flex flex-col`}>
               <div className="flex items-center space-x-1.5 mb-1 text-rose-500"><HeartPulse size={14}/> <span className="text-[9px] font-black uppercase">Detak Jantung</span></div>
               <span className={`text-base font-black ${t.textMain}`}>{bioData.heartRate || '-'} <span className="text-[10px] font-normal text-zinc-500">bpm</span></span>
               <span className="text-[9px] font-bold text-zinc-500 mt-0.5">Min: {bioData.minHeartRate || '-'} • Max: {bioData.maxHeartRate || '-'}</span>
            </div>
            
            <div className={`p-3 rounded-xl ${t.inputBg} flex flex-col`}>
               <div className="flex justify-between items-center mb-1"><div className="flex items-center space-x-1.5 text-indigo-400"><Moon size={14}/> <span className="text-[9px] font-black uppercase">Tidur & Energi</span></div></div>
               <span className={`text-base font-black ${t.textMain}`}>{bioData.sleep || '-'}</span>
               <span className="text-[9px] font-bold text-zinc-500 mt-0.5">Energy Score: {bioData.energyScore || '-'} / 100</span>
            </div>
            
            <div className={`p-3 rounded-xl ${t.inputBg} flex flex-col`}>
               <div className="flex items-center space-x-1.5 mb-1 text-cyan-500"><Droplets size={14}/> <span className="text-[9px] font-black uppercase">Cairan & Tensi</span></div>
               <span className={`text-base font-black ${t.textMain}`}>{bioData.waterIntake || '-'} <span className="text-[10px] font-normal text-zinc-500">Liter</span></span>
               <span className="text-[9px] font-bold text-zinc-500 mt-0.5">BP: {bioData.bloodPressure || '-'}</span>
            </div>
         </div>

         <div className={`p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed ${t.border} flex justify-between items-center`}>
             <div className="flex items-center space-x-2">
                 <Trophy size={16} className={t.textAccent}/>
                 <div className="flex flex-col">
                     <span className={`text-[10px] font-black uppercase ${t.textMain}`}>Total Olahraga Mingguan</span>
                     <span className={`text-[9px] font-bold ${t.textMuted}`}>{bioData.weeklySessions || '0'} Sesi • {bioData.weeklyCalories || '0'} kcal</span>
                 </div>
             </div>
             <span className={`text-sm font-black ${t.textAccent}`}>{bioData.weeklyDuration || '-'} <span className="text-[9px] font-bold text-zinc-500">Mins</span></span>
         </div>
      </div>

      {/* 3. KARTU REKOMENDASI KLINIS */}
      <div className={`p-5 rounded-2xl border ${t.border} bg-gradient-to-br ${t.gradientBg} text-white shadow-xl ${t.shadowAccent} relative overflow-hidden`}>
         <div className="absolute top-0 right-0 p-4 opacity-20"><Zap size={80} /></div>
         <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3">
               <Brain size={18} /> <span className="text-xs font-black uppercase tracking-wider opacity-90">Analisis Pemulihan</span>
            </div>
            <p className="text-sm font-bold mb-4 leading-relaxed">{analysis.recommendation}</p>
            <div className="bg-black/20 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                <p className="text-[11px] font-medium leading-relaxed opacity-90">{analysis.medicalTip}</p>
            </div>
         </div>
      </div>

      {/* MODULAR MODALS */}
      <DashboardModals 
        t={t} showSyncModal={showSyncModal} setShowSyncModal={setShowSyncModal} connectedApps={connectedApps} handleToggleApp={handleToggleApp}
        showManualModal={showManualModal} setShowManualModal={setShowManualModal} manualTab={manualTab} setManualTab={setManualTab}
        modalDate={modalDate} setModalDate={setModalDate} formBio={formBio} setFormBio={setFormBio}
        handleSaveManualData={handleSaveManualData} handleDeleteBioData={handleDeleteBioData} soundEnabled={soundEnabled}
      />
    </div>
  );
};

export default DashboardTab;