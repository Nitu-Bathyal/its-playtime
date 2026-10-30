import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import achievementManager from '../services/achievementManager';

export default function AchievementToast() {
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    const unsubscribe = achievementManager.subscribe((achievement) => {
      setActiveToast(achievement);
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    });
    return unsubscribe;
  }, []);

  if (!activeToast) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slideIn">
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#4B1018] via-[#30213E] to-[#111827] border-2 border-[#FFE4B5] shadow-[0_0_25px_rgba(230,42,59,0.5)] text-[#F4E4CC] max-w-sm">
        <div className="w-12 h-12 rounded-xl bg-[#A51F2B] border border-[#FFE4B5] flex items-center justify-center text-2xl shrink-0 shadow-inner">
          {activeToast.icon || '🏆'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#FFE4B5] flex items-center gap-1">
            <Sparkles size={12} className="text-[#FFD700]" /> ACHIEVEMENT UNLOCKED!
          </div>
          <div className="text-sm font-bold text-white truncate">
            {activeToast.name}
          </div>
          <div className="text-[11px] text-[#D6A56C]">
            +{activeToast.xp} XP Awarded
          </div>
        </div>
      </div>
    </div>
  );
}
