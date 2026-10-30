import React, { useState, useEffect } from 'react';
import { 
  Compass, MapPin, Key, AlertTriangle, 
  HelpCircle, CheckCircle2, Skull, Trophy 
} from 'lucide-react';
import GameHeader from '../../components/GameHeader';
import soundManager from '../../services/soundManager';
import dbService from '../../services/db';
import storage from '../../services/storage';
import achievementManager from '../../services/achievementManager';

const LOCATIONS = [
  {
    id: 'town-square',
    name: 'Town Square & Fountain',
    bg: '#250B10',
    description: 'A dried fountain sits in the center of Derrybrook. The statue of the founding mayor has had its face chiselled away. A crimson balloon taps against the town hall clock.',
    itemsAvailable: [{ id: 'rusted_pin', name: 'Rusted Carnival Pin', desc: 'A sharp brass pin from the 1988 festival.' }],
    riddle: {
      question: 'I am light as air, tied by a thread to fate. When I float above your window, you cannot escape. What am I?',
      answer: 'balloon',
      acceptable: ['balloon', 'red balloon', 'a balloon', 'balloons']
    },
    dangerLevel: 'Low'
  },
  {
    id: 'pharmacy',
    name: 'Derelict Pharmacy',
    bg: '#1A0E18',
    description: 'Broken brown glass bottles litter the floor. In the prescription ledger, patient records from October 1988 describe an epidemic of scarlet balloon hallucinations.',
    itemsAvailable: [{ id: 'mortar_key', name: 'Brass Apothecary Key', desc: 'Opens the old clinic medicine safe.' }],
    riddle: {
      question: 'I weep wax tears in the dark of night. Without my flame, you have no sight. What am I?',
      answer: 'candle',
      acceptable: ['candle', 'a candle', 'wax candle', 'candles', 'taper']
    },
    dangerLevel: 'Moderate'
  },
  {
    id: 'police-station',
    name: 'Police Cell Block',
    bg: '#121927',
    description: 'Empty iron bar cells. On the interrogation table, an old cassette recorder clicks softly. A bloody fingerprint marks the detective\'s final incident report.',
    itemsAvailable: [{ id: 'detective_badge', name: 'Detective Vance\'s Badge', desc: 'Allows access to municipal utility control vaults.' }],
    riddle: {
      question: 'The more you take from me, the larger I become. What am I?',
      answer: 'hole',
      acceptable: ['hole', 'a hole', 'pit', 'grave', 'void']
    },
    dangerLevel: 'High'
  },
  {
    id: 'sewer-entrance',
    name: 'Sewer Sluice Gate',
    bg: '#0D141F',
    description: 'The final barrier. Heavy cast-iron gates holding back black sewer water. A valve wheel slot and three tumbler dials bar your passage into the sanctuary beyond.',
    itemsAvailable: [{ id: 'valve_wheel', name: 'Heavy Cast Iron Valve', desc: 'Required to drain the flooding conduits.' }],
    riddle: {
      question: 'I have keys that open no doors, space but no room to breathe. You can enter, but you can never leave. What am I?',
      answer: 'keyboard',
      acceptable: ['keyboard', 'a keyboard', 'typewriter', 'piano']
    },
    dangerLevel: 'EXTREME NIGHTMARE'
  }
];

export default function RedBalloonGame({ onBack }) {
  const [currentLocIndex, setCurrentLocIndex] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [collectedClues, setCollectedClues] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [tensionTimer, setTensionTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [solvedLocations, setSolvedLocations] = useState([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [finalEnding, setFinalEnding] = useState(null);
  const [score, setScore] = useState(100);

  const loc = LOCATIONS[currentLocIndex];

  // Restore saved progress on mount
  useEffect(() => {
    achievementManager.unlock('first_blood');
    async function loadProgress() {
      const saved = await dbService.getGameState('red-balloon');
      if (saved && !saved.completed) {
        if (typeof saved.currentLocIndex === 'number') setCurrentLocIndex(saved.currentLocIndex);
        if (saved.inventory) setInventory(saved.inventory);
        if (saved.collectedClues) setCollectedClues(saved.collectedClues);
        if (saved.solvedLocations) setSolvedLocations(saved.solvedLocations);
        if (saved.score) setScore(saved.score);
      }
    }
    loadProgress();
  }, []);

  // Save progress helper
  const persistState = (newLoc, newInv, newClues, newSolved, newScore) => {
    dbService.saveGameState('red-balloon', {
      currentLocIndex: newLoc,
      inventory: newInv,
      collectedClues: newClues,
      solvedLocations: newSolved,
      score: newScore,
      completed: false
    });
  };

  // Tension countdown timer
  useEffect(() => {
    let interval = null;
    if (timerActive && !isPaused && tensionTimer > 0 && !gameEnded) {
      interval = setInterval(() => {
        setTensionTimer((t) => {
          if (t <= 5 && t > 0) {
            soundManager.playHeartbeat();
          }
          if (t <= 1) {
            handleTimeOut();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, isPaused, tensionTimer, gameEnded]);

  const handleTimeOut = () => {
    soundManager.playGhostMoan();
    setScore(s => Math.max(20, s - 40));
    setFeedback({
      type: 'warning',
      message: 'The red balloon brushed your shoulder! The clown giggled in the fog. Tension reset!'
    });
    setTensionTimer(45);
  };

  const handleStartInvestigation = () => {
    soundManager.playClick();
    setTimerActive(true);
    setTensionTimer(60);
  };

  const handlePickupItem = (item) => {
    soundManager.playClick();
    if (!inventory.some(i => i.id === item.id)) {
      const newInv = [...inventory, item];
      const newScore = score + 50;
      setInventory(newInv);
      setScore(newScore);
      setFeedback({
        type: 'success',
        message: `Acquired: ${item.name}! Added to your investigation satchel.`
      });

      persistState(currentLocIndex, newInv, collectedClues, solvedLocations, newScore);

      if (newInv.length === 4) {
        achievementManager.unlock('town_detective');
      }
    }
  };

  const handleSolveRiddle = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    soundManager.playClick();
    const cleanUser = userAnswer.trim().toLowerCase().replace(/[^\w\s]/g, '');
    const isCorrect = loc.riddle.acceptable.some(a => {
      const cleanA = a.toLowerCase().replace(/[^\w\s]/g, '');
      return cleanUser === cleanA || (cleanUser.length >= 3 && cleanA.includes(cleanUser)) || (cleanA.length >= 3 && cleanUser.includes(cleanA));
    });

    if (isCorrect) {
      soundManager.playSuccessChime();
      const updatedSolved = [...new Set([...solvedLocations, loc.id])];
      const newClues = [...collectedClues, `Unlocked clue at ${loc.name}`];
      const newScore = score + 100;
      setSolvedLocations(updatedSolved);
      setCollectedClues(newClues);
      setScore(newScore);
      setFeedback({
        type: 'success',
        message: 'The shadow recedes! The location mystery has been solved.'
      });
      setUserAnswer('');

      achievementManager.unlock('prime_thinker');
      persistState(currentLocIndex, inventory, newClues, updatedSolved, newScore);

      // If at final sewer gate and all 4 locations solved
      if (currentLocIndex === LOCATIONS.length - 1) {
        handleFinalEscape(newScore);
      }
    } else {
      soundManager.playBalloonSqueak();
      setFeedback({
        type: 'error',
        message: 'The lock rattles in resistance! Incorrect deduction.'
      });
    }
  };

  const handleFinalEscape = (finalCurrentScore) => {
    soundManager.playSuccessChime();
    setGameEnded(true);
    setTimerActive(false);

    let endingTitle = 'Survivor of Derrybrook';
    let endingDesc = 'You turned the heavy iron valves in sequence and unlocked the rusted floodgate. Slipping through the storm sluice, you emerged into the cold autumn sunrise as the carnival music faded forever.';
    
    if (inventory.length === 4) {
      endingTitle = 'Master of the Sewer Tunnels';
      endingDesc = 'Armed with all 4 artifacts—the pin, the mortar key, Vance\'s badge, and the valve wheel—you confronted the clown at his subterranean shrine. He yielded his silver balloon, granting you mastery over the carnival.';
    }

    const calcScore = (finalCurrentScore || score) + 250;
    setFinalEnding({
      title: endingTitle,
      description: endingDesc,
      score: calcScore
    });

    achievementManager.unlock('sewer_escape');
    storage.addXP(300, calcScore);
    dbService.saveGameState('red-balloon', { completed: true, score: calcScore });
    dbService.addScore({
      gameId: 'red-balloon',
      gameTitle: 'The Red Balloon',
      playerName: storage.getPlayerProfile().nickname,
      avatar: '🎈',
      score: calcScore
    });
  };

  const handleRestart = () => {
    soundManager.playBalloonPop();
    setCurrentLocIndex(0);
    setInventory([]);
    setCollectedClues([]);
    setUserAnswer('');
    setFeedback(null);
    setTensionTimer(60);
    setTimerActive(false);
    setIsPaused(false);
    setSolvedLocations([]);
    setGameEnded(false);
    setFinalEnding(null);
    setScore(100);
    dbService.saveGameState('red-balloon', { completed: false, currentLocIndex: 0, inventory: [], solvedLocations: [], score: 100 });
  };

  return (
    <div className="min-h-screen bg-[#0E0608] text-[#F4E4CC] p-4 md:p-8 animate-fadeIn">
      
      {/* Universal In-Game Header with Pause, Resume, and Restart */}
      <div className="max-w-6xl mx-auto">
        <GameHeader
          gameTitle="THE RED BALLOON"
          gameSubtitle="Chapter 1: The Trail of Derrybrook"
          gameIcon="🎈"
          score={score}
          scoreLabel="Score"
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          onRestart={handleRestart}
          onBack={onBack}
          extraStatus={
            timerActive && (
              <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                tensionTimer <= 15 ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse' : 'bg-[#18233C] border-blue-600 text-blue-200'
              }`}>
                <AlertTriangle size={14} /> Tension: {tensionTimer}s
              </div>
            )
          }
        />
      </div>

      {/* Main Game Interface */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Interactive Town Map & Satchel */}
        <div className="space-y-6">
          
          {/* Town Map */}
          <div className="horror-card p-5 bg-[#140D18] border border-[#D6A56C]/30">
            <h3 className="font-['Cinzel'] font-bold text-sm text-[#F4E4CC] mb-3 flex items-center gap-2">
              <Compass size={16} className="text-[#A51F2B]" />
              INTERACTIVE TOWN MAP
            </h3>

            <div className="space-y-2">
              {LOCATIONS.map((l, idx) => {
                const isCurrent = idx === currentLocIndex;
                const isSolved = solvedLocations.includes(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      soundManager.playDoorCreak();
                      setCurrentLocIndex(idx);
                      setUserAnswer('');
                      setFeedback(null);
                      persistState(idx, inventory, collectedClues, solvedLocations, score);
                    }}
                    className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#4B1018] border-[#FFE4B5] shadow-lg scale-102 ring-1 ring-[#FFE4B5]'
                        : isSolved
                        ? 'bg-[#18233C]/70 border-green-700/50 text-gray-300'
                        : 'bg-[#111827]/70 border-[#374151] hover:border-[#A51F2B]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <MapPin size={14} className={isCurrent ? "text-[#FFE4B5]" : "text-gray-400"} />
                        <span>{l.name}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Danger: <span className={l.dangerLevel.includes('NIGHTMARE') ? 'text-red-400 font-bold' : 'text-yellow-400'}>{l.dangerLevel}</span>
                      </div>
                    </div>

                    <div>
                      {isSolved ? (
                        <CheckCircle2 size={16} className="text-green-400" />
                      ) : (
                        <span className="text-sm">🎈</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Satchel & Inventory */}
          <div className="horror-card p-5 bg-[#140D18] border border-[#D6A56C]/30">
            <h3 className="font-['Cinzel'] font-bold text-sm text-[#F4E4CC] mb-3 flex items-center gap-2">
              <Key size={16} className="text-[#D6A56C]" />
              INVESTIGATION SATCHEL ({inventory.length}/4)
            </h3>

            {inventory.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                Your satchel is empty. Search the current location to uncover hidden items.
              </p>
            ) : (
              <div className="space-y-2">
                {inventory.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-[#111827] border border-[#4B1018] flex items-center gap-2 text-xs">
                    <span className="text-base">🗝️</span>
                    <div>
                      <div className="font-bold text-[#FFE4B5]">{item.name}</div>
                      <div className="text-[10px] text-gray-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Center & Right: Location Scene & Riddle Challenge */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Location Scene Canvas Card */}
          <div 
            className="horror-card p-6 border border-[#A51F2B]/40 relative overflow-hidden"
            style={{ backgroundColor: loc.bg }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-[#111827]/80 text-[#D6A56C] border border-[#D6A56C]/30">
                Location {currentLocIndex + 1} of 4
              </span>
              <span className="text-xs text-red-300 font-bold flex items-center gap-1">
                <Skull size={14} /> {loc.dangerLevel}
              </span>
            </div>

            <h2 className="font-['Cinzel'] font-black text-2xl text-[#F4E4CC] mb-3">
              {loc.name}
            </h2>

            <p className="text-sm text-[#F4E4CC]/90 leading-relaxed mb-6 font-serif">
              {loc.description}
            </p>

            {/* Available Ground Items to Pick up */}
            <div className="mb-6 p-4 rounded-xl bg-[#111827]/80 border border-[#374151]">
              <div className="text-xs font-bold text-[#D6A56C] uppercase tracking-wider mb-2">
                Search Scene for Clues:
              </div>
              <div className="flex flex-wrap gap-2">
                {loc.itemsAvailable.map((item) => {
                  const alreadyHave = inventory.some(i => i.id === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePickupItem(item)}
                      disabled={alreadyHave}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                        alreadyHave
                          ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-default'
                          : 'bg-[#30213E] border-[#A51F2B] text-[#FFE4B5] hover:border-[#D6A56C] hover:scale-105'
                      }`}
                    >
                      <span>🔍</span>
                      <span>{alreadyHave ? `${item.name} (Acquired)` : `Inspect ${item.name}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tension Investigation Trigger */}
            {!timerActive && !solvedLocations.includes(loc.id) && (
              <button
                onClick={handleStartInvestigation}
                className="btn-horror w-full py-3 text-sm flex items-center justify-center gap-2 mb-6"
              >
                <AlertTriangle size={16} />
                <span>START LOCATION TIMED INVESTIGATION</span>
              </button>
            )}

            {/* Riddle / Lock Mechanism */}
            <div className="p-5 rounded-xl bg-[#111827]/90 border border-[#4B1018]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#A51F2B] uppercase tracking-wider mb-2">
                <HelpCircle size={15} /> Location Mystery Riddle
              </div>

              <p className="text-sm font-serif italic text-[#FFE4B5] mb-4 leading-relaxed">
                "{loc.riddle.question}"
              </p>

              {feedback && (
                <div className={`p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-green-950/70 border border-green-500 text-green-300'
                    : feedback.type === 'warning'
                    ? 'bg-yellow-950/70 border border-yellow-500 text-yellow-300'
                    : 'bg-red-950/70 border border-red-500 text-red-300'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{feedback.message}</span>
                </div>
              )}

              {solvedLocations.includes(loc.id) ? (
                <div className="p-3 rounded-lg bg-green-950/40 border border-green-600/60 text-green-300 text-xs font-bold flex items-center justify-between">
                  <span>✓ Location Mystery Solved!</span>
                  {currentLocIndex < LOCATIONS.length - 1 && (
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        const nextIdx = currentLocIndex + 1;
                        setCurrentLocIndex(nextIdx);
                        setUserAnswer('');
                        setFeedback(null);
                        persistState(nextIdx, inventory, collectedClues, solvedLocations, score);
                      }}
                      className="underline hover:text-white"
                    >
                      Advance to Next Location →
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSolveRiddle} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter the riddle solution..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0A0E17] border border-[#374151] text-[#F4E4CC] focus:outline-none focus:border-[#A51F2B] text-sm"
                  />
                  <button
                    type="submit"
                    className="btn-horror-gold w-full py-2.5 text-xs font-bold uppercase tracking-wider"
                  >
                    SUBMIT DEDUCTION
                  </button>
                </form>
              )}

            </div>

          </div>

          {/* Victory Modal Overlay if Game Ended */}
          {gameEnded && finalEnding && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#4B1018] to-[#111827] border-2 border-[#FFE4B5] shadow-2xl animate-fadeIn">
              <div className="text-center space-y-4">
                <div className="text-5xl animate-bounce">🎈</div>
                <h3 className="font-['Cinzel'] font-black text-3xl text-[#FFE4B5]">
                  {finalEnding.title}
                </h3>
                <p className="text-sm text-[#F4E4CC] max-w-lg mx-auto leading-relaxed">
                  {finalEnding.description}
                </p>
                <div className="p-3 rounded-xl bg-[#111827]/80 inline-block text-xs font-bold text-[#D6A56C]">
                  Final Score: <span className="text-[#FFE4B5] text-base">{finalEnding.score} PTS</span> (+300 XP Earned)
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => { soundManager.playClick(); onBack(); }}
                    className="btn-horror px-6 py-2.5 text-xs"
                  >
                    RETURN TO CARNIVAL HUB
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
