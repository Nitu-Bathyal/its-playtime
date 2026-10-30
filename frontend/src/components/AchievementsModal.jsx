import React, { useState, useEffect } from 'react';
import { X, Trophy, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import soundManager from '../services/soundManager';
import dbService from '../services/db';

export const ALL_ACHIEVEMENTS = [
  { id: 'first_blood', name: 'Wanderer in the Mist', description: 'Begin your first horror journey in IT\'s Playtime.', xp: 50, icon: '🎈' },
  { id: 'balloon_popper', name: 'Balloon Hunter', description: 'Pop 5 floating red balloons on the main screen.', xp: 75, icon: '💥' },
  { id: 'town_detective', name: 'Derry Investigator', description: 'Collect all 4 investigative clues in The Red Balloon.', xp: 150, icon: '🔍' },
  { id: 'sewer_escape', name: 'They All Float Down Here', description: 'Successfully escape through the sewer sluice gate.', xp: 200, icon: '🌊' },
  { id: 'mansion_master', name: 'Lord of Ravenscroft', description: 'Unlock the secret subterranean crypt in Haunted Mansion.', xp: 175, icon: '🏰' },
  { id: 'carnival_king', name: 'Master of the Midway', description: 'Collect 100 carnival tokens in The Lost Carnival.', xp: 180, icon: '🎪' },
  { id: 'party_spirit', name: 'Ghost Host', description: 'Complete a multiplayer or solo round in Ghost Party.', xp: 120, icon: '👻' },
  { id: 'ancestral_honor', name: 'Remember Me', description: 'Construct and save a beautiful Día de los Muertos ofrenda.', xp: 150, icon: '🌼' },
  { id: 'story_weaver', name: 'Chronicler of Shadows', description: 'Craft and survive an entire interactive horror story.', xp: 160, icon: '📖' },
  { id: 'master_locksmith', name: 'The Master Key', description: 'Crack the final Master chest in The Lost Key.', xp: 250, icon: '🗝️' },
  { id: 'prime_thinker', name: 'Riddle Solver', description: 'Solve a hard or nightmare difficulty riddle on first attempt.', xp: 140, icon: '🧠' },
  { id: 'night_owl', name: 'Midnight Gambler', description: 'Complete a daily offline horror challenge.', xp: 200, icon: '🌙' },
  { id: 'audio_phile', name: 'Carnival Listener', description: 'Listen to the eerie synthesized carnival melody.', xp: 40, icon: '🎵' },
  { id: 'offline_champion', name: 'Zero Ping Survivor', description: 'Play 3 different games completely offline.', xp: 180, icon: '🛡️' },
  { id: 'level_five', name: 'Shadow Cryptographer', description: 'Attain Player Level 5.', xp: 300, icon: '⭐' },
  { id: 'nightmare_slayer', name: 'Immortal Wanderer', description: 'Accumulate over 1,000 total score points.', xp: 500, icon: '👑' }
];

export default function AchievementsModal({ unlockedIds = [], onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl horror-card border border-[#D6A56C]/40 bg-[#111827] p-6 shadow-2xl rounded-2xl overflow-y-auto max-h-[85vh]">
        
        {/* Close Button */}
        <button
          onClick={() => { soundManager.playClick(); onClose(); }}
          className="absolute top-4 right-4 text-[#F4E4CC]/70 hover:text-white p-1 rounded-lg hover:bg-[#374151] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#4B1018] border border-[#A51F2B] flex items-center justify-center text-2xl shadow-inner">
            <Trophy className="text-[#FFE4B5]" size={26} />
          </div>
          <div>
            <h2 className="font-['Cinzel'] font-bold text-2xl text-[#F4E4CC]">
              HORROR ACHIEVEMENTS
            </h2>
            <p className="text-xs text-[#D6A56C]">
              Unlocked: <span className="text-[#FFE4B5] font-bold">{unlockedIds.length}</span> / {ALL_ACHIEVEMENTS.length}
            </p>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedIds.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-[#1E293B]/90 border-[#D6A56C]/60 shadow-md'
                    : 'bg-[#111827]/60 border-[#374151]/40 opacity-55'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${
                  isUnlocked ? 'bg-[#4B1018] border border-[#A51F2B]' : 'bg-[#1F2937]'
                }`}>
                  {isUnlocked ? ach.icon : <Lock size={16} className="text-gray-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className={`text-xs font-bold truncate ${isUnlocked ? 'text-[#F4E4CC]' : 'text-gray-400'}`}>
                      {ach.name}
                    </h4>
                    <span className="text-[10px] font-bold text-[#FFE4B5] px-1.5 py-0.2 rounded bg-[#30213E] shrink-0">
                      +{ach.xp} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-snug">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
