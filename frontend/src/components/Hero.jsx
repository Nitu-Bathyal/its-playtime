import React from 'react';
import { Play, Sparkles, Compass, ShieldCheck, Flame } from 'lucide-react';
import soundManager from '../services/soundManager';

export default function Hero({ onPlaySignatureGame, onScrollToGames, onOpenAiModal }) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 py-16">
      
      {/* Dark Carnival & Sewer Background Atmospheric Silhouettes */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <svg className="w-full h-full object-cover" viewBox="0 0 1440 800" preserveAspectRatio="none">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#111827" />
              <stop offset="45%" stop-color="#30213E" />
              <stop offset="85%" stop-color="#4B1018" />
              <stop offset="100%" stop-color="#0B0F19" />
            </linearGradient>
            <radialGradient id="moonGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stop-color="#FFE4B5" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#111827" stop-opacity="0" />
            </radialGradient>
          </defs>

          {/* Sky */}
          <rect width="1440" height="800" fill="url(#skyGrad)" />
          <circle cx="720" cy="280" r="380" fill="url(#moonGlow)" />

          {/* Distant Carnival Big Tops & Ferris Wheel silhouette */}
          <path d="M 120,550 L 260,320 L 400,550 Z" fill="#181024" opacity="0.8" />
          <path d="M 230,550 L 320,380 L 410,550 Z" fill="#20132E" opacity="0.7" />
          <circle cx="1180" cy="380" r="140" fill="none" stroke="#251636" stroke-width="4" stroke-dasharray="10 15" opacity="0.6" />
          
          {/* Haunted Town Church Spire */}
          <polygon points="600,550 630,260 660,550" fill="#140D1F" />
          <polygon points="620,260 630,190 640,260" fill="#140D1F" />

          {/* Sewer Drainage Arc in Foreground */}
          <path d="M 0,800 Q 720,680 1440,800 L 1440,800 L 0,800 Z" fill="#080B12" />
          <path d="M 620,800 C 620,720 820,720 820,800 Z" fill="#030407" />
          <path d="M 640,800 C 640,735 800,735 800,800 Z" fill="#A51F2B" opacity="0.15" />
        </svg>
      </div>

      {/* Hero Content Container */}
      <div className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center">
        
        {/* Original Mysterious Clown Silhouette with Glowing Yellow Eyes & Blood Tear */}
        <div className="relative mb-6 group cursor-pointer" onClick={() => soundManager.playBalloonSqueak()}>
          <div className="w-44 h-44 sm:w-52 sm:h-52 relative mx-auto flex items-center justify-center">
            
            {/* Pulsing Aura */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#A51F2B] via-[#4B1018] to-transparent blur-2xl opacity-60 animate-pulse pointer-events-none" />
            
            {/* SVG Original Clown Graphic */}
            <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
              <defs>
                <radialGradient id="clownFace" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stop-color="#FDFBF7" />
                  <stop offset="65%" stop-color="#E8DFD1" />
                  <stop offset="100%" stop-color="#C2B299" />
                </radialGradient>
                <linearGradient id="ruffleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#FFFFFF" />
                  <stop offset="50%" stop-color="#DCD6CD" />
                  <stop offset="100%" stop-color="#8E8576" />
                </linearGradient>
              </defs>

              {/* Ruffled Victorian Clown Collar */}
              <path d="M 30,175 Q 50,150 70,175 Q 90,150 110,175 Q 130,150 150,175 Q 170,150 185,185 L 15,185 Z" fill="url(#ruffleGrad)" stroke="#4B1018" stroke-width="2" />

              {/* Clown Head */}
              <ellipse cx="100" cy="95" rx="60" ry="70" fill="url(#clownFace)" />

              {/* Hair Tufts (Wild Crimson Locks) */}
              <path d="M 38,70 C 15,50 15,100 35,115 C 20,130 38,145 45,130 Z" fill="#8B131E" />
              <path d="M 162,70 C 185,50 185,100 165,115 C 180,130 162,145 155,130 Z" fill="#8B131E" />

              {/* Sinister Red Clown Makeup Lines (Through Eyes) */}
              <path d="M 68,35 Q 73,70 70,105 L 75,140" fill="none" stroke="#A51F2B" stroke-width="5" stroke-linecap="round" />
              <path d="M 132,35 Q 127,70 130,105 L 125,140" fill="none" stroke="#A51F2B" stroke-width="5" stroke-linecap="round" />

              {/* Arched Jagged Brows */}
              <path d="M 52,65 Q 68,52 82,68" fill="none" stroke="#1A1110" stroke-width="4" stroke-linecap="round" />
              <path d="M 148,65 Q 132,52 118,68" fill="none" stroke="#1A1110" stroke-width="4" stroke-linecap="round" />

              {/* Supernatural Glowing Eyes */}
              <ellipse cx="70" cy="78" rx="8" ry="5" fill="#FFE552" />
              <ellipse cx="130" cy="78" rx="8" ry="5" fill="#FFE552" />
              <ellipse cx="70" cy="78" rx="3" ry="5" fill="#111827" />
              <ellipse cx="130" cy="78" rx="3" ry="5" fill="#111827" />
              
              {/* Eye Glow highlight */}
              <circle cx="72" cy="76" r="1.5" fill="#FFF" />
              <circle cx="132" cy="76" r="1.5" fill="#FFF" />

              {/* Crimson Nose */}
              <circle cx="100" cy="98" r="14" fill="#A51F2B" stroke="#680D15" stroke-width="2" />
              <ellipse cx="96" cy="94" rx="4" ry="2.5" fill="#FFF" opacity="0.6" />

              {/* Exaggerated Menacing Smile */}
              <path d="M 48,118 Q 100,165 152,118 Q 100,140 48,118 Z" fill="#4B1018" stroke="#1A070A" stroke-width="2" />
              {/* Sharp Teeth Rows */}
              <path d="M 62,126 L 68,133 L 74,126 L 80,134 L 86,127 L 92,135 L 98,128 L 104,135 L 110,127 L 116,134 L 122,126 L 128,133 L 134,126" 
                    fill="none" stroke="#F4E4CC" stroke-width="3" stroke-linejoin="round" />
            </svg>

            {/* Signature Floating Balloon on Clown's Finger */}
            <div className="absolute -top-6 -right-6 floating-balloon pointer-events-none">
              <span className="text-5xl filter drop-shadow-[0_0_15px_#A51F2B]">🎈</span>
            </div>
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="font-['Cinzel'] font-black text-4xl sm:text-6xl md:text-7xl tracking-widest text-[#F4E4CC] mb-3 text-glow-red">
          IT'S PLAYTIME
        </h1>

        {/* Tagline */}
        <p className="font-serif italic text-lg sm:text-2xl md:text-3xl text-[#FFE4B5] mb-6 max-w-3xl text-glow-gold">
          "Every game has a dark side. Wanna play?"
        </p>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 text-xs sm:text-sm font-medium">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F2937]/80 border border-[#D6A56C]/40 text-[#F4E4CC]">
            <Flame size={14} className="text-[#A51F2B]" /> 7 Playable Horror Games
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#11241A] border border-[#2E7D32] text-[#A5D6A7]">
            <ShieldCheck size={14} className="text-[#66BB6A]" /> 100% Offline-First PWA
          </span>
          <span 
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#30213E]/80 border border-[#A51F2B]/60 text-[#FFE4B5] cursor-pointer hover:border-[#D6A56C] transition-colors"
          >
            <Sparkles size={14} className="text-[#D6A56C]" /> Qwen 2.5 Local AI + Offline Fallback
          </span>
        </div>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          
          <button
            onClick={() => {
              soundManager.playDoorCreak();
              onPlaySignatureGame();
            }}
            className="btn-horror px-8 py-4 text-base sm:text-lg w-full sm:w-auto group glow-red"
          >
            <Play size={20} className="fill-current text-[#E62A3B] group-hover:scale-110 transition-transform" />
            <span>PLAY "THE RED BALLOON"</span>
            <span className="text-xl">🎈</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onScrollToGames();
            }}
            className="btn-horror-outline px-6 py-4 text-base sm:text-lg w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Compass size={18} />
            <span>CHOOSE YOUR GAME</span>
          </button>

        </div>

        {/* Tip for interaction */}
        <p className="mt-8 text-xs text-[#D6A56C]/60 italic">
          💡 Pop the floating red balloons floating across your screen to earn hunter points!
        </p>

      </div>
    </section>
  );
}
