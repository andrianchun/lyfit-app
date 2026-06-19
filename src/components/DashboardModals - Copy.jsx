import React, { useState } from 'react';
import { X, Check, Trash2, CalendarDays, Loader2, ShieldAlert } from 'lucide-react';
import { playSoundEffect } from '../utils/audio';

const DashboardModals = ({ 
  t, showSyncModal, setShowSyncModal, connectedApps, handleToggleApp,
  showManualModal, setShowManualModal, manualTab, setManualTab, 
  modalDate, setModalDate, formBio, setFormBio, 
  handleSaveManualData, handleDeleteBioData, soundEnabled
}) => {

  const [authSim, setAuthSim] = useState(null); 

  const triggerConnection = (appKey) => {
      playSoundEffect('click', soundEnabled);
      
      // JALUR LYFEAT (Firebase Internal)
      if (appKey === 'lyfeat') {
          if (connectedApps[appKey]) { handleToggleApp(appKey); return; }
          setAuthSim(appKey);
          setTimeout(() => { setAuthSim(null); handleToggleApp(appKey); }, 2000);
          return;
      }

      // JALUR XIAOMI & SAMSUNG (HEALTH CONNECT / GOOGLE FIT)
      if (connectedApps[appKey]) {
          handleToggleApp(appKey);
          return;
      }

      // Pastikan dibuka di HP (Plugin Native tidak akan jalan di browser web)
      if (!navigator || !navigator.health) {
          alert("Mesin Android tidak terdeteksi. Pastikan Anda menjalankan ini lewat APK di HP.");
          return;
      }

      setAuthSim(appKey);

      // 1. Cek ketersediaan layanan kesehatan di sistem HP
      navigator.health.isAvailable(
          (available) => {
              if (!available) {
                  setAuthSim(null);
                  alert("Layanan Health Connect / Google Fit tidak aktif di perangkat ini.");
                  return;
              }

              // 2. Tentukan data apa yang mau disedot
              const dataTypes = appKey === 'xiaomi' 
                  ? [{ read: ['weight', 'fat_percentage'] }] 
                  : [{ read: ['steps', 'heart_rate', 'sleep'] }];

              // 3. Minta Izin ke Android
              navigator.health.requestAuthorization(
                  dataTypes,
                  () => {
                      // Sukses diizinkan user
                      setAuthSim(null);
                      handleToggleApp(appKey);
                  },
                  (err) => {
                      // Ditolak
                      console.error("Izin ditolak:", err);
                      setAuthSim(null);
                      alert("Gagal mendapatkan izin akses data dari sistem Android.");
                  }
              );
          },
          (err) => {
              setAuthSim(null);
              alert("Error mengecek sistem kesehatan: " + err);
          }
      );
  };

  return (
    <>
      {/* 1. MODAL KELOLA KONEKSI APLIKASI */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
           <div className={`w-full max-w-sm ${t.bgCard} rounded-2xl border ${t.border} p-5 shadow-2xl animate-in zoom-in-95 relative overflow-hidden`}>
              
              {/* Overlay Simulasi Loading Otentikasi */}
              {authSim && (
                  <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in">
                      <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
                      <h4 className="font-black text-sm tracking-wider uppercase mb-1">Membuka Akses</h4>
                      <p className="text-[10px] font-bold text-center px-6 opacity-80">
                          Meminta izin dari {authSim === 'lyfeat' ? 'LyFeat Cloud' : 'Android Health Connect'} untuk sinkronisasi data dua arah...
                      </p>
                  </div>
              )}

              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-black text-base">Ekosistem Aplikasi</h3>
                 <button onClick={() => setShowSyncModal(false)} className={`p-1.5 rounded-full ${t.btnBg}`}><X size={16}/></button>
              </div>
              <p className={`text-[10px] font-bold ${t.textMuted} mb-4 flex items-start`}>
                  <ShieldAlert size={14} className="mr-1.5 shrink-0" />
                  Pilih layanan yang diizinkan untuk saling berbagi dan membaca data biometrik secara background.
              </p>
              
              <div className="space-y-2 mb-4">
                  {/* KONEKSI XIAOMI */}
                  <div onClick={() => triggerConnection('xiaomi')} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-colors ${connectedApps.xiaomi ? 'bg-[#FF6900]/10 border-[#FF6900]/40' : t.inputBg + ' ' + t.border}`}>
                      <div className="flex flex-col">
                          <span className="font-black text-sm text-[#FF6900]">Mi Fitness (Timbangan)</span>
                          <span className={`text-[10px] font-bold ${t.textMuted}`}>Izinkan baca BB, Lemak, & BMR</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${connectedApps.xiaomi ? 'bg-[#FF6900] border-transparent text-white' : 'border-zinc-500'}`}>
                          {connectedApps.xiaomi && <Check size={12} strokeWidth={3}/>}
                      </div>
                  </div>

                  {/* KONEKSI SAMSUNG */}
                  <div onClick={() => triggerConnection('samsung')} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-colors ${connectedApps.samsung ? 'bg-[#1428A0]/10 border-[#1428A0]/40' : t.inputBg + ' ' + t.border}`}>
                      <div className="flex flex-col">
                          <span className="font-black text-sm text-[#1428A0]">Samsung Health</span>
                          <span className={`text-[10px] font-bold ${t.textMuted}`}>Izinkan baca Langkah, Nadi, & Tidur</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${connectedApps.samsung ? 'bg-[#1428A0] border-transparent text-white' : 'border-zinc-500'}`}>
                          {connectedApps.samsung && <Check size={12} strokeWidth={3}/>}
                      </div>
                  </div>

                  {/* KONEKSI LYFEAT (NUTRITION TRACKER) */}
                  <div onClick={() => triggerConnection('lyfeat')} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-colors ${connectedApps.lyfeat ? 'bg-violet-500/10 border-violet-500/40' : t.inputBg + ' ' + t.border}`}>
                      <div className="flex flex-col">
                          <span className="font-black text-sm text-violet-500">LyFeat (Nutrition)</span>
                          <span className={`text-[10px] font-bold ${t.textMuted}`}>Kirim kalori workout, terima data nutrisi</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${connectedApps.lyfeat ? 'bg-violet-500 border-transparent text-white' : 'border-zinc-500'}`}>
                          {connectedApps.lyfeat && <Check size={12} strokeWidth={3}/>}
                      </div>
                  </div>
              </div>
              <button onClick={() => setShowSyncModal(false)} className={`w-full py-3 rounded-xl font-black text-sm text-white ${t.bgAccent}`}>Selesai</button>
           </div>
        </div>
      )}

      {/* 2. MODAL INPUT MANUAL & IN-DEPTH EDITING */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in">
           <div className={`w-full max-w-md mx-auto ${t.bgCard} rounded-t-3xl sm:rounded-2xl overflow-hidden border ${t.border} p-5 shadow-2xl max-h-[85vh] flex flex-col`}>
              
              <div className="flex justify-between items-start mb-4 shrink-0">
                 <div>
                    <h3 className="font-black text-base leading-tight">Input Presisi</h3>
                    <div className="flex items-center space-x-2 mt-2">
                        <CalendarDays size={14} className={t.textMuted} />
                        <input type="date" value={modalDate} onChange={(e) => setModalDate(e.target.value)} className={`bg-transparent text-xs font-bold outline-none ${t.textAccent} cursor-pointer`} />
                    </div>
                 </div>
                 <div className="flex space-x-2">
                     <button onClick={handleDeleteBioData} className={`p-2 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors`}><Trash2 size={16}/></button>
                     <button onClick={() => setShowManualModal(false)} className={`p-2 rounded-full ${t.btnBg}`}><X size={16}/></button>
                 </div>
              </div>

              <div className="flex space-x-2 mb-4 shrink-0">
                 <button onClick={() => setManualTab('komposisi')} className={`flex-1 py-2 rounded-xl text-[10px] font-black border transition-all ${manualTab === 'komposisi' ? t.bgAccent + ' text-white border-transparent' : t.btnBg + ' ' + t.textMuted + ' ' + t.border}`}>Komposisi Tubuh</button>
                 <button onClick={() => setManualTab('harian')} className={`flex-1 py-2 rounded-xl text-[10px] font-black border transition-all ${manualTab === 'harian' ? t.bgAccent + ' text-white border-transparent' : t.btnBg + ' ' + t.textMuted + ' ' + t.border}`}>Aktivitas & Harian</button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs font-bold pb-4 hide-scrollbar">
                 {manualTab === 'komposisi' ? (
                   <div className="grid grid-cols-2 gap-3">
                         <div><label className={`block ${t.textMuted} mb-1`}>Body Score (0-100)</label><input type="number" value={formBio.bodyScore === 0 ? '' : formBio.bodyScore} onChange={(e)=>setFormBio({...formBio, bodyScore: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                         <div><label className={`block ${t.textMuted} mb-1`}>Berat Badan (kg)</label><input type="number" step="0.1" value={formBio.weight === 0 ? '' : formBio.weight} onChange={(e)=>setFormBio({...formBio, weight: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                         <div><label className={`block ${t.textMuted} mb-1`}>Tinggi Badan (cm)</label><input type="number" value={formBio.height === 0 ? '' : formBio.height} onChange={(e)=>setFormBio({...formBio, height: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                         <div><label className={`block ${t.textMuted} mb-1`}>Lingkar Perut (cm)</label><input type="number" step="0.1" value={formBio.waist === 0 ? '' : formBio.waist} onChange={(e)=>setFormBio({...formBio, waist: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                         <div><label className={`block ${t.textMuted} mb-1`}>Waist to Hip Ratio</label><input type="number" step="0.01" value={formBio.waistToHip === 0 ? '' : formBio.waistToHip} onChange={(e)=>setFormBio({...formBio, waistToHip: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                         <div><label className={`block ${t.textMuted} mb-1`}>Body Fat (%)</label><input type="number" step="0.1" value={formBio.bodyFat === 0 ? '' : formBio.bodyFat} onChange={(e)=>setFormBio({...formBio, bodyFat: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                         <div><label className={`block ${t.textMuted} mb-1`}>Massa Otot (kg)</label><input type="number" step="0.1" value={formBio.muscleMass === 0 ? '' : formBio.muscleMass} onChange={(e)=>setFormBio({...formBio, muscleMass: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                         <div><label className={`block ${t.textMuted} mb-1`}>Muscle Percentage (%)</label><input type="number" step="0.1" value={formBio.musclePercent === 0 ? '' : formBio.musclePercent} onChange={(e)=>setFormBio({...formBio, musclePercent: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                         <div><label className={`block ${t.textMuted} mb-1`}>Protein Percentage (%)</label><input type="number" step="0.1" value={formBio.proteinPercent === 0 ? '' : formBio.proteinPercent} onChange={(e)=>setFormBio({...formBio, proteinPercent: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                         <div><label className={`block ${t.textMuted} mb-1`}>Kadar Air (%)</label><input type="number" step="0.1" value={formBio.waterPercent === 0 ? '' : formBio.waterPercent} onChange={(e)=>setFormBio({...formBio, waterPercent: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                         <div><label className={`block ${t.textMuted} mb-1`}>Visceral Fat Rating</label><input type="number" value={formBio.visceralFat === 0 ? '' : formBio.visceralFat} onChange={(e)=>setFormBio({...formBio, visceralFat: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                         <div><label className={`block ${t.textMuted} mb-1`}>BMR (kcal)</label><input type="number" value={formBio.bmr === 0 ? '' : formBio.bmr} onChange={(e)=>setFormBio({...formBio, bmr: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                         <div><label className={`block ${t.textMuted} mb-1`}>Usia Sel Tubuh (th)</label><input type="number" value={formBio.bodyAge === 0 ? '' : formBio.bodyAge} onChange={(e)=>setFormBio({...formBio, bodyAge: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                     </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-3">
                       <div><label className={`block ${t.textMuted} mb-1`}>Jumlah Langkah</label><input type="number" value={formBio.steps === 0 ? '' : formBio.steps} onChange={(e)=>setFormBio({...formBio, steps: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                       <div><label className={`block ${t.textMuted} mb-1`}>Energy Score (0-100)</label><input type="number" value={formBio.energyScore === 0 ? '' : formBio.energyScore} onChange={(e)=>setFormBio({...formBio, energyScore: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                       <div><label className={`block ${t.textMuted} mb-1`}>Waktu Aktif (Menit)</label><input type="number" value={formBio.activeMinutes === 0 ? '' : formBio.activeMinutes} onChange={(e)=>setFormBio({...formBio, activeMinutes: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                       <div><label className={`block ${t.textMuted} mb-1`}>Kalori Aktif (kcal)</label><input type="number" value={formBio.activityCalories === 0 ? '' : formBio.activityCalories} onChange={(e)=>setFormBio({...formBio, activityCalories: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                       <div><label className={`block ${t.textMuted} mb-1`}>Detak Jantung Avg (bpm)</label><input type="number" value={formBio.heartRate === 0 ? '' : formBio.heartRate} onChange={(e)=>setFormBio({...formBio, heartRate: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                       <div>
                           <label className={`block ${t.textMuted} mb-1`}>Detak Jantung Min/Max</label>
                           <div className="flex space-x-1">
                               <input type="number" value={formBio.minHeartRate === 0 ? '' : formBio.minHeartRate} onChange={(e)=>setFormBio({...formBio, minHeartRate: Number(e.target.value)})} className={`w-1/2 ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="Min" />
                               <input type="number" value={formBio.maxHeartRate === 0 ? '' : formBio.maxHeartRate} onChange={(e)=>setFormBio({...formBio, maxHeartRate: Number(e.target.value)})} className={`w-1/2 ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="Max" />
                           </div>
                       </div>
                       <div><label className={`block ${t.textMuted} mb-1`}>Tidur (Misal: 7h 15m)</label><input type="text" value={formBio.sleep} onChange={(e)=>setFormBio({...formBio, sleep: e.target.value})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0h 0m" /></div>
                       <div><label className={`block ${t.textMuted} mb-1`}>Tekanan Darah (Sistolik/Diastolik)</label><input type="text" value={formBio.bloodPressure} onChange={(e)=>setFormBio({...formBio, bloodPressure: e.target.value})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="120/80" /></div>
                       
                       <div className="col-span-2 mt-2 pt-2 border-t border-dashed border-zinc-700">
                           <span className={`block ${t.textAccent} mb-2 uppercase tracking-wider`}>Rekap Latihan Mingguan</span>
                       </div>
                       <div><label className={`block ${t.textMuted} mb-1`}>Total Sesi (x/minggu)</label><input type="number" value={formBio.weeklySessions === 0 ? '' : formBio.weeklySessions} onChange={(e)=>setFormBio({...formBio, weeklySessions: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                       <div><label className={`block ${t.textMuted} mb-1`}>Total Durasi Workout (Menit)</label><input type="number" value={formBio.weeklyDuration === 0 ? '' : formBio.weeklyDuration} onChange={(e)=>setFormBio({...formBio, weeklyDuration: Number(e.target.value)})} className={`w-full ${t.inputBg} ${t.textMain} p-3 rounded-xl outline-none font-black text-center`} placeholder="0" /></div>
                   </div>
                 )}
              </div>

              <div className="flex space-x-3 pt-3 border-t border-dashed border-zinc-700 shrink-0">
                  <button onClick={handleSaveManualData} className={`w-full py-3 rounded-xl font-black text-white ${t.bgAccent}`}>Simpan & Sinkronkan</button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default DashboardModals;