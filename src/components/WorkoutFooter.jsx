import React from 'react';
import { Wind, CheckCircle, RotateCcw } from 'lucide-react';

const WorkoutFooter = ({
  t, lang, soundEnabled, playSoundEffect,
  onOpenVideo, cooldownVideos,
  isCurrentlyCompleted, onSaveWorkout
}) => {
  return (
    <div className="mt-4 mb-8">
      {/* TOMBOL PENDINGINAN */}
      <div className="flex space-x-3 mb-6">
         <button 
            onClick={() => { playSoundEffect('click', soundEnabled); onOpenVideo({name: lang.cooldown || 'Pendinginan', ytVideo: cooldownVideos});}} 
            className="flex-1 bg-sky-500/10 text-sky-500 font-bold py-3 px-2 rounded-2xl border border-sky-500/30 flex justify-center items-center hover:bg-sky-500/20 transition-all body-lg shadow-sm"
         >
            <Wind size={16} className="mr-2"/> {lang.cooldown || 'Pendinginan'}
         </button>
      </div>
      {/* TOMBOL SIMPAN / PERBARUI (Dihapus karena auto-save) */}
    </div>
  );
};

export default WorkoutFooter;