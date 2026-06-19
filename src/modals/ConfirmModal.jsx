import React from 'react';

const ConfirmModal = ({ confirmModal, setConfirmModal, t, lang, soundEnabled, playSoundEffect }) => {
  if (!confirmModal.isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in`}>
      <div className={`w-full max-w-md mx-auto ${t.bgCard} rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border ${t.border} p-6`}>
         <h3 className="text-xl font-black mb-2">{confirmModal.title}</h3>
         <p className={`${t.textMuted} text-sm font-medium mb-6 leading-relaxed`}>{confirmModal.message}</p>
         <div className="flex space-x-3">
            <button 
              onClick={() => setConfirmModal({isOpen:false})} 
              className={`flex-1 py-3 rounded-xl font-bold ${t.btnBg} ${t.textMuted} hover:${t.textMain} transition-colors`}
            >
              {lang.cancel}
            </button>
            {confirmModal.onConfirm && (
              <button 
                onClick={() => { playSoundEffect('click', soundEnabled); confirmModal.onConfirm(); setConfirmModal({isOpen:false}); }} 
                className="flex-1 py-3 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/30"
              >
                Ya, Lanjutkan
              </button>
            )}
         </div>
      </div>
    </div>
  );
};

export default ConfirmModal;