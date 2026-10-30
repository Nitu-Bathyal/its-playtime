import React from 'react';
import { 
  Play, Sparkles, Users, Lock, Skull, Heart, 
  MapPin, Key, Flame, Compass, HelpCircle, Eye
} from 'lucide-react';
import soundManager from '../services/soundManager';

export const GAMES = [
  {
    id: 'red-balloon',
    title: 'The Red Balloon',
    tagline: 'Signature Horror Adventure',
    difficulty: 'Nightmare',
    diffColor: '#E62A3B',
    players: '1 Player',
    aiBadge: 'AI Clues & Story',
    description: 'A crimson balloon drifts past an abandoned town. Follow its trail through the decrepit square, derelict clinic, and into the flooding sewers to uncover the mystery.',
    features: ['Interactive Town Map', 'Inventory System', 'Supernatural Encounters', 'Multiple Endings'],
    badge: 'SIGNATURE FEATURE 🎈',
    icon: '🎈',
    gradient: 'from-[#4B1018] to-[#1F090C]'
  },
  {
    id: 'haunted-mansion',
    title: 'Haunted Mansion',
    tagline: 'Room Exploration & Secret Chambers',
    difficulty: 'Challenging',
    diffColor: '#D6A56C',
    players: '1 Player',
    aiBadge: 'Mystery Lore',
    description: 'Explore Ravenscroft Manor room by room. Search for hidden keys, inspect antique artifacts, bypass cursed traps, and unlock the sealed subterranean crypt.',
    features: ['6 Explorable Rooms', 'Hidden Object Hunting', 'Lock Mechanism Puzzles', 'Progress Saving'],
    icon: '🏰',
    gradient: 'from-[#2B1B3D] to-[#120B1A]'
  },
  {
    id: 'lost-carnival',
    title: 'The Lost Carnival',
    tagline: 'Abandoned Midway Survival',
    difficulty: 'Challenging',
    diffColor: '#D6A56C',
    players: '1 Player',
    aiBadge: 'Procedural Trials',
    description: 'A condemned traveling carnival comes alive after midnight. Conquer 5 sinister attractions—Hall of Mirrors, Wheel of Torment, and the Funhouse Maze—to claim carnival tokens and escape.',
    features: ['5 Distinct Mini-Games', 'Reflex & Memory Trials', 'Token Economy', 'Lockbox Code Breaker'],
    icon: '🎪',
    gradient: 'from-[#3A1428] to-[#170810]'
  },
  {
    id: 'ghost-party',
    title: 'Ghost Party',
    tagline: 'Local Multiplayer Horror Party',
    difficulty: 'Moderate',
    diffColor: '#38BDF8',
    players: '1-4 Local Players',
    aiBadge: 'AI Horror Trivia',
    description: 'Pass the device or play solo! Face horror trivia, spirit bluffing challenges, specter guessing games, and phantom memory duels on a shared screen without internet.',
    features: ['Pass & Play (1-4 Players)', 'Horror Quiz & Riddles', 'Bluffing Duel', 'Live Match Scoreboard'],
    icon: '👻',
    gradient: 'from-[#1E293B] to-[#0F172A]'
  },
  {
    id: 'day-of-the-dead',
    title: 'Day of the Dead',
    tagline: 'Día de los Muertos Remembrance',
    difficulty: 'Peaceful & Warm',
    diffColor: '#F59E0B',
    players: '1 Player',
    aiBadge: 'AI Remembrance Prose',
    description: 'A heartfelt cultural celebration honoring lost ancestors. Build a personal virtual ofrenda with glowing cempasúchil marigolds, sugar skulls, candles, and remembrance letters.',
    features: ['Interactive Ofrenda Builder', 'Flickering Candles', 'Memorial Cards', 'Heartfelt AI Poetry'],
    icon: '🌼',
    gradient: 'from-[#451A03] to-[#1C0A00]'
  },
  {
    id: 'ghost-story-teller',
    title: 'Ghost Story Teller',
    tagline: 'Interactive Generative AI Novel',
    difficulty: 'Immersive',
    diffColor: '#A855F7',
    players: '1 Player',
    aiBadge: 'Qwen 2.5 3B / Ollama',
    description: 'The premier AI-driven horror literature machine. Customize horror intensity, protagonist archetypes, and settings. Make critical branching choices with multi-paragraph progression.',
    features: ['Branching Interactive Choices', '7 Story Genres', 'Journal Save/Export', 'Ollama + Fallback'],
    icon: '📖',
    gradient: 'from-[#311B92] to-[#12005E]'
  },
  {
    id: 'lost-key',
    title: 'The Lost Key',
    tagline: 'Cryptic Adventure & Logic Trials',
    difficulty: 'Master Cryptography',
    diffColor: '#EF4444',
    players: '1 Player',
    aiBadge: 'AI Ciphers & Sequences',
    description: 'A labyrinth of ancient mechanical chests locked by logic deductions, Caesar rotated ciphers, cursed number sequences, and cryptic riddles. Complete validation with tiered hints.',
    features: ['Deductive Logic Trials', 'Caesar Ciphers', 'Tiered Hint System', 'Real Code Validation'],
    icon: '🗝️',
    gradient: 'from-[#3E2723] to-[#1A0E0B]'
  }
];

export default function GameGrid({ onSelectGame }) {
  return (
    <section id="games-section" className="py-20 px-4 max-w-7xl mx-auto relative z-20">
      
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A51F2B]/20 border border-[#A51F2B] text-[#FFE4B5] text-xs font-bold uppercase tracking-widest mb-3">
          <Skull size={14} /> CHOOSE YOUR GAME
        </div>
        <h2 className="font-['Cinzel'] font-black text-3xl sm:text-5xl text-[#F4E4CC] tracking-wider mb-4 text-glow-red">
          ENTER THE NIGHTMARE
        </h2>
        <p className="max-w-2xl mx-auto text-[#D6A56C]/80 font-serif italic text-base sm:text-lg">
          Seven playable offline experiences. From heart-pounding survival escapes to respectful ancestral remembrance.
        </p>
      </div>

      {/* Grid of Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {GAMES.map((game) => (
          <div
            key={game.id}
            className={`horror-card overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-2 border-t-2 ${
              game.id === 'red-balloon' ? 'border-t-[#E62A3B] ring-1 ring-[#A51F2B]/40' : 'border-t-[#D6A56C]/30'
            }`}
          >
            {/* Card Header & Artwork */}
            <div className={`p-6 bg-gradient-to-br ${game.gradient} relative overflow-hidden`}>
              
              {/* Special Signature Badge */}
              {game.badge && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#E62A3B] text-white text-[10px] font-black tracking-wider uppercase shadow-lg animate-pulse">
                  {game.badge}
                </div>
              )}

              {/* Big Icon / Artwork */}
              <div className="w-16 h-16 rounded-2xl bg-[#111827]/70 border border-[#D6A56C]/30 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 group-hover:border-[#F4E4CC] transition-all shadow-inner">
                {game.icon}
              </div>

              {/* Tags (Difficulty & Players) */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span 
                  className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#111827]/90 border border-current shadow-sm"
                  style={{ color: game.diffColor }}
                >
                  {game.difficulty}
                </span>

                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#111827]/70 text-[#D6A56C] border border-[#D6A56C]/30 flex items-center gap-1">
                  <Users size={12} /> {game.players}
                </span>

                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#111827]/70 text-[#93C5FD] border border-[#2563EB]/40 flex items-center gap-1">
                  <Sparkles size={11} /> {game.aiBadge}
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="font-['Cinzel'] font-bold text-2xl text-[#F4E4CC] group-hover:text-white transition-colors">
                {game.title}
              </h3>
              <p className="text-xs text-[#D6A56C] font-serif italic">
                {game.tagline}
              </p>
            </div>

            {/* Description & Feature Pills */}
            <div className="p-6 flex-1 flex flex-col justify-between bg-[#111827]/80">
              <p className="text-sm text-[#F4E4CC]/80 mb-5 leading-relaxed">
                {game.description}
              </p>

              {/* Feature Tags */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {game.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-[#D6A56C]/90 font-medium">
                    <span className="text-[#A51F2B] text-sm">♦</span>
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Play Now Button */}
              <button
                onClick={() => {
                  soundManager.playDoorCreak();
                  onSelectGame(game.id);
                }}
                className={`w-full py-3 px-4 rounded-lg font-['Cinzel'] font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
                  game.id === 'red-balloon'
                    ? 'btn-horror glow-red'
                    : 'bg-[#30213E] text-[#F4E4CC] border border-[#D6A56C]/50 hover:bg-[#A51F2B] hover:text-white hover:border-[#F4E4CC]'
                }`}
              >
                <Play size={16} className="fill-current" />
                <span>PLAY NOW</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
