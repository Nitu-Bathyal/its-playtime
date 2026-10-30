import React, { useState } from 'react';
import { X, User, Trophy, Award, Flame, Zap, CheckCircle2, RotateCcw } from 'lucide-react';
import soundManager from '../services/soundManager';
import storage from '../services/storage';

const AVATARS = [
  { id: 'clown', emoji: '🎈', name: 'Penny jester' },
  { id: 'ghost', emoji: '👻', name: 'Lost Specter' },
  { id: 'doll', emoji: '🎎', name: 'Haunted Marionette' },
  { id: 'vampire', emoji: '🧛', name: 'Crypt Walker' },
  { id: 'skeleton', emoji: '💀', name: 'Grave Wanderer' },
  { id: 'pumpkin', emoji: '🎃', name: 'Jack-o-Shadow' },
  { id: 'raven', emoji: '🦅', name: 'Midnight Raven' }
];

export default function PlayerModal({ profile, onUpdateProfile, onClose }) {
  const [nickname, setNickname] = useState(profile?.nickname || 'Nightstalker');
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar || 'clown');
  const [isSaved, setIsSaved] = useState(false);

  const getRankTitle = (lvl) => {
    if (lvl >= 10) return 'Conqueror of Nightmares';
    if (lvl >= 7) return 'Carnival Overlord';
    if (lvl >= 5) return 'Shadow Cryptographer';
    if (lvl >= 3) return 'Sewer Survivor';
    return 'Novice Wanderer';
  };

  const handleSave = (e) => {
    e.preventDefault();
    soundManager.playClick();
    const updated = {
      ...profile,
      nickname: nickname.trim() || 'Nightstalker',
      avatar: selectedAvatar
    };
    storage.setPlayerProfile(updated);
    onUpdateProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your local player progress and XP?')) {
      const reset = {
        nickname: 'Nightstalker',
        avatar: 'clown',
        xp: 0,
        level: 1,
        totalScore: 0,
        completedLevels: 0,
        gamesPlayed: 0
      };
      storage.setPlayerProfile(reset);
      onUpdateProfile(reset);
      soundManager.playBalloonPop();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg horror-card border border-[#D6A56C]/40 bg-[#111827] p-6 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => { soundManager.playClick(); onClose(); }}
          className="absolute top-4 right-4 text-[#F4E4CC]/70 hover:text-white p-1 rounded-lg hover:bg-[#374151] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#4B1018] border border-[#A51F2B] flex items-center justify-center text-2xl shadow-inner">
            👤
          </div>
          <div>
            <h2 className="font-['Cinzel'] font-bold text-2xl text-[#F4E4CC]">
              PLAYER DOSSIER
            </h2>
            <p className="text-xs text-[#D6A56C]">
              Rank: <span className="text-[#FFE4B5] font-semibold">{getRankTitle(profile?.level || 1)}</span>
            </p>
          </div>
        </div>

        {/* Level & XP Bar */}
        <div className="mb-6 p-4 rounded-xl bg-[#1F2937]/80 border border-[#374151]">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-bold text-[#F4E4CC]">Level {profile?.level || 1}</span>
            <span className="text-[#D6A56C]">{profile?.xp || 0} XP Total</span>
          </div>
          <div className="w-full bg-[#111827] h-3 rounded-full overflow-hidden border border-[#A51F2B]/40">
            <div 
              className="bg-gradient-to-r from-[#A51F2B] via-[#E62A3B] to-[#FFE4B5] h-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((profile?.xp || 0) % 100))}%` }}
            />
          </div>
          <div className="text-[11px] text-right text-gray-400 mt-1">
            {100 - ((profile?.xp || 0) % 100)} XP to next level
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <div className="p-3 rounded-lg bg-[#30213E]/60 border border-[#4B1018]">
            <div className="text-xl font-bold text-[#FFE4B5]">{profile?.totalScore || 0}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-300">Total Score</div>
          </div>
          <div className="p-3 rounded-lg bg-[#30213E]/60 border border-[#4B1018]">
            <div className="text-xl font-bold text-[#FFE4B5]">{profile?.gamesPlayed || 0}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-300">Games Played</div>
          </div>
          <div className="p-3 rounded-lg bg-[#30213E]/60 border border-[#4B1018]">
            <div className="text-xl font-bold text-[#FFE4B5]">{profile?.completedLevels || 0}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-300">Levels Cleared</div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D6A56C] mb-1.5">
              Player Nickname
            </label>
            <input
              type="text"
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#4B1018] text-[#F4E4CC] focus:outline-none focus:border-[#A51F2B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D6A56C] mb-1.5">
              Select Avatar
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => { soundManager.playClick(); setSelectedAvatar(av.id); }}
                  title={av.name}
                  className={`p-2 rounded-xl text-2xl border transition-all flex flex-col items-center justify-center ${
                    selectedAvatar === av.id
                      ? 'bg-[#A51F2B]/40 border-[#FFE4B5] scale-105 shadow-md'
                      : 'bg-[#1F2937]/60 border-transparent hover:border-[#4B1018]'
                  }`}
                >
                  <span>{av.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-horror flex-1 py-2.5 text-sm"
            >
              {isSaved ? <CheckCircle2 size={16} className="text-green-400" /> : <Award size={16} />}
              <span>{isSaved ? 'SAVED!' : 'UPDATE DOSSIER'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="Reset progress"
              className="p-2.5 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-950/40 transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
