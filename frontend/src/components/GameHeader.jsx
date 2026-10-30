import React, { useState } from 'react';
import { 
  ArrowLeft, Pause, Play, RotateCcw, Volume2, 
  VolumeX, Music, Shield, Home 
} from 'lucide-react';
import soundManager from '../services/soundManager';

export default function GameHeader({
  gameTitle,
  gameSubtitle,
  gameIcon = '🎈',
  score,
  scoreLabel = 'Score',
  isPaused,
  onTogglePause,
  onRestart,
  onBack,
  extraStatus
}) {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  const handleMuteToggle = () => {
    const m = soundManager.toggleMute();
    setIsMuted(m);
    soundManager.playClick();
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#A51F2B]/40">
        
        {/* Left: Back Button & Game Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { soundManager.playClick(); onBack(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F2937]/80 hover:bg-[#374151] border border-[#D6A56C]/30 text-xs font-bold uppercase transition-all"
            title="Exit to Platform"
          >
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Platform</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl filter drop-shadow-[0_0_8px_#E62A3B]">{gameIcon}</span>
            <div>
              <h1 className="font-['Cinzel'] font-bold text-base sm:text-xl text-[#F4E4CC] leading-tight">
                {gameTitle}
              </h1>
              {gameSubtitle && (
                <p className="text-[10px] sm:text-[11px] text-[#D6A56C] font-serif">{gameSubtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status, Score, Sound, Pause, Restart */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {extraStatus}

          {score !== undefined && (
            <div className="px-3 py-1 rounded-lg bg-[#30213E] border border-[#D6A56C]/40 text-xs font-bold text-[#FFE4B5] shadow-sm">
              {scoreLabel}: <span className="text-white">{score}</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleMuteToggle}
            className="p-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] border border-[#374151] text-[#F4E4CC]/80 transition-colors"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} />}
          </button>

          {/* Pause / Resume Button */}
          {onTogglePause && (
            <button
              onClick={() => {
                soundManager.playClick();
                onTogglePause();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isPaused
                  ? 'bg-[#E62A3B] text-white border-white animate-pulse'
                  : 'bg-[#1F2937] text-[#FFE4B5] border-[#D6A56C]/40 hover:bg-[#374151]'
              }`}
              title={isPaused ? "Resume Game" : "Pause Game"}
            >
              {isPaused ? <Play size={14} className="fill-current" /> : <Pause size={14} className="fill-current" />}
              <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>
          )}

          {/* Quick Restart Button */}
          {onRestart && (
            <button
              onClick={() => {
                soundManager.playClick();
                if (window.confirm('Restart this game from the beginning? Unsaved current session progress will reset.')) {
                  onRestart();
                }
              }}
              className="p-1.5 rounded-lg bg-[#1F2937] hover:bg-[#4B1018] border border-[#374151] text-[#D6A56C] hover:text-white transition-colors"
              title="Restart Game"
            >
              <RotateCcw size={16} />
            </button>
          )}

        </div>

      </div>

      {/* PAUSE OVERLAY MODAL */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="horror-card p-8 bg-[#111827] border-2 border-[#D6A56C] text-center max-w-sm w-full space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#4B1018] border border-[#A51F2B] flex items-center justify-center text-3xl mx-auto shadow-inner">
              ⏸️
            </div>

            <div>
              <h2 className="font-['Cinzel'] font-black text-2xl text-[#FFE4B5] tracking-wider mb-1">
                GAME PAUSED
              </h2>
              <p className="text-xs text-[#D6A56C] font-serif">
                The shadows stand still... for now.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { soundManager.playClick(); onTogglePause(); }}
                className="btn-horror-gold w-full py-3 text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg"
              >
                <Play size={16} className="fill-current" />
                <span>RESUME GAME</span>
              </button>

              {onRestart && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onRestart();
                    onTogglePause();
                  }}
                  className="btn-horror w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <RotateCcw size={15} />
                  <span>RESTART GAME</span>
                </button>
              )}

              <button
                onClick={() => { soundManager.playClick(); onBack(); }}
                className="btn-horror-outline w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Home size={15} />
                <span>EXIT TO PLATFORM</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
