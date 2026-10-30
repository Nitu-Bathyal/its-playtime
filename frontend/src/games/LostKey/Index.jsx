import React, { useState, useEffect } from 'react';
import { 
  Key, Lock, Unlock, HelpCircle, 
  CheckCircle2, Sparkles, AlertTriangle, ShieldAlert, Award 
} from 'lucide-react';
import GameHeader from '../../components/GameHeader';
import soundManager from '../../services/soundManager';
import aiService from '../../services/aiService';
import dbService from '../../services/db';
import storage from '../../services/storage';
import achievementManager from '../../services/achievementManager';

const CHESTS = [
  {
    id: 'chest_1',
    tier: 'Novice',
    name: 'The Mortuary Iron Chest',
    badge: 'Stage 1',
    type: 'sequence',
    icon: '⛓️',
    puzzle: {
      title: 'The Doubling Tumbler',
      description: 'Engraved onto the heavy brass lock is a sequence: 3, 6, 12, 24, 48, [?]. What number aligns the pins?',
      answer: '96',
      acceptable: ['96'],
      hints: [
        'Notice how each number changes relative to the previous one.',
        'Each tumbler digit is multiplied by 2.',
        'Multiply 48 by 2 to find the final number: 96.'
      ]
    }
  },
  {
    id: 'chest_2',
    tier: 'Investigator',
    name: 'The Caretaker\'s Brass Coffer',
    badge: 'Stage 2',
    type: 'cipher',
    icon: '🗝️',
    puzzle: {
      title: 'Caesar\'s Rotated Warning',
      description: 'Scratched into the lid is a 3-letter shift cipher. The word "RUN" translates to "UXQ". Decode the word written below: "KHOOR".',
      answer: 'HELLO',
      acceptable: ['HELLO', 'hello'],
      hints: [
        'Shift each letter backward in the alphabet by 3 positions.',
        'K shifted back 3 = H. H shifted back 3 = E.',
        'The jester\'s greeting: HELLO.'
      ]
    }
  },
  {
    id: 'chest_3',
    tier: 'Cryptographer',
    name: 'The Cathedral Bell Vault',
    badge: 'Stage 3',
    type: 'sequence',
    icon: '🔔',
    puzzle: {
      title: 'The Bells of Prime Destiny',
      description: 'The cathedral bells chime in an ascending sequence: 2, 3, 5, 7, 11, 13, [?]. What is the next bell count?',
      answer: '17',
      acceptable: ['17'],
      hints: [
        'Notice that 2 is included; these are not merely odd numbers.',
        'These are prime numbers—divisible only by 1 and themselves.',
        'The prime number directly following 13 is 17.'
      ]
    }
  },
  {
    id: 'chest_4',
    tier: 'Master',
    name: 'The Grand Alchemist\'s Obsidian Safe',
    badge: 'Stage 4',
    type: 'pattern',
    icon: '🔮',
    puzzle: {
      title: 'The Rune Length Key',
      description: 'An alchemist formula calculates: S-U-L-P-H-U-R = 7, B-L-O-O-D = 5, S-E-W-E-R = 5. What number disengages the seal for N-I-G-H-T-M-A-R-E?',
      answer: '9',
      acceptable: ['9', 'nine'],
      hints: [
        'Count the number of letters in SULPHUR (7) and BLOOD (5).',
        'Apply the same rule to the horror word NIGHTMARE.',
        'N-I-G-H-T-M-A-R-E has 9 letters.'
      ]
    }
  },
  {
    id: 'chest_5',
    tier: 'Grandmaster',
    name: 'The Master Key of Derrybrook',
    badge: 'Final Trial',
    type: 'logic',
    icon: '👑',
    puzzle: {
      title: 'The Three Haunted Statues',
      description: 'Three statues guard the final key: Jack (Jester), Crow (Raven), and Grim (Reaper). Exactly ONE statue tells the truth; the other two always lie.\n- Jester says: "The key is inside the Reaper."\n- Raven says: "I do not have the key."\n- Reaper says: "The Jester is lying."\nWhich statue holds the key: JESTER, RAVEN, or REAPER?',
      answer: 'RAVEN',
      acceptable: ['RAVEN', 'raven', 'the raven', 'crow'],
      hints: [
        'Assume Reaper tells the truth. Then Jester lies (key is not in Reaper).',
        'If Reaper is the sole truth-teller, Raven must be lying.',
        'Since Raven says "I do not have it" and is lying, RAVEN holds the key!'
      ]
    }
  }
];

export default function LostKeyGame({ onBack }) {
  const [currentChestIndex, setCurrentChestIndex] = useState(0);
  const [unlockedChests, setUnlockedChests] = useState([]);
  const [solutionInput, setSolutionInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hintTier, setHintTier] = useState(0);
  const [score, setScore] = useState(200);
  const [gameWon, setGameWon] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const activeChest = CHESTS[currentChestIndex];

  // Restore saved state on mount
  useEffect(() => {
    achievementManager.unlock('first_blood');
    async function loadProgress() {
      const saved = await dbService.getGameState('lost-key');
      if (saved && !saved.completed) {
        if (typeof saved.currentChestIndex === 'number') setCurrentChestIndex(saved.currentChestIndex);
        if (saved.unlockedChests) setUnlockedChests(saved.unlockedChests);
        if (saved.score) setScore(saved.score);
      }
    }
    loadProgress();
  }, []);

  const persistKeyState = (newIdx, newUnlocked, newScore) => {
    dbService.saveGameState('lost-key', {
      currentChestIndex: newIdx,
      unlockedChests: newUnlocked,
      score: newScore,
      completed: false
    });
  };

  const handleVerifySolution = (e) => {
    e.preventDefault();
    if (!solutionInput.trim()) return;

    soundManager.playClick();
    const cleanUser = solutionInput.trim().toUpperCase().replace(/[^\w]/g, '');
    const isCorrect = activeChest.puzzle.acceptable.some(a => String(a).toUpperCase().replace(/[^\w]/g, '') === cleanUser);

    if (isCorrect) {
      soundManager.playSuccessChime();
      const updated = [...new Set([...unlockedChests, activeChest.id])];
      const newScore = score + 150;
      setUnlockedChests(updated);
      setScore(newScore);
      setFeedback({
        type: 'success',
        message: 'The iron pins click into place! The chest unlocks.'
      });
      setSolutionInput('');
      setHintTier(0);

      achievementManager.unlock('prime_thinker');
      persistKeyState(currentChestIndex, updated, newScore);

      if (currentChestIndex === CHESTS.length - 1) {
        handleFinalVictory(newScore);
      }
    } else {
      soundManager.playBalloonSqueak();
      setFeedback({
        type: 'error',
        message: 'The lock mechanism resists! Incorrect code.'
      });
    }
  };

  const handleNextHint = () => {
    soundManager.playClick();
    if (hintTier < activeChest.puzzle.hints.length) {
      setHintTier(h => h + 1);
    }
  };

  const handleFinalVictory = (finalScore) => {
    soundManager.playSuccessChime();
    setGameWon(true);
    const calcScore = (finalScore || score) + 400;
    achievementManager.unlock('master_locksmith');
    storage.addXP(450, calcScore);
    dbService.saveGameState('lost-key', { completed: true, score: calcScore });
    dbService.addScore({
      gameId: 'lost-key',
      gameTitle: 'The Lost Key',
      playerName: storage.getPlayerProfile().nickname,
      avatar: '🗝️',
      score: calcScore
    });
  };

  const handleRestart = () => {
    soundManager.playBalloonPop();
    setCurrentChestIndex(0);
    setUnlockedChests([]);
    setSolutionInput('');
    setFeedback(null);
    setHintTier(0);
    setScore(200);
    setGameWon(false);
    setIsPaused(false);
    dbService.saveGameState('lost-key', { completed: false, currentChestIndex: 0, unlockedChests: [], score: 200 });
  };

  return (
    <div className="min-h-screen bg-[#0A0507] text-[#F4E4CC] p-4 md:p-8 animate-fadeIn">
      
      {/* Universal Header with Pause, Resume, and Restart */}
      <div className="max-w-5xl mx-auto">
        <GameHeader
          gameTitle="THE LOST KEY"
          gameSubtitle="Cryptographic Logic Adventure & Code Vaults"
          gameIcon="🗝️"
          score={score}
          scoreLabel="Score"
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          onRestart={handleRestart}
          onBack={onBack}
        />
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Chest Progression List */}
        <div className="space-y-3">
          <h3 className="font-['Cinzel'] font-bold text-xs uppercase tracking-wider text-[#D6A56C] px-1">
            CRYPTOGRAPHIC VAULTS ({unlockedChests.length}/{CHESTS.length})
          </h3>

          <div className="space-y-2">
            {CHESTS.map((chest, idx) => {
              const isCurrent = idx === currentChestIndex;
              const isUnlocked = unlockedChests.includes(chest.id);
              const isLocked = idx > 0 && !unlockedChests.includes(CHESTS[idx - 1].id);

              return (
                <button
                  key={chest.id}
                  disabled={isLocked}
                  onClick={() => {
                    soundManager.playDoorCreak();
                    setCurrentChestIndex(idx);
                    setSolutionInput('');
                    setFeedback(null);
                    setHintTier(0);
                    persistKeyState(idx, unlockedChests, score);
                  }}
                  className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-[#30213E] border-[#FFE4B5] shadow-lg scale-102 ring-1 ring-[#FFE4B5]'
                      : isUnlocked
                      ? 'bg-[#152338]/80 border-green-600/50 text-gray-300'
                      : isLocked
                      ? 'bg-[#0E0608]/70 border-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-[#1C0D12]/70 border-[#4B1018] hover:border-[#D6A56C]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{chest.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-[#F4E4CC]">{chest.name}</div>
                      <div className="text-[10px] text-gray-400">
                        {chest.badge} • Tier: <span className="text-[#D6A56C]">{chest.tier}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <CheckCircle2 size={16} className="text-green-400" />
                    ) : isLocked ? (
                      <Lock size={14} className="text-gray-600" />
                    ) : (
                      <span className="text-xs text-yellow-400 font-bold">ACTIVE</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center & Right: Chest Lock Interface */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="horror-card p-6 sm:p-8 bg-[#180B0F] border border-[#D6A56C]/40 space-y-6">
            
            {/* Chest Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#374151]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#30213E] text-[#FFE4B5] mr-2">
                  {activeChest.tier} Trial
                </span>
                <span className="text-[11px] text-gray-400">
                  Type: {activeChest.type}
                </span>
                <h2 className="font-['Cinzel'] font-black text-2xl text-[#FFE4B5] mt-1">
                  {activeChest.name}
                </h2>
              </div>

              <div className="text-4xl filter drop-shadow-[0_0_10px_#D6A56C]">
                {unlockedChests.includes(activeChest.id) ? '🔓' : activeChest.icon}
              </div>
            </div>

            {/* Puzzle Description */}
            <div className="p-4 rounded-xl bg-[#0E0608] border border-[#4B1018]">
              <div className="text-xs font-bold text-[#A51F2B] uppercase tracking-wider mb-2">
                {activeChest.puzzle.title}
              </div>
              <p className="text-sm font-serif text-[#F4E4CC] leading-relaxed whitespace-pre-line">
                {activeChest.puzzle.description}
              </p>
            </div>

            {/* Progressive Tiered Hint System */}
            <div className="p-4 rounded-xl bg-[#111827]/70 border border-[#374151] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D6A56C] flex items-center gap-1.5">
                  <HelpCircle size={14} /> Tiered Hint System
                </span>
                {hintTier < activeChest.puzzle.hints.length && (
                  <button
                    onClick={handleNextHint}
                    className="text-xs text-[#FFE4B5] underline hover:text-white"
                  >
                    Request Next Clue ({hintTier + 1}/{activeChest.puzzle.hints.length})
                  </button>
                )}
              </div>

              {hintTier > 0 ? (
                <div className="space-y-1 pt-1">
                  {activeChest.puzzle.hints.slice(0, hintTier).map((h, i) => (
                    <div key={i} className="text-xs text-yellow-200/90 bg-[#1F2937]/70 p-2 rounded border border-[#374151] animate-fadeIn">
                      💡 <strong>Clue {i + 1}:</strong> {h}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 italic">
                  Need assistance? Requesting a hint gives progressive clues without spoiling the solution.
                </p>
              )}
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-green-950 border border-green-500 text-green-300'
                  : 'bg-red-950 border border-red-500 text-red-300'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Code Input Form */}
            {unlockedChests.includes(activeChest.id) ? (
              <div className="p-4 rounded-xl bg-green-950/40 border border-green-600 text-green-300 text-xs font-bold flex items-center justify-between">
                <span>✓ Chest Disengaged! Relic Collected.</span>
                {currentChestIndex < CHESTS.length - 1 && (
                  <button
                    onClick={() => {
                      soundManager.playDoorCreak();
                      const nextIdx = currentChestIndex + 1;
                      setCurrentChestIndex(nextIdx);
                      setSolutionInput('');
                      setFeedback(null);
                      setHintTier(0);
                      persistKeyState(nextIdx, unlockedChests, score);
                    }}
                    className="underline hover:text-white"
                  >
                    Proceed to Next Vault →
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleVerifySolution} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#D6A56C] mb-1.5">
                    Align Mechanism Pins:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter code or deduction..."
                    value={solutionInput}
                    onChange={(e) => setSolutionInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#0E0608] border border-[#374151] text-sm text-[#F4E4CC] focus:outline-none focus:border-[#D6A56C] font-mono tracking-wider"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-horror-gold w-full py-3 text-xs uppercase tracking-wider"
                >
                  DISENGAGE CHEST LOCK
                </button>
              </form>
            )}

          </div>

          {/* Victory Card */}
          {gameWon && (
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#30213E] to-[#111827] border-2 border-[#FFE4B5] text-center space-y-4 animate-fadeIn">
              <div className="text-5xl">🗝️</div>
              <h3 className="font-['Cinzel'] font-black text-3xl text-[#FFE4B5]">
                ALL FIVE VAULTS UNSEALED!
              </h3>
              <p className="text-sm text-[#F4E4CC] max-w-lg mx-auto">
                You decoded the doubling tumblers, rotated Caesar ciphers, cathedral primes, and the statue logic riddle. The Master Key is yours!
              </p>
              <div className="text-xs text-[#D6A56C]">
                Final Score: <span className="text-[#FFE4B5] font-bold text-base">{score + 400} PTS</span> (+450 XP)
              </div>
              <button
                onClick={() => { soundManager.playClick(); onBack(); }}
                className="btn-horror px-8 py-3 text-xs"
              >
                RETURN TO PLATFORM
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
