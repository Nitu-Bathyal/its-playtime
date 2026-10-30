import React, { useState, useEffect } from 'react';
import { 
  Compass, Key, Search, HelpCircle, 
  CheckCircle2, Lock, Unlock, Eye, Sparkles, BookOpen 
} from 'lucide-react';
import GameHeader from '../../components/GameHeader';
import soundManager from '../../services/soundManager';
import dbService from '../../services/db';
import storage from '../../services/storage';
import achievementManager from '../../services/achievementManager';

const DEFAULT_ROOMS = [
  {
    id: 'foyer',
    name: 'Grand Foyer',
    desc: 'Dual marble staircases climb into shadow. A cold gust snuffs the chandelier. A brass grandfather clock ticks with a heavy pendulum.',
    locked: false,
    objects: [
      { id: 'foyer_key', name: 'Iron Library Key', found: false, desc: 'Tucked behind the base of the weeping angel statue.' }
    ],
    puzzle: {
      type: 'clock',
      title: 'The Ticking Pendulum',
      question: 'The grandfather clock stopped. The diary entry says: "Set the hour hand to the time the curse took effect: Three hours before midnight, plus thirty-three minutes."',
      answer: '9:33',
      acceptable: ['9:33', '09:33', '9 33', '9.33', '933', '9:33am', '9:33pm'],
      hint: 'Midnight is 12:00. Three hours before is 9:00, plus 33 minutes = 9:33.'
    }
  },
  {
    id: 'library',
    name: 'Dusty Library',
    desc: 'Floor-to-ceiling mahogany bookshelves groaning with ancient occult tomes. A ladder leans against the forbidden top shelf.',
    locked: true,
    requiredKey: 'foyer_key',
    objects: [
      { id: 'diary_page', name: 'Lord Ravenscroft\'s Journal Fragment', found: false, desc: 'Describes a secret passage behind the conservatory fountain.' },
      { id: 'conservatory_key', name: 'Glasshouse Key', found: false, desc: 'Hidden between the pages of "Anatomy of Shadows".' }
    ],
    puzzle: {
      type: 'cipher',
      title: 'The Book Spine Sequence',
      question: 'Five leather tomes are marked with letters: D - E - A - T - ?. Which letter completes the word engraved in the shelf?',
      answer: 'H',
      acceptable: ['H', 'h', 'death'],
      hint: 'D - E - A - T - H.'
    }
  },
  {
    id: 'conservatory',
    name: 'Darkened Conservatory',
    desc: 'Overgrown dead vines choke the glass solarium. A stone gargoyle fountain weeps black water. Moonlight reflects through shattered skylights.',
    locked: true,
    requiredKey: 'conservatory_key',
    objects: [
      { id: 'crystal_prism', name: 'Faceted Quartz Prism', found: false, desc: 'Needed to focus the moonlight into the cellar grate.' }
    ],
    puzzle: {
      type: 'light',
      title: 'Moonlight Refraction',
      question: 'How many primary colors are revealed when pure white moonlight splits through the quartz prism?',
      answer: '7',
      acceptable: ['7', 'seven'],
      hint: 'The rainbow spectrum: Red, Orange, Yellow, Green, Blue, Indigo, Violet.'
    }
  },
  {
    id: 'cellar',
    name: 'Cobwebbed Wine Cellar',
    desc: 'Racks of spoiled vintage port and thick spiderwebs. Cold river fog rises between the flagstones. An iron ring in the floor leads to the ancient crypt.',
    locked: true,
    requiredItem: 'crystal_prism',
    objects: [
      { id: 'crypt_crest', name: 'Ravenscroft Family Crest', found: false, desc: 'The silver seal of the bloodline.' }
    ],
    puzzle: {
      type: 'gate',
      title: 'The Crypt Lock Dial',
      question: 'The stone crypt lock has roman numerals: V (5) + IV (4) + IX (9) = ?',
      answer: '18',
      acceptable: ['18', 'XVIII', 'eighteen'],
      hint: '5 + 4 + 9 = 18.'
    }
  },
  {
    id: 'crypt',
    name: 'Subterranean Secret Crypt',
    desc: 'The heart of Ravenscroft Manor. Sarcophagi of past lords surround a central pedestal holding a glowing red balloon tethered to an obsidian chalice.',
    locked: true,
    requiredItem: 'crypt_crest',
    objects: [
      { id: 'final_relic', name: 'The Clown\'s Music Box', found: false, desc: 'Plays the melody that binds the spirits to Derrybrook.' }
    ],
    puzzle: {
      type: 'final',
      title: 'The Last Rite of Release',
      question: 'To break the tether, speak the name of what you refuse to give the darkness: F---?',
      answer: 'FEAR',
      acceptable: ['FEAR', 'fear', 'my fear', 'no fear'],
      hint: 'The clown feeds on FEAR.'
    }
  }
];

export default function HauntedMansionGame({ onBack }) {
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [solvedPuzzles, setSolvedPuzzles] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(150);

  const currentRoom = rooms[currentRoomIndex];

  // Restore saved progress on mount
  useEffect(() => {
    achievementManager.unlock('first_blood');
    async function loadSaved() {
      const saved = await dbService.getGameState('haunted-mansion');
      if (saved && !saved.completed) {
        if (saved.inventory) setInventory(saved.inventory);
        if (saved.solvedPuzzles) setSolvedPuzzles(saved.solvedPuzzles);
        if (saved.rooms) setRooms(saved.rooms);
        if (typeof saved.currentRoomIndex === 'number') setCurrentRoomIndex(saved.currentRoomIndex);
        if (saved.score) setScore(saved.score);
      }
    }
    loadSaved();
  }, []);

  const persistMansionState = (newRooms, newInv, newSolved, newRoomIdx, newScore) => {
    dbService.saveGameState('haunted-mansion', {
      rooms: newRooms,
      inventory: newInv,
      solvedPuzzles: newSolved,
      currentRoomIndex: newRoomIdx,
      score: newScore,
      completed: false
    });
  };

  const handleInspectObject = (obj) => {
    soundManager.playClick();
    if (!inventory.some(i => i.id === obj.id)) {
      const updatedInv = [...inventory, obj];
      const updatedScore = score + 75;
      setInventory(updatedInv);
      setScore(updatedScore);

      // Unlock next room if this object is a required key
      const updatedRooms = rooms.map(r => {
        if (r.requiredKey === obj.id || r.requiredItem === obj.id) {
          return { ...r, locked: false };
        }
        return r;
      });
      setRooms(updatedRooms);

      setFeedback({
        type: 'success',
        message: `Discovered: ${obj.name}! ${obj.desc}`
      });

      persistMansionState(updatedRooms, updatedInv, solvedPuzzles, currentRoomIndex, updatedScore);
    }
  };

  const handleSolveRoomPuzzle = (e) => {
    e.preventDefault();
    if (!puzzleAnswer.trim()) return;

    soundManager.playClick();
    const cleanUser = puzzleAnswer.trim().toLowerCase().replace(/[^\w]/g, '');
    const isCorrect = currentRoom.puzzle.acceptable.some(a => {
      const cleanA = a.toLowerCase().replace(/[^\w]/g, '');
      return cleanUser === cleanA || (cleanUser.length >= 2 && cleanA.includes(cleanUser));
    });

    if (isCorrect) {
      soundManager.playSuccessChime();
      const updatedSolved = [...new Set([...solvedPuzzles, currentRoom.id])];
      const updatedScore = score + 120;
      setSolvedPuzzles(updatedSolved);
      setScore(updatedScore);
      setFeedback({
        type: 'success',
        message: 'The mechanism clicks into place! Room mystery solved.'
      });
      setPuzzleAnswer('');
      setShowHint(false);

      achievementManager.unlock('prime_thinker');
      persistMansionState(rooms, inventory, updatedSolved, currentRoomIndex, updatedScore);

      if (currentRoom.id === 'crypt') {
        handleCryptVictory(updatedScore);
      }
    } else {
      soundManager.playBalloonSqueak();
      setFeedback({
        type: 'error',
        message: 'A cold whisper sighs in disappointment... Incorrect solution.'
      });
    }
  };

  const handleCryptVictory = (finalScore) => {
    soundManager.playSuccessChime();
    setGameWon(true);
    const calcScore = (finalScore || score) + 300;
    achievementManager.unlock('mansion_master');
    storage.addXP(350, calcScore);
    dbService.saveGameState('haunted-mansion', { completed: true, score: calcScore });
    dbService.addScore({
      gameId: 'haunted-mansion',
      gameTitle: 'Haunted Mansion',
      playerName: storage.getPlayerProfile().nickname,
      avatar: '🏰',
      score: calcScore
    });
  };

  const handleRestart = () => {
    soundManager.playBalloonPop();
    setRooms(DEFAULT_ROOMS);
    setCurrentRoomIndex(0);
    setInventory([]);
    setPuzzleAnswer('');
    setFeedback(null);
    setShowHint(false);
    setSolvedPuzzles([]);
    setIsPaused(false);
    setGameWon(false);
    setScore(150);
    dbService.saveGameState('haunted-mansion', { completed: false, rooms: DEFAULT_ROOMS, inventory: [], solvedPuzzles: [], score: 150 });
  };

  return (
    <div className="min-h-screen bg-[#0B0711] text-[#F4E4CC] p-4 md:p-8 animate-fadeIn">
      
      {/* Universal Header with Pause, Resume, and Restart */}
      <div className="max-w-6xl mx-auto">
        <GameHeader
          gameTitle="RAVENSCROFT HAUNTED MANSION"
          gameSubtitle="Room Mystery & Secret Passage Adventure"
          gameIcon="🏰"
          score={score}
          scoreLabel="Score"
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          onRestart={handleRestart}
          onBack={onBack}
        />
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Rooms Navigation & Keys */}
        <div className="space-y-6">
          
          <div className="horror-card p-5 bg-[#170E20] border border-[#D6A56C]/30">
            <h3 className="font-['Cinzel'] font-bold text-sm text-[#F4E4CC] mb-3 flex items-center gap-2">
              <Compass size={16} className="text-[#D6A56C]" />
              MANOR WINGS & ROOMS
            </h3>

            <div className="space-y-2">
              {rooms.map((room, idx) => {
                const isCurrent = idx === currentRoomIndex;
                const isSolved = solvedPuzzles.includes(room.id);
                return (
                  <button
                    key={room.id}
                    disabled={room.locked}
                    onClick={() => {
                      soundManager.playDoorCreak();
                      setCurrentRoomIndex(idx);
                      setPuzzleAnswer('');
                      setFeedback(null);
                      setShowHint(false);
                      persistMansionState(rooms, inventory, solvedPuzzles, idx, score);
                    }}
                    className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#30213E] border-[#FFE4B5] shadow-lg scale-102 ring-1 ring-[#FFE4B5]'
                        : room.locked
                        ? 'bg-[#0D0914]/80 border-gray-800 text-gray-500 cursor-not-allowed'
                        : isSolved
                        ? 'bg-[#152338]/80 border-blue-500/50 text-gray-300'
                        : 'bg-[#1F142B]/70 border-[#4B1018] hover:border-[#D6A56C]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        {room.locked ? <Lock size={14} className="text-red-400" /> : <Unlock size={14} className="text-green-400" />}
                        <span>{room.name}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {room.locked ? 'Locked • Requires Key' : isSolved ? '✓ Mystery Solved' : 'Unexplored'}
                      </div>
                    </div>

                    <div>
                      {isSolved ? (
                        <CheckCircle2 size={16} className="text-green-400" />
                      ) : room.locked ? (
                        <span className="text-xs">🔒</span>
                      ) : (
                        <span className="text-xs">🗝️</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keys & Relics Held */}
          <div className="horror-card p-5 bg-[#170E20] border border-[#D6A56C]/30">
            <h3 className="font-['Cinzel'] font-bold text-sm text-[#F4E4CC] mb-3 flex items-center gap-2">
              <Key size={16} className="text-[#D6A56C]" />
              RELICS & KEYS COLLECTED ({inventory.length})
            </h3>
            {inventory.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No keys found yet. Inspect items in the Grand Foyer.</p>
            ) : (
              <div className="space-y-2">
                {inventory.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-[#0F0A17] border border-[#30213E] text-xs">
                    <div className="font-bold text-[#FFE4B5] flex items-center gap-1">
                      <span>✨</span> {item.name}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Center & Right: Room Scene & Puzzle */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="horror-card p-6 bg-[#170E20] border border-[#D6A56C]/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D6A56C] px-2.5 py-1 rounded bg-[#0D0914] border border-[#30213E]">
                Wing {currentRoomIndex + 1} of {rooms.length}
              </span>
              <span className="text-xs text-[#FFE4B5] font-semibold">
                Ravenscroft Manor
              </span>
            </div>

            <h2 className="font-['Cinzel'] font-black text-2xl text-[#F4E4CC] mb-3">
              {currentRoom.name}
            </h2>

            <p className="text-sm font-serif text-[#F4E4CC]/90 leading-relaxed mb-6">
              {currentRoom.desc}
            </p>

            {/* Hidden Objects to Discover */}
            <div className="mb-6 p-4 rounded-xl bg-[#0F0A17] border border-[#30213E]">
              <div className="text-xs font-bold text-[#D6A56C] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Search size={14} /> Search Room For Hidden Secrets:
              </div>
              <div className="flex flex-wrap gap-2">
                {currentRoom.objects.map((obj) => {
                  const alreadyFound = inventory.some(i => i.id === obj.id);
                  return (
                    <button
                      key={obj.id}
                      onClick={() => handleInspectObject(obj)}
                      disabled={alreadyFound}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                        alreadyFound
                          ? 'bg-gray-900 border-gray-800 text-gray-500 cursor-default'
                          : 'bg-[#30213E] border-[#D6A56C]/60 text-[#FFE4B5] hover:border-[#FFE4B5] hover:scale-105'
                      }`}
                    >
                      <Eye size={14} />
                      <span>{alreadyFound ? `${obj.name} (In Possession)` : `Examine ${obj.name}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Room Logic Puzzle */}
            <div className="p-5 rounded-xl bg-[#0F0A17] border border-[#4B1018]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-[#A51F2B] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} /> {currentRoom.puzzle.title}
                </div>
                {showHint ? (
                  <span className="text-[11px] text-[#D6A56C]">💡 {currentRoom.puzzle.hint}</span>
                ) : (
                  <button
                    onClick={() => { soundManager.playClick(); setShowHint(true); }}
                    className="text-[11px] text-[#D6A56C] underline hover:text-[#FFE4B5]"
                  >
                    Reveal Hint
                  </button>
                )}
              </div>

              <p className="text-sm font-serif italic text-[#FFE4B5] mb-4 leading-relaxed">
                "{currentRoom.puzzle.question}"
              </p>

              {feedback && (
                <div className={`p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-green-950/70 border border-green-500 text-green-300'
                    : 'bg-red-950/70 border border-red-500 text-red-300'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <Lock size={16} />}
                  <span>{feedback.message}</span>
                </div>
              )}

              {solvedPuzzles.includes(currentRoom.id) ? (
                <div className="p-3 rounded-lg bg-green-950/40 border border-green-600/60 text-green-300 text-xs font-bold flex items-center justify-between">
                  <span>✓ Room Mechanism Unlocked!</span>
                  {currentRoomIndex < rooms.length - 1 && !rooms[currentRoomIndex + 1].locked && (
                    <button
                      onClick={() => {
                        soundManager.playDoorCreak();
                        const nextIdx = currentRoomIndex + 1;
                        setCurrentRoomIndex(nextIdx);
                        setPuzzleAnswer('');
                        setFeedback(null);
                        setShowHint(false);
                        persistMansionState(rooms, inventory, solvedPuzzles, nextIdx, score);
                      }}
                      className="underline hover:text-white"
                    >
                      Enter Next Chamber →
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSolveRoomPuzzle} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter puzzle solution..."
                    value={puzzleAnswer}
                    onChange={(e) => setPuzzleAnswer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#170E20] border border-[#374151] text-[#F4E4CC] focus:outline-none focus:border-[#D6A56C] text-sm"
                  />
                  <button
                    type="submit"
                    className="btn-horror-gold w-full py-2.5 text-xs font-bold uppercase tracking-wider"
                  >
                    DISENGAGE TUMBLERS
                  </button>
                </form>
              )}

            </div>

          </div>

          {/* Victory Overlay */}
          {gameWon && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#30213E] to-[#111827] border-2 border-[#FFE4B5] shadow-2xl animate-fadeIn text-center space-y-4">
              <div className="text-5xl">👑</div>
              <h3 className="font-['Cinzel'] font-black text-3xl text-[#FFE4B5]">
                SANCTUARY OF RAVENSCROFT LIBERATED
              </h3>
              <p className="text-sm text-[#F4E4CC] max-w-lg mx-auto leading-relaxed">
                You uttered the secret word and shattered the tether holding the spirits of Ravenscroft Manor. The red balloon burst into golden sparks, restoring peace to the ancestral estate.
              </p>
              <div className="p-3 rounded-xl bg-[#0F0A17] inline-block text-xs font-bold text-[#D6A56C]">
                Total Score: <span className="text-[#FFE4B5] text-base">{score + 300} PTS</span> (+350 XP)
              </div>
              <div className="pt-2">
                <button
                  onClick={() => { soundManager.playClick(); onBack(); }}
                  className="btn-horror px-8 py-3 text-xs"
                >
                  RETURN TO CARNIVAL HUB
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
