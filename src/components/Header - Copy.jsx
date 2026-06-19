import React from 'react';
import { User } from 'lucide-react';

const Header = ({ t, user, showSettings, setShowSettings, soundEnabled, playSoundEffect }) => {
  return (
    <header className={`sticky top-0 z-40 ${t.navBg} border-b ${t.border} px-4 py-3 flex justify-between items-center transition-colors duration-300`}>
      <div className="flex items-center space-x-2">
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${t.gradientBg} flex items-center justify-center shadow-lg ${t.shadowAccent}`}>
          <span className="text-white font-black text-sm italic">L</span>
        </div>
        <h1 className={`text-xl font-black bg-gradient-to-r ${t.gradientText} text-transparent bg-clip-text tracking-tight`}>
          LyFit
        </h1>
      </div>
      
      <button
        onClick={() => { playSoundEffect('click', soundEnabled); setShowSettings(true); }}
        className={`relative rounded-full transition-transform active:scale-95`}
      >
        {/* LOGIKA FOTO PROFIL */}
        {user?.photoURL ? (
            <img src={user.photoURL} alt="Profil" className={`w-9 h-9 rounded-full object-cover border-2 ${t.border} hover:${t.borderAccent} transition-colors`} />
        ) : (
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${t.btnBg} border-2 ${t.border} hover:${t.borderAccent}`}>
                <User size={18} className={t.textMain} />
            </div>
        )}
      </button>
    </header>
  );
};

export default Header;