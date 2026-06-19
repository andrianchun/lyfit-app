import React from 'react';
import { X, Moon, Sun, Globe, Volume2, VolumeX, Timer, Database, HelpCircle, Undo, Redo, Download, Upload, LogOut } from 'lucide-react';

export default function SettingsModal({
  showSettings, setShowSettings, t, lang,
  theme, setTheme, language, setLanguage,
  soundEnabled, setSoundEnabled,
  defaultRestTime, setDefaultRestTime,
  undoStack, redoStack, handleUndo, handleRedo,
  setShowLibManager, setShowHelp,
  exportData, handleImportFile,
  user, handleLogout
}) {
  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className={`relative w-full max-w-md ${t.bgCard} rounded-3xl sm:rounded-2xl shadow-2xl border ${t.border} overflow-hidden flex flex-col max-h-[90vh]`}>

        {/* HEADER MODAL */}
        <div className={`flex justify-between items-center p-4 border-b ${t.border}`}>
          <h2 className="text-xl font-black">{lang.settings}</h2>
          <button onClick={() => setShowSettings(false)} className={`p-2 rounded-full ${t.btnBg} hover:opacity-80 transition-opacity`}>
            <X size={20} className={t.textMain} />
          </button>
        </div>

        {/* BODY MODAL (BISA DI-SCROLL) */}
        <div className="p-4 overflow-y-auto space-y-6">

          {/* 1. BLOK PROFIL USER (GMAIL SINKRONISASI) */}
          <div className={`p-4 rounded-2xl border ${t.border} ${t.inputBg} flex items-center space-x-4`}>
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profil" 
                referrerPolicy="no-referrer"
                className={`w-14 h-14 rounded-full object-cover border-2 border-transparent ring-2 ${t.ringAccent}`} 
              />
            ) : (
              <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-tr ${t.gradientBg} text-white font-black text-xl shadow-lg`}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            
            <div className="flex-1 overflow-hidden">
              <h3 className={`font-black text-lg ${t.textMain} truncate`}>{user?.name || 'Sobat LyFit'}</h3>
              <p className={`text-xs font-medium ${t.textMuted} truncate`}>{user?.email || 'email@example.com'}</p>
            </div>
          </div>

          {/* 2. TOMBOL UNDO / REDO */}
          <div className="flex space-x-2">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl font-bold transition-all ${undoStack.length > 0 ? `${t.btnBg} ${t.textMain} active:scale-95` : `opacity-40 cursor-not-allowed bg-transparent ${t.textMuted} border ${t.border}`}`}
            >
              <Undo size={18} /> <span>Undo</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl font-bold transition-all ${redoStack.length > 0 ? `${t.btnBg} ${t.textMain} active:scale-95` : `opacity-40 cursor-not-allowed bg-transparent ${t.textMuted} border ${t.border}`}`}
            >
              <Redo size={18} /> <span>Redo</span>
            </button>
          </div>

          <hr className={t.border} />

          {/* 3. PREFERENSI APLIKASI */}
          <div className="space-y-4">
            
            {/* Tema Gelap/Terang */}
            <div className="flex justify-between items-center">
              <div className={`flex items-center space-x-3 ${t.textMain}`}>
                <Moon size={20} className={t.textAccent}/> 
                <span className="font-bold">{lang.theme}</span>
              </div>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`px-4 py-2 rounded-xl font-bold ${t.btnBg} ${t.textMain} active:scale-95 transition-all`}>
                {theme === 'dark' ? 'Dark' : 'Light'}
              </button>
            </div>

            {/* Bahasa */}
            <div className="flex justify-between items-center">
              <div className={`flex items-center space-x-3 ${t.textMain}`}>
                <Globe size={20} className={t.textAccent}/> 
                <span className="font-bold">{lang.lang}</span>
              </div>
              <button onClick={() => setLanguage(language === 'ID' ? 'EN' : 'ID')} className={`px-4 py-2 rounded-xl font-bold ${t.btnBg} ${t.textMain} active:scale-95 transition-all`}>
                {language}
              </button>
            </div>

            {/* Suara Efek */}
            <div className="flex justify-between items-center">
              <div className={`flex items-center space-x-3 ${t.textMain}`}>
                {soundEnabled ? <Volume2 size={20} className={t.textAccent}/> : <VolumeX size={20} className={t.textMuted}/>}
                <span className="font-bold">{lang.sound}</span>
              </div>
              <button onClick={() => setSoundEnabled(!soundEnabled)} className={`px-4 py-2 rounded-xl font-bold ${t.btnBg} ${t.textMain} active:scale-95 transition-all`}>
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Timer Istirahat Default */}
            <div className="flex justify-between items-center">
              <div className={`flex items-center space-x-3 ${t.textMain}`}>
                <Timer size={20} className={t.textAccent}/> 
                <span className="font-bold">{lang.timer}</span>
              </div>
              <input
                type="number"
                value={defaultRestTime}
                onChange={(e) => setDefaultRestTime(Number(e.target.value) || 0)}
                className={`w-20 text-center font-bold px-2 py-2 rounded-xl outline-none border ${t.border} focus:ring-2 ${t.ringAccent} ${t.inputBg} ${t.textMain}`}
              />
            </div>
          </div>

          <hr className={t.border} />

          {/* 4. TOMBOL DATABASE & TUTORIAL */}
          <div className="space-y-3">
            <button onClick={() => { setShowSettings(false); setShowLibManager(true); }} className={`w-full flex items-center p-4 rounded-xl border ${t.border} ${t.btnBg} active:scale-95 transition-all space-x-4`}>
              <Database size={22} className={t.textAccent} />
              <span className={`font-bold text-left flex-1 ${t.textMain}`}>{lang.manageLib}</span>
            </button>
            
            <button onClick={() => { setShowSettings(false); setShowHelp(true); }} className={`w-full flex items-center p-4 rounded-xl border ${t.border} ${t.btnBg} active:scale-95 transition-all space-x-4`}>
              <HelpCircle size={22} className={t.textAccent} />
              <span className={`font-bold text-left flex-1 ${t.textMain}`}>{lang.help}</span>
            </button>
          </div>

          {/* 5. FITUR EXPORT / IMPORT JSON */}
          <div className={`p-4 rounded-xl border ${t.border} ${t.bgApp} space-y-3`}>
            <p className={`text-xs font-bold ${t.textMuted} uppercase tracking-wider mb-2`}>Backup & Restore Data</p>
            <div className="flex space-x-2">
              <button onClick={exportData} className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg font-bold ${t.btnBg} ${t.textMain} text-sm border ${t.border} active:scale-95 transition-all`}>
                <Download size={16} /> <span>Export (JSON)</span>
              </button>
              <label className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg font-bold ${t.btnBg} ${t.textMain} text-sm cursor-pointer border ${t.border} active:scale-95 transition-all`}>
                <Upload size={16} /> <span>Import</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>
          </div>

          {/* 6. TOMBOL LOGOUT AMAN */}
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center space-x-2 p-4 rounded-xl font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 active:scale-95 hover:bg-rose-500/20 transition-all mt-4"
          >
            <LogOut size={20} />
            <span>Logout Akun</span>
          </button>
          
        </div>
      </div>
    </div>
  );
}