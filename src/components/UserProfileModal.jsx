import React, { useState, useEffect } from 'react';
import { X, UserCheck, UserPlus, Share2, Grid3X3, Award } from 'lucide-react';
import { getUserPosts } from '../utils/communityApi';
import { followUser, unfollowUser, isFollowing, getFollowerCount, getFollowingCount } from '../utils/followApi';
import useDialog from '../hooks/useDialog';

export default function UserProfileModal({ profileUserId, profileUserName, profileUserPhoto, currentUser, isDark, t, onClose }) {
  const { dialog, showAlert } = useDialog(isDark);
  const [posts, setPosts] = useState([]);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = currentUser?.uid === profileUserId;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [userPosts, followers, following, followStatus] = await Promise.all([
        getUserPosts(profileUserId, 20),
        getFollowerCount(profileUserId),
        getFollowingCount(profileUserId),
        currentUser && !isOwnProfile ? isFollowing(currentUser.uid, profileUserId) : Promise.resolve(false),
      ]);
      setPosts(userPosts);
      setFollowerCount(followers);
      setFollowingCount(following);
      setIsFollowingUser(followStatus);
      setIsLoading(false);
    };
    load();
  }, [profileUserId, currentUser?.uid]);

  const handleFollow = async () => {
    if (!currentUser) return;
    setIsLoadingFollow(true);
    try {
      if (isFollowingUser) {
        await unfollowUser(currentUser.uid, profileUserId);
        setFollowerCount(c => Math.max(0, c - 1));
        setIsFollowingUser(false);
      } else {
        await followUser(
          currentUser.uid, 
          profileUserId, 
          currentUser.name || currentUser.email?.split('@')[0], 
          currentUser.photoURL
        );
        setFollowerCount(c => c + 1);
        setIsFollowingUser(true);
      }
    } catch (e) { console.error(e); }
    setIsLoadingFollow(false);
  };

  const handleShareProfile = async () => {
    const text = `Lihat profil ${profileUserName} di LyFit!`;
    if (navigator.share) {
      navigator.share({ title: profileUserName, text });
    } else {
      navigator.clipboard?.writeText(text);
      await showAlert('Tautan profil disalin!', { type: 'success' });
    }
  };

  const achievements = posts.filter(p => p.type === 'achievement');
  const regularPosts = posts.filter(p => p.type !== 'achievement');
  const imageUrls = regularPosts.flatMap(p => p.imageUrls || (p.imageUrl ? [p.imageUrl] : []));

  return (
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className={`w-full sm:max-w-sm ${isDark ? 'bg-slate-900' : 'bg-white'} rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-8`}>

        {/* Header */}
        <div className={`px-4 pt-4 pb-3 flex items-center justify-between border-b ${isDark ? 'border-white/10' : 'border-black/8'}`}>
          <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}>
            <X size={18} />
          </button>
          <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-black'}`}>Profil</h3>
          <button onClick={handleShareProfile} className={`p-2 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/70' : 'bg-black/5 hover:bg-black/10 text-black/60'}`}>
            <Share2 size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Profile info */}
          <div className="px-6 pt-5 pb-4 flex flex-col items-center text-center">
            {profileUserPhoto ? (
              <img src={profileUserPhoto} alt={profileUserName} className={`w-20 h-20 rounded-full object-cover ring-4 ${t?.ringAccent || 'ring-[#41759b]'} ring-opacity-30 mb-3`} />
            ) : (
              <div className={`w-20 h-20 rounded-full ${t?.bgAccentSoft || 'bg-[#41759b]/20'} ${t?.textAccent || 'text-[#41759b]'} flex items-center justify-center font-black text-2xl mb-3`}>
                {(profileUserName || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className={`font-black text-xl mb-1 ${isDark ? 'text-white' : 'text-black'}`}>{profileUserName || 'Pengguna'}</h2>

            {/* Stats */}
            <div className="flex gap-8 mt-3 mb-4">
              <div className="flex flex-col items-center">
                <span className={`font-black text-lg ${isDark ? 'text-white' : 'text-black'}`}>{posts.length}</span>
                <span className={`text-[11px] font-bold ${isDark ? 'text-white/50' : 'text-black/50'}`}>Post</span>
              </div>
              <div className="flex flex-col items-center">
                <span className={`font-black text-lg ${isDark ? 'text-white' : 'text-black'}`}>{followerCount}</span>
                <span className={`text-[11px] font-bold ${isDark ? 'text-white/50' : 'text-black/50'}`}>Pengikut</span>
              </div>
              <div className="flex flex-col items-center">
                <span className={`font-black text-lg ${isDark ? 'text-white' : 'text-black'}`}>{followingCount}</span>
                <span className={`text-[11px] font-bold ${isDark ? 'text-white/50' : 'text-black/50'}`}>Mengikuti</span>
              </div>
            </div>

            {/* Follow Button */}
            {!isOwnProfile && (
              <button
                onClick={handleFollow}
                disabled={isLoadingFollow}
                className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-60 ${
                  isFollowingUser
                    ? isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/8 text-black hover:bg-black/12'
                    : `${t?.bgAccent || 'bg-[#41759b] text-white'} hover:opacity-90 shadow-lg ${t?.shadowAccent || 'shadow-[#41759b]/30'}`
                }`}
              >
                {isFollowingUser ? <UserCheck size={16}/> : <UserPlus size={16}/>}
                {isFollowingUser ? 'Mengikuti' : 'Ikuti'}
              </button>
            )}
          </div>

          {/* Achievements strip */}
          {achievements.length > 0 && (
            <div className={`mx-4 mb-3 p-3 rounded-2xl flex gap-2 overflow-x-auto hide-scrollbar ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
              {achievements.map((p, i) => (
                <div key={i} className="flex flex-col items-center shrink-0 gap-1">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Award size={18} className="text-amber-500" />
                  </div>
                  <span className={`text-[9px] font-bold text-center leading-tight max-w-[60px] ${isDark ? 'text-amber-300/70' : 'text-amber-700'}`}>{p.achievementTitle}</span>
                </div>
              ))}
            </div>
          )}

          {/* Photo grid */}
          {isLoading ? (
            <div className={`text-center py-8 text-sm font-bold ${isDark ? 'text-white/40' : 'text-black/40'}`}>Memuat postingan...</div>
          ) : imageUrls.length > 0 ? (
            <div className="px-4 pb-6">
              <div className={`flex items-center gap-1.5 mb-2 ${isDark ? 'text-white/50' : 'text-black/40'}`}>
                <Grid3X3 size={13} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Postingan</span>
              </div>
              <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden">
                {imageUrls.slice(0, 9).map((url, i) => (
                  <div key={i} className="aspect-square bg-black/10">
                    <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`text-center py-8 text-sm font-bold ${isDark ? 'text-white/30' : 'text-black/30'}`}>Belum ada postingan</div>
          )}
        </div>
      </div>
      {dialog}
    </div>
  );
}
