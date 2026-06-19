import React from 'react';
import { X, Video, ExternalLink } from 'lucide-react';
import { getVideoId } from '../data/constants';

const VideoModal = ({ activeVideoModal, setActiveVideoModal }) => {
  if (!activeVideoModal) return null;

  const rawUrls = activeVideoModal.ytVideo || '';
  const urls = rawUrls.split(/(?:,|\s)+/).filter(u => u.trim() !== '');

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in`} onClick={onClose}>
      <div className={`w-full max-w-md mx-auto bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-zinc-800`} onClick={e => e.stopPropagation()}>
        
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/50 shrink-0">
          <h3 className="font-bold text-white truncate pr-4 text-lg">{activeVideoModal.name}</h3>
          <button onClick={() => setActiveVideoModal(null)} className="text-zinc-400 p-2 hover:bg-zinc-800 hover:text-white rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-black">
          {urls.length > 0 ? urls.map((url, i) => {
            const vId = getVideoId(url);
            return (
              <div key={i} className="flex flex-col space-y-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="aspect-video w-full bg-black relative rounded-lg overflow-hidden flex flex-col items-center justify-center">
                  {vId ? (
                    <iframe
                      className="absolute inset-0 w-full h-full border-0"
                      src={`https://www.youtube.com/embed/${vId}?autoplay=1&mute=1&loop=1&playlist=${vId}`}
                      title={`${activeVideoModal.name} - Video ${i+1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="text-zinc-500 font-bold flex flex-col items-center">
                      <Video size={48} className="mb-2 opacity-50" />
                      <span>Link Video {i+1} Tidak Valid</span>
                    </div>
                  )}
                </div>
                {vId && (
                  <a href={`https://www.youtube.com/watch?v=${vId}`} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white text-xs font-bold rounded-lg transition-colors flex justify-center items-center">
                    <ExternalLink size={14} className="mr-2" /> Buka di YouTube (Video {i+1})
                  </a>
                )}
              </div>
            );
          }) : (
            <div className="text-zinc-500 py-10 text-center font-bold">Belum ada video untuk gerakan ini.</div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default VideoModal;