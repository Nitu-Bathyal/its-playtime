import React, { useState } from 'react';
import { 
  Volume2, VolumeX, Music, Bell, Trophy, User, 
  Cpu, Wifi, WifiOff, Sparkles, Calendar, ShieldCheck
} from 'lucide-react';
import soundManager from '../services/soundManager';

export default function Navbar({
  playerProfile,
  aiStatus,
  onOpenProfile,
  onOpenAiModal,
  onOpenAchievements,
  onOpenLeaderboard,
  onOpenDailyChallenge,
  onNavigateHome,
  canInstall,
  onInstallPwa
}) {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [isMusic, setIsMusic] = useState(soundManager.isMusicEnabled);
  const [volume, setVolume] = useState(soundManager.volume);

  const handleMuteToggle = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    soundManager.playClick();
  };

  const handleMusicToggle = () => {
    const music = soundManager.toggleMusic();
    setIsMusic(music);
    soundManager.playClick();
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundManager.setVolume(val);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#111827]/90 backdrop-blur-md border-b border-[#A51F2B]/40 px-4 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => { soundManager.playClick(); onNavigateHome(); }}
          className="flex items-center gap-3 cursor-pointer group transition-transform hover:scale-105"
        >
          <div className="relative">
            <span className="text-3xl filter drop-shadow-[0_0_10px_#A51F2B]">🎈</span>
            <div className="absolute -inset-1 bg-[#A51F2B]/30 rounded-full blur-sm group-hover:bg-[#A51F2B]/60 transition-colors pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Cinzel'] font-black text-xl sm:text-2xl tracking-wider text-[#F4E4CC] group-hover:text-white transition-colors">
                IT'S PLAYTIME
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#A51F2B]/30 border border-[#A51F2B] text-[#FFE4B5]">
                v1.0
              </span>
            </div>
            <p className="text-xs text-[#D6A56C]/80 font-serif italic hidden md:block">
              "Every game has a dark side. Wanna play?"
            </p>
          </div>
        </div>

        {/* Status Indicators (Offline Ready & AI Status) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* PWA Install Button */}
          {canInstall && (
            <button
              onClick={() => { soundManager.playClick(); onInstallPwa(); }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#A51F2B] hover:bg-[#E62A3B] text-white border border-[#FFE4B5] shadow-lg animate-pulse transition-all"
              title="Install IT's Playtime as an offline desktop/mobile app"
            >
              <span>📲</span>
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Game Offline Ready Indicator */}
          <div 
            title="Service Worker and IndexedDB caching active. All games playable without internet."
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#11241A] border border-[#2E7D32] text-[#A5D6A7] shadow-sm"
          >
            <ShieldCheck size={14} className="text-[#66BB6A]" />
            <span className="hidden sm:inline">Game Offline Ready</span>
            <span className="sm:hidden">Offline</span>
          </div>

          {/* Local AI Status Indicator */}
          <button
            onClick={() => { soundManager.playClick(); onOpenAiModal(); }}
            title="Click to view local Ollama AI status and setup guide"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              aiStatus?.ollamaConnected && aiStatus?.modelAvailable
                ? 'bg-[#18233C] border-[#2563EB] text-[#93C5FD] hover:bg-[#1E3A8A]'
                : 'bg-[#30213E]/80 border-[#A51F2B]/60 text-[#F4E4CC]/90 hover:border-[#D6A56C]'
            }`}
          >
            <Cpu size={14} className={aiStatus?.ollamaConnected ? "text-[#60A5FA]" : "text-[#D6A56C]"} />
            <span className="hidden md:inline">
              {aiStatus?.ollamaConnected && aiStatus?.modelAvailable
                ? `Local AI: ${aiStatus.targetModel}`
                : 'Local AI: Offline Fallback'}
            </span>
            <span className="md:hidden">
              {aiStatus?.ollamaConnected ? 'AI Active' : 'AI Offline'}
            </span>
          </button>
        </div>

        {/* Right Section: Sound, Daily Challenge, Leaderboard, Player Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Audio Controls */}
          <div className="flex items-center bg-[#1F2937]/80 rounded-lg border border-[#374151] p-1 gap-1">
            <button
              onClick={handleMuteToggle}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              className="p-1.5 text-[#F4E4CC]/80 hover:text-white rounded hover:bg-[#374151] transition-colors"
            >
              {isMuted ? <VolumeX size={16} className="text-[#E62A3B]" /> : <Volume2 size={16} />}
            </button>

            <button
              onClick={handleMusicToggle}
              title={isMusic ? "Disable Carnival Music" : "Enable Carnival Music"}
              className={`p-1.5 rounded transition-colors ${
                isMusic ? 'text-[#D6A56C] hover:bg-[#374151]' : 'text-gray-500 hover:bg-[#374151]'
              }`}
            >
              <Music size={16} />
            </button>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              title={`Master Volume: ${Math.round(volume * 100)}%`}
              className="w-12 h-1 accent-[#A51F2B] cursor-pointer hidden lg:block"
            />
          </div>

          {/* Daily Challenge Button */}
          <button
            onClick={() => { soundManager.playClick(); onOpenDailyChallenge(); }}
            title="Daily Horror Challenge"
            className="p-2 rounded-lg bg-[#30213E]/60 border border-[#D6A56C]/40 text-[#D6A56C] hover:border-[#D6A56C] hover:text-[#FFE4B5] transition-all"
          >
            <Calendar size={18} />
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={() => { soundManager.playClick(); onOpenLeaderboard(); }}
            title="Local Leaderboard"
            className="p-2 rounded-lg bg-[#30213E]/60 border border-[#D6A56C]/40 text-[#D6A56C] hover:border-[#D6A56C] hover:text-[#FFE4B5] transition-all"
          >
            <Trophy size={18} />
          </button>

          {/* Achievements Button */}
          <button
            onClick={() => { soundManager.playClick(); onOpenAchievements(); }}
            title="Horror Achievements"
            className="p-2 rounded-lg bg-[#30213E]/60 border border-[#A51F2B]/50 text-[#F4E4CC] hover:border-[#E62A3B] transition-all"
          >
            <Sparkles size={18} className="text-[#FFE4B5]" />
          </button>

          {/* Player Profile Pill */}
          <button
            onClick={() => { soundManager.playClick(); onOpenProfile(); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gradient-to-r from-[#4B1018] to-[#1E1128] border border-[#D6A56C]/60 hover:border-[#F4E4CC] transition-all shadow-md group"
          >
            <div className="w-6 h-6 rounded-full bg-[#A51F2B] flex items-center justify-center text-xs font-bold text-white shadow-inner">
              {playerProfile?.avatar === 'clown' ? '🎈' : 
               playerProfile?.avatar === 'ghost' ? '👻' : 
               playerProfile?.avatar === 'doll' ? '🎎' : 
               playerProfile?.avatar === 'vampire' ? '🧛' : '💀'}
            </div>
            <div className="text-left hidden sm:block leading-tight">
              <div className="text-xs font-bold text-[#F4E4CC] group-hover:text-white truncate max-w-[90px]">
                {playerProfile?.nickname || 'Player'}
              </div>
              <div className="text-[10px] text-[#D6A56C]">
                Lvl {playerProfile?.level || 1} • {playerProfile?.xp || 0} XP
              </div>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
}
