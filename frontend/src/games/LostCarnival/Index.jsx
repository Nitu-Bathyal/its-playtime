import React, { useState, useEffect } from 'react';
import { 
  Coins, Trophy, Sparkles, CheckCircle2, 
  AlertTriangle, RotateCcw, Play, Eye, Compass 
} from 'lucide-react';
import GameHeader from '../../components/GameHeader';
import soundManager from '../../services/soundManager';
import dbService from '../../services/db';
import storage from '../../services/storage';
import achievementManager from '../../services/achievementManager';

export default function LostCarnivalGame({ onBack }) {
  const [tokens, setTokens] = useState(20);
  const [activeAttraction, setActiveAttraction] = useState('menu'); // menu, mirrors, wheel, memory, ticketbox, maze
  const [completedAttractions, setCompletedAttractions] = useState([]);
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // --- Attraction 1: Hall of Mirrors ---
  const [mirrorSequence, setMirrorSequence] = useState([1, 3, 2, 4]);
  const [userMirrorClicks, setUserMirrorClicks] = useState([]);

  // --- Attraction 2: Wheel of Torment ---
  const [needlePos, setNeedlePos] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetZone, setTargetZone] = useState({ start: 40, end: 60 });

  // --- Attraction 3: Memory Gallery ---
  const initialCards = [
    { id: 1, val: '🎈', matched: false, flipped: false },
    { id: 2, val: '🎈', matched: false, flipped: false },
    { id: 3, val: '🤡', matched: false, flipped: false },
    { id: 4, val: '🤡', matched: false, flipped: false },
    { id: 5, val: '💀', matched: false, flipped: false },
    { id: 6, val: '💀', matched: false, flipped: false },
    { id: 7, val: '🎪', matched: false, flipped: false },
    { id: 8, val: '🎪', matched: false, flipped: false }
  ];
  const [cards, setCards] = useState(() => initialCards.sort(() => Math.random() - 0.5));
  const [selectedCards, setSelectedCards] = useState([]);

  // --- Attraction 4: Ticket Booth ---
  const [ticketCodeInput, setTicketCodeInput] = useState('');

  // --- Attraction 5: Funhouse Maze ---
  const [mazeStep, setMazeStep] = useState(0);
  const [mazeTimeLeft, setMazeTimeLeft] = useState(15);
  const [mazeActive, setMazeActive] = useState(false);

  // Restore saved state on mount
  useEffect(() => {
    achievementManager.unlock('first_blood');
    async function loadProgress() {
      const saved = await dbService.getGameState('lost-carnival');
      if (saved && !saved.completed) {
        if (typeof saved.tokens === 'number') setTokens(saved.tokens);
        if (saved.completedAttractions) setCompletedAttractions(saved.completedAttractions);
      }
    }
    loadProgress();
  }, []);

  const persistCarnivalState = (newTokens, newCompleted) => {
    dbService.saveGameState('lost-carnival', {
      tokens: newTokens,
      completedAttractions: newCompleted,
      completed: false
    });
  };

  // Wheel animation loop
  useEffect(() => {
    let anim;
    if (isSpinning && !isPaused) {
      anim = setInterval(() => {
        setNeedlePos(p => (p + 3) % 100);
      }, 25);
    }
    return () => clearInterval(anim);
  }, [isSpinning, isPaused]);

  // Maze countdown timer
  useEffect(() => {
    let timer;
    if (mazeActive && !isPaused && mazeTimeLeft > 0) {
      timer = setInterval(() => {
        setMazeTimeLeft(t => {
          if (t <= 1) {
            handleMazeFail();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mazeActive, isPaused, mazeTimeLeft]);

  // 1. Mirrors
  const handleMirrorClick = (num) => {
    soundManager.playClick();
    const next = [...userMirrorClicks, num];
    setUserMirrorClicks(next);

    if (next[next.length - 1] !== mirrorSequence[next.length - 1]) {
      soundManager.playBalloonSqueak();
      setFeedback('The mirror shatters! Pattern broken. Try again.');
      setUserMirrorClicks([]);
      return;
    }

    if (next.length === mirrorSequence.length) {
      soundManager.playSuccessChime();
      const newTokens = tokens + 25;
      const newCompleted = [...new Set([...completedAttractions, 'mirrors'])];
      setTokens(newTokens);
      setCompletedAttractions(newCompleted);
      setFeedback('Mirrors Aligned! +25 Carnival Tokens Earned.');
      persistCarnivalState(newTokens, newCompleted);
      setTimeout(() => setActiveAttraction('menu'), 1500);
    }
  };

  // 2. Wheel
  const handleStopWheel = () => {
    setIsSpinning(false);
    soundManager.playClick();
    if (needlePos >= targetZone.start && needlePos <= targetZone.end) {
      soundManager.playSuccessChime();
      const newTokens = tokens + 30;
      const newCompleted = [...new Set([...completedAttractions, 'wheel'])];
      setTokens(newTokens);
      setCompletedAttractions(newCompleted);
      setFeedback('Bullseye on the Crimson Mark! +30 Tokens Awarded.');
      persistCarnivalState(newTokens, newCompleted);
      setTimeout(() => setActiveAttraction('menu'), 1500);
    } else {
      soundManager.playBalloonSqueak();
      setFeedback(`Missed the crimson mark (${targetZone.start}-${targetZone.end})! Try again.`);
    }
  };

  // 3. Memory
  const handleCardClick = (index) => {
    if (cards[index].flipped || cards[index].matched || selectedCards.length === 2) return;

    soundManager.playClick();
    const updated = cards.map((c, i) => i === index ? { ...c, flipped: true } : c);
    setCards(updated);
    const newSelected = [...selectedCards, { ...updated[index], index }];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      if (newSelected[0].val === newSelected[1].val) {
        soundManager.playSuccessChime();
        setTimeout(() => {
          setCards(prev => prev.map(c => c.val === newSelected[0].val ? { ...c, matched: true } : c));
          setSelectedCards([]);
          if (cards.filter(c => c.matched).length + 2 === cards.length) {
            const newTokens = tokens + 35;
            const newCompleted = [...new Set([...completedAttractions, 'memory'])];
            setTokens(newTokens);
            setCompletedAttractions(newCompleted);
            setFeedback('All Carnival Spirits Paired! +35 Tokens!');
            persistCarnivalState(newTokens, newCompleted);
            setTimeout(() => setActiveAttraction('menu'), 1500);
          }
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === newSelected[0].index || i === newSelected[1].index) ? { ...c, flipped: false } : c));
          setSelectedCards([]);
        }, 800);
      }
    }
  };

  // 4. Ticket Lockbox
  const handleTicketSubmit = (e) => {
    e.preventDefault();
    soundManager.playClick();
    const clean = ticketCodeInput.trim();
    if (clean === '777' || clean === '369' || clean === '963') {
      soundManager.playSuccessChime();
      const newTokens = tokens + 30;
      const newCompleted = [...new Set([...completedAttractions, 'ticketbox'])];
      setTokens(newTokens);
      setCompletedAttractions(newCompleted);
      setFeedback('The rusted cash box opens! +30 Tokens Collected.');
      setTicketCodeInput('');
      persistCarnivalState(newTokens, newCompleted);
      setTimeout(() => setActiveAttraction('menu'), 1500);
    } else {
      soundManager.playBalloonSqueak();
      setFeedback('Incorrect tumbler code! Multiples of three stamped on pass (3-6-9).');
    }
  };

  // 5. Maze
  const handleMazeStep = (isCorrect) => {
    soundManager.playClick();
    if (isCorrect) {
      if (mazeStep === 2) {
        soundManager.playSuccessChime();
        setMazeActive(false);
        const newTokens = tokens + 40;
        const newCompleted = [...new Set([...completedAttractions, 'maze'])];
        setTokens(newTokens);
        setCompletedAttractions(newCompleted);
        setFeedback('Escaped the Funhouse Maze! +40 Tokens Collected.');
        persistCarnivalState(newTokens, newCompleted);
        setTimeout(() => setActiveAttraction('menu'), 1500);
      } else {
        setMazeStep(s => s + 1);
      }
    } else {
      soundManager.playBalloonSqueak();
      setMazeStep(0);
      setFeedback('Triggered a trapdoor! Returned to maze entrance.');
    }
  };

  const handleMazeFail = () => {
    soundManager.playGhostMoan();
    setMazeActive(false);
    setMazeStep(0);
    setFeedback('Time ran out! The clown laughs as the maze walls shift.');
  };

  const handleUnlockFinalGate = () => {
    if (tokens >= 100) {
      soundManager.playDoorCreak();
      setGateUnlocked(true);
      achievementManager.unlock('carnival_king');
      storage.addXP(400, tokens * 10);
      dbService.saveGameState('lost-carnival', { completed: true, tokens });
      dbService.addScore({
        gameId: 'lost-carnival',
        gameTitle: 'The Lost Carnival',
        playerName: storage.getPlayerProfile().nickname,
        avatar: '🎪',
        score: tokens * 10
      });
    }
  };

  const handleRestart = () => {
    soundManager.playBalloonPop();
    setTokens(20);
    setActiveAttraction('menu');
    setCompletedAttractions([]);
    setGateUnlocked(false);
    setFeedback(null);
    setUserMirrorClicks([]);
    setIsSpinning(false);
    setCards(initialCards.sort(() => Math.random() - 0.5));
    setSelectedCards([]);
    setTicketCodeInput('');
    setMazeStep(0);
    setMazeTimeLeft(15);
    setMazeActive(false);
    setIsPaused(false);
    dbService.saveGameState('lost-carnival', { completed: false, tokens: 20, completedAttractions: [] });
  };

  return (
    <div className="min-h-screen bg-[#0E0610] text-[#F4E4CC] p-4 md:p-8 animate-fadeIn">
      
      {/* Universal Header with Pause, Resume, and Restart */}
      <div className="max-w-5xl mx-auto">
        <GameHeader
          gameTitle="THE LOST CARNIVAL"
          gameSubtitle="Attraction Survival & Token Economy"
          gameIcon="🎪"
          score={tokens}
          scoreLabel="Tokens"
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          onRestart={handleRestart}
          onBack={onBack}
          extraStatus={
            <div className="px-3 py-1 rounded-lg bg-[#30213E] border border-[#FFE4B5] flex items-center gap-1.5 text-xs font-black text-[#FFE4B5]">
              <Coins size={14} className="text-[#FFD700]" />
              <span>Target: 100</span>
            </div>
          }
        />
      </div>

      <div className="max-w-5xl mx-auto">
        
        {/* Feedback Alert */}
        {feedback && (
          <div className="mb-6 p-3 rounded-xl bg-[#30213E] border border-[#D6A56C] text-[#FFE4B5] text-xs font-semibold text-center animate-fadeIn flex items-center justify-center gap-2">
            <Sparkles size={16} />
            <span>{feedback}</span>
          </div>
        )}

        {/* ATTRACTION SELECTION MENU */}
        {activeAttraction === 'menu' && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-['Cinzel'] font-bold text-3xl text-[#F4E4CC] mb-2">
                MIDWAY ATTRACTIONS
              </h2>
              <p className="text-xs text-[#D6A56C] font-serif">
                Survive carnival trials, win tokens, and unlock the final iron gate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Attraction 1 */}
              <div className="horror-card p-5 bg-[#1A0C1C] border border-[#A51F2B]/40 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl">🪞</span>
                    {completedAttractions.includes('mirrors') && (
                      <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Solved
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-[#F4E4CC] mb-1">Hall of Mirrors</h3>
                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                    Memorize and repeat the reflection pattern across the fractured glass.
                  </p>
                </div>
                <button
                  onClick={() => { soundManager.playClick(); setActiveAttraction('mirrors'); setFeedback(null); }}
                  className="btn-horror py-2.5 text-xs w-full"
                >
                  ENTER HALL (+25 TOKENS)
                </button>
              </div>

              {/* Attraction 2 */}
              <div className="horror-card p-5 bg-[#1A0C1C] border border-[#A51F2B]/40 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl">🎡</span>
                    {completedAttractions.includes('wheel') && (
                      <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Solved
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-[#F4E4CC] mb-1">Wheel of Torment</h3>
                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                    A test of reflexes! Stop the spinning crimson arrow right inside the blood zone.
                  </p>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setActiveAttraction('wheel');
                    setIsSpinning(true);
                    setFeedback(null);
                  }}
                  className="btn-horror py-2.5 text-xs w-full"
                >
                  SPIN WHEEL (+30 TOKENS)
                </button>
              </div>

              {/* Attraction 3 */}
              <div className="horror-card p-5 bg-[#1A0C1C] border border-[#A51F2B]/40 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl">🃏</span>
                    {completedAttractions.includes('memory') && (
                      <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Solved
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-[#F4E4CC] mb-1">Clown's Memory Gallery</h3>
                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                    Flip and match pairs of haunted carnival tarot symbols.
                  </p>
                </div>
                <button
                  onClick={() => { soundManager.playClick(); setActiveAttraction('memory'); setFeedback(null); }}
                  className="btn-horror py-2.5 text-xs w-full"
                >
                  PAIR CARDS (+35 TOKENS)
                </button>
              </div>

              {/* Attraction 4 */}
              <div className="horror-card p-5 bg-[#1A0C1C] border border-[#A51F2B]/40 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl">🎟️</span>
                    {completedAttractions.includes('ticketbox') && (
                      <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Solved
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-[#F4E4CC] mb-1">Ticket Booth Lockbox</h3>
                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                    A combination lockbox. Deduce the 3-digit code stamped on the carnival passes.
                  </p>
                </div>
                <button
                  onClick={() => { soundManager.playClick(); setActiveAttraction('ticketbox'); setFeedback(null); }}
                  className="btn-horror py-2.5 text-xs w-full"
                >
                  CRACK CODE (+30 TOKENS)
                </button>
              </div>

              {/* Attraction 5 */}
              <div className="horror-card p-5 bg-[#1A0C1C] border border-[#A51F2B]/40 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl">🌀</span>
                    {completedAttractions.includes('maze') && (
                      <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Solved
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-[#F4E4CC] mb-1">Funhouse Maze</h3>
                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                    Navigate three tricky fork junctions before the 15-second timer expires!
                  </p>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setActiveAttraction('maze');
                    setMazeActive(true);
                    setMazeTimeLeft(15);
                    setMazeStep(0);
                    setFeedback(null);
                  }}
                  className="btn-horror py-2.5 text-xs w-full"
                >
                  ENTER MAZE (+40 TOKENS)
                </button>
              </div>

              {/* FINAL CARNIVAL GATE */}
              <div className="horror-card p-5 bg-[#2B0E1E] border-2 border-[#FFE4B5] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl">🚪</span>
                    <span className="text-xs text-[#FFE4B5] font-bold">100 Tokens Required</span>
                  </div>
                  <h3 className="font-bold text-lg text-[#FFE4B5] mb-1">Final Carnival Gate</h3>
                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                    Insert your tokens into the carnival gate turnstile to escape into the dawn.
                  </p>
                </div>
                <button
                  onClick={handleUnlockFinalGate}
                  disabled={tokens < 100}
                  className={`py-3 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 ${
                    tokens >= 100
                      ? 'btn-horror-gold animate-bounce'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>{tokens >= 100 ? 'UNLOCK GATE & ESCAPE!' : `NEED ${100 - tokens} MORE TOKENS`}</span>
                </button>
              </div>

            </div>

            {/* Gate Escape Victory Screen */}
            {gateUnlocked && (
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#4B1018] to-[#111827] border-2 border-[#FFE4B5] text-center space-y-4 animate-fadeIn">
                <div className="text-5xl">🎈</div>
                <h3 className="font-['Cinzel'] font-black text-3xl text-[#FFE4B5]">
                  YOU ESCAPED THE LOST CARNIVAL!
                </h3>
                <p className="text-sm text-[#F4E4CC] max-w-lg mx-auto">
                  The turnstiles spun freely under the weight of your tokens. You burst out onto the foggy county road as the distant calliope music fell silent.
                </p>
                <div className="text-xs text-[#D6A56C]">
                  Final Token Stash: <span className="text-[#FFE4B5] font-bold text-base">{tokens} Tokens</span> (+400 XP)
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
        )}

        {/* 1. HALL OF MIRRORS VIEW */}
        {activeAttraction === 'mirrors' && (
          <div className="horror-card p-6 bg-[#1A0C1C] border border-[#A51F2B] max-w-xl mx-auto text-center space-y-6">
            <h3 className="font-['Cinzel'] font-bold text-xl text-[#F4E4CC]">
              HALL OF MIRRORS: PATTERN TRIAL
            </h3>
            <p className="text-xs text-[#D6A56C]">
              Click the mirrors in the secret sequence: Mirror 1, Mirror 3, Mirror 2, Mirror 4!
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => handleMirrorClick(num)}
                  className="p-6 rounded-2xl bg-[#30213E] border border-[#FFE4B5]/40 hover:border-[#FFE4B5] text-2xl font-bold text-[#FFE4B5] hover:scale-105 transition-all shadow-inner"
                >
                  🪞 #{num}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-400">
              Your Clicks: {userMirrorClicks.join(' → ') || 'None yet'}
            </div>

            <button
              onClick={() => { soundManager.playClick(); setActiveAttraction('menu'); }}
              className="text-xs text-[#D6A56C] underline"
            >
              Back to Midway
            </button>
          </div>
        )}

        {/* 2. WHEEL OF TORMENT VIEW */}
        {activeAttraction === 'wheel' && (
          <div className="horror-card p-6 bg-[#1A0C1C] border border-[#A51F2B] max-w-xl mx-auto text-center space-y-6">
            <h3 className="font-['Cinzel'] font-bold text-xl text-[#F4E4CC]">
              WHEEL OF TORMENT: TIMING TEST
            </h3>
            <p className="text-xs text-[#D6A56C]">
              Press STOP when the cursor enters the crimson target zone (40% to 60%)!
            </p>

            {/* Bar Meter */}
            <div className="w-full h-8 bg-[#111827] rounded-full border border-[#D6A56C] relative overflow-hidden">
              <div 
                className="absolute top-0 bottom-0 bg-[#A51F2B] border-x border-[#FFE4B5] opacity-80"
                style={{ left: `${targetZone.start}%`, width: `${targetZone.end - targetZone.start}%` }}
              />
              <div 
                className="absolute top-0 bottom-0 w-2.5 bg-yellow-300 rounded shadow-lg transition-none"
                style={{ left: `${needlePos}%` }}
              />
            </div>

            <div className="flex justify-center gap-4">
              {isSpinning ? (
                <button
                  onClick={handleStopWheel}
                  className="btn-horror px-8 py-3 text-sm glow-red"
                >
                  STOP WHEEL!
                </button>
              ) : (
                <button
                  onClick={() => { setIsSpinning(true); setFeedback(null); }}
                  className="btn-horror-gold px-8 py-3 text-sm"
                >
                  RE-SPIN WHEEL
                </button>
              )}
            </div>

            <button
              onClick={() => { soundManager.playClick(); setActiveAttraction('menu'); }}
              className="text-xs text-[#D6A56C] underline"
            >
              Back to Midway
            </button>
          </div>
        )}

        {/* 3. MEMORY GALLERY VIEW */}
        {activeAttraction === 'memory' && (
          <div className="horror-card p-6 bg-[#1A0C1C] border border-[#A51F2B] max-w-xl mx-auto text-center space-y-6">
            <h3 className="font-['Cinzel'] font-bold text-xl text-[#F4E4CC]">
              CLOWN'S MEMORY GALLERY
            </h3>
            <p className="text-xs text-[#D6A56C]">
              Flip and pair the twin tarot tokens!
            </p>

            <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
              {cards.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => handleCardClick(i)}
                  className={`w-16 h-16 rounded-xl text-2xl font-bold border flex items-center justify-center transition-all ${
                    c.flipped || c.matched
                      ? 'bg-[#4B1018] border-[#FFE4B5] shadow-lg'
                      : 'bg-[#111827] border-[#374151] hover:border-[#A51F2B]'
                  }`}
                >
                  {c.flipped || c.matched ? c.val : '❓'}
                </button>
              ))}
            </div>

            <button
              onClick={() => { soundManager.playClick(); setActiveAttraction('menu'); }}
              className="text-xs text-[#D6A56C] underline"
            >
              Back to Midway
            </button>
          </div>
        )}

        {/* 4. TICKET BOOTH VIEW */}
        {activeAttraction === 'ticketbox' && (
          <div className="horror-card p-6 bg-[#1A0C1C] border border-[#A51F2B] max-w-md mx-auto text-center space-y-6">
            <h3 className="font-['Cinzel'] font-bold text-xl text-[#F4E4CC]">
              TICKET BOOTH TUMBLER
            </h3>
            <p className="text-xs text-[#D6A56C]">
              A scrap of ticket reads: "Multiples of three: 3 - 6 - ?"
            </p>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Enter 3-digit code..."
                value={ticketCodeInput}
                onChange={(e) => setTicketCodeInput(e.target.value)}
                className="w-full px-4 py-3 text-center tracking-widest text-lg font-mono rounded-lg bg-[#111827] border border-[#D6A56C] text-[#FFE4B5] focus:outline-none"
              />
              <button type="submit" className="btn-horror w-full py-3 text-xs">
                OPEN LOCKBOX
              </button>
            </form>

            <button
              onClick={() => { soundManager.playClick(); setActiveAttraction('menu'); }}
              className="text-xs text-[#D6A56C] underline"
            >
              Back to Midway
            </button>
          </div>
        )}

        {/* 5. FUNHOUSE MAZE VIEW */}
        {activeAttraction === 'maze' && (
          <div className="horror-card p-6 bg-[#1A0C1C] border border-[#A51F2B] max-w-md mx-auto text-center space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-['Cinzel'] font-bold text-xl text-[#F4E4CC]">
                FUNHOUSE MAZE
              </h3>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${mazeTimeLeft <= 5 ? 'bg-red-950 text-red-300 animate-pulse' : 'bg-[#30213E] text-blue-300'}`}>
                ⏱️ {mazeTimeLeft}s
              </span>
            </div>

            <p className="text-xs text-[#D6A56C]">
              Junction {mazeStep + 1} of 3. Choose the safe path!
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleMazeStep(mazeStep === 0 || mazeStep === 2)}
                className="p-5 rounded-xl bg-[#30213E] border border-[#D6A56C]/40 hover:border-[#FFE4B5] text-sm font-bold text-[#F4E4CC] transition-all"
              >
                LEFT CORRIDOR
              </button>
              <button
                onClick={() => handleMazeStep(mazeStep === 1)}
                className="p-5 rounded-xl bg-[#30213E] border border-[#D6A56C]/40 hover:border-[#FFE4B5] text-sm font-bold text-[#F4E4CC] transition-all"
              >
                RIGHT CORRIDOR
              </button>
            </div>

            <button
              onClick={() => { soundManager.playClick(); setActiveAttraction('menu'); }}
              className="text-xs text-[#D6A56C] underline"
            >
              Back to Midway
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
