import React from 'react';
import { Dumbbell, Calendar, LineChart, ClipboardList, Database, LayoutDashboard } from 'lucide-react';

const BottomNav = ({ t, lang, activeTab, setActiveTab, setIsEditingMode, soundEnabled, playSoundEffect }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'workout', icon: Dumbbell, label: lang.workout || 'Latihan' },
    { id: 'calendar', icon: Calendar, label: lang.calendar || 'Kalender' },
    { id: 'program', icon: ClipboardList, label: 'Program' },
    { id: 'database', icon: Database, label: 'Database' },
  ];

  const handleTabClick = (id) => {
    playSoundEffect('click', soundEnabled);
    setActiveTab(id);
    setIsEditingMode(false);
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${t.navBg} border-t ${t.border} pb-safe z-40 transition-colors duration-300`}>
      <div className="flex justify-around items-center max-w-2xl mx-auto px-1 py-2.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center justify-center w-full space-y-0.5 transition-all duration-300 ${activeTab === tab.id ? t.navIconActive + ' scale-110' : t.navIconInactive + ' hover:' + t.textMain}`}
          >
            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[8px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;