import React, { useState, useEffect } from 'react';
import { 
  Users, Trophy, Sparkles, CheckCircle2, 
  HelpCircle, Shuffle, Award, AlertCircle 
} from 'lucide-react';
import GameHeader from '../../components/GameHeader';
import soundManager from '../../services/soundManager';
import dbService from '../../services/db';
import storage from '../../services/storage';
import achievementManager from '../../services/achievementManager';

const TRIVIA_QUESTIONS = [
  {
    question: "What folklore creature cannot enter your home unless explicitly invited across the threshold?",
    options: ["Werewolf", "Vampire", "Banshee", "Poltergeist"],
    correctIndex: 1
  },
  {
    question: "In Día de los Muertos traditions, which flower's vibrant orange petals guide souls back to the ofrenda?",
    options: ["Cempasúchil (Marigold)", "Black Rose", "Ghost Orchid", "Belladonna"],
    correctIndex: 0
  },
  {
    question: "What color balloon is famously associated with the sinister clown in the sewers?",
    options: ["Neon Green", "Midnight Black", "Crimson Red", "Spectral White"],
    correctIndex: 2
  },
  {
    question: "According to ancient superstition, what happens if you smash a mirror in a funhouse?",
    options: ["100 Gold Coins", "7 Years Bad Luck", "Free Cotton Candy", "The Mirror Laughs"],
    correctIndex: 1
  }
];

const BLUFF_CARDS = [
  {
    prompt: "A ghost is whispering behind you. Speak a spine-chilling truth or an eerie lie. Other players must vote: TRUTH or LIE!",
    category: "Deception Duel"
  },
  {
    prompt: "Imitate the menacing laugh of the clown. The room scores your performance 1-10!",
    category: "Creepy Performance"
  },
  {
    prompt: "Share your earliest scary childhood memory, or take a 50-point penalty!",
    category: "Dark Confession"
  }
];

export default function GhostPartyGame({ onBack }) {
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', avatar: '👻', score: 0 },
    { id: 2, name: 'Player 2', avatar: '🧛', score: 0 }
  ]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [round, setRound] = useState(1);
  const totalRounds = 4;
  const [activeMode, setActiveMode] = useState('trivia'); // trivia, bluff
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    achievementManager.unlock('first_blood');
  }, []);

  const handleSetCount = (count) => {
    soundManager.playClick();
    setPlayerCount(count);
    const avatars = ['👻', '🧛', '🎈', '💀'];
    const newPlayers = [];
    for (let i = 1; i <= count; i++) {
      newPlayers.push({
        id: i,
        name: `Player ${i}`,
        avatar: avatars[(i - 1) % avatars.length],
        score: 0
      });
    }
    setPlayers(newPlayers);
  };

  const handleStartGame = () => {
    soundManager.playDoorCreak();
    setGameStarted(true);
    setCurrentPlayerIdx(0);
    setRound(1);
    setQuestionIdx(0);
    setGameFinished(false);
    setIsPaused(false);
  };

  const handleAnswerTrivia = (optIndex) => {
    if (selectedOption !== null || isPaused) return;
    soundManager.playClick();
    setSelectedOption(optIndex);

    const isCorrect = optIndex === TRIVIA_QUESTIONS[questionIdx % TRIVIA_QUESTIONS.length].correctIndex;

    if (isCorrect) {
      soundManager.playSuccessChime();
      setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIdx ? { ...p, score: p.score + 100 } : p));
      setFeedback('Correct! +100 Spirit Points!');
    } else {
      soundManager.playBalloonSqueak();
      setFeedback('Incorrect! The spirits claim no points.');
    }

    setTimeout(() => {
      advanceTurn();
    }, 1500);
  };

  const handleScoreBluff = (earnedPoints) => {
    if (isPaused) return;
    soundManager.playClick();
    setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIdx ? { ...p, score: p.score + earnedPoints } : p));
    advanceTurn();
  };

  const advanceTurn = () => {
    setSelectedOption(null);
    setFeedback(null);

    const nextPlayer = (currentPlayerIdx + 1) % playerCount;
    setCurrentPlayerIdx(nextPlayer);

    if (nextPlayer === 0) {
      if (round >= totalRounds) {
        finishGame();
        return;
      }
      setRound(r => r + 1);
      setActiveMode(m => m === 'trivia' ? 'bluff' : 'trivia');
    }
    setQuestionIdx(q => q + 1);
  };

  const finishGame = () => {
    soundManager.playSuccessChime();
    setGameFinished(true);

    const winner = [...players].sort((a, b) => b.score - a.score)[0];
    achievementManager.unlock('party_spirit');
    storage.addXP(250, winner.score);
    dbService.saveGameState('ghost-party', { completed: true, winner });
    dbService.addScore({
      gameId: 'ghost-party',
      gameTitle: 'Ghost Party',
      playerName: winner.name,
      avatar: winner.avatar,
      score: winner.score
    });
  };

  const handleRestart = () => {
    soundManager.playBalloonPop();
    setGameStarted(false);
    setGameFinished(false);
    setCurrentPlayerIdx(0);
    setRound(1);
    setQuestionIdx(0);
    setSelectedOption(null);
    setFeedback(null);
    setIsPaused(false);
    setPlayers(players.map(p => ({ ...p, score: 0 })));
  };

  const currentPlayer = players[currentPlayerIdx];
  const currentTrivia = TRIVIA_QUESTIONS[questionIdx % TRIVIA_QUESTIONS.length];
  const currentBluff = BLUFF_CARDS[questionIdx % BLUFF_CARDS.length];

  return (
    <div className="min-h-screen bg-[#0B0D14] text-[#F4E4CC] p-4 md:p-8 animate-fadeIn">
      
      {/* Universal Header with Pause, Resume, and Restart */}
      <div className="max-w-5xl mx-auto">
        <GameHeader
          gameTitle="GHOST PARTY"
          gameSubtitle="Local Horror Party (1-4 Players on Same Device)"
          gameIcon="👻"
          score={gameStarted ? `Round ${round}/${totalRounds}` : undefined}
          scoreLabel="Match"
          isPaused={isPaused}
          onTogglePause={gameStarted && !gameFinished ? () => setIsPaused(!isPaused) : undefined}
          onRestart={gameStarted ? handleRestart : undefined}
          onBack={onBack}
        />
      </div>

      <div className="max-w-4xl mx-auto">
        
        {/* SETUP SCREEN */}
        {!gameStarted && !gameFinished && (
          <div className="horror-card p-8 bg-[#131A29] border border-[#D6A56C]/40 text-center max-w-xl mx-auto space-y-6">
            <div className="text-5xl">🎃</div>
            <h2 className="font-['Cinzel'] font-bold text-3xl text-[#F4E4CC]">
              PARTY PASS &amp; PLAY
            </h2>
            <p className="text-xs text-[#D6A56C]">
              Play with friends on this device or test your own knowledge solo. No internet required!
            </p>

            {/* Select Player Count */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-3">
                Select Number of Local Players:
              </label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => handleSetCount(count)}
                    className={`w-14 h-14 rounded-2xl text-lg font-bold border flex items-center justify-center transition-all ${
                      playerCount === count
                        ? 'bg-[#A51F2B] border-[#FFE4B5] text-white scale-110 shadow-lg'
                        : 'bg-[#1E293B] border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {count} {count === 1 ? '👤' : '👥'}
                  </button>
                ))}
              </div>
            </div>

            {/* Customize Names */}
            <div className="space-y-2 text-left max-w-xs mx-auto">
              {players.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-xl">{p.avatar}</span>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPlayers(prev => prev.map((pl, i) => i === idx ? { ...pl, name: val } : pl));
                    }}
                    className="flex-1 px-3 py-1.5 rounded bg-[#0F172A] border border-gray-700 text-xs text-[#F4E4CC] focus:outline-none focus:border-[#A51F2B]"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleStartGame}
              className="btn-horror w-full py-3.5 text-sm uppercase tracking-wider"
            >
              START GHOST PARTY!
            </button>
          </div>
        )}

        {/* ACTIVE GAMEPLAY */}
        {gameStarted && !gameFinished && (
          <div className="space-y-6">
            
            {/* Live Scoreboard Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {players.map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    idx === currentPlayerIdx
                      ? 'bg-[#30213E] border-[#FFE4B5] shadow-lg scale-105 ring-1 ring-[#FFE4B5]'
                      : 'bg-[#1E293B]/70 border-[#374151] opacity-75'
                  }`}
                >
                  <div className="text-xl mb-1">{p.avatar}</div>
                  <div className="text-xs font-bold text-[#F4E4CC] truncate">{p.name}</div>
                  <div className="text-sm font-black text-[#FFE4B5]">{p.score} PTS</div>
                  {idx === currentPlayerIdx && (
                    <div className="text-[10px] uppercase font-bold text-green-400 mt-1">
                      Active Turn
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Active Turn Card */}
            <div className="horror-card p-6 sm:p-8 bg-[#131A29] border border-[#D6A56C]/40 text-center space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E293B] border border-[#D6A56C]/40 text-xs font-bold text-[#FFE4B5]">
                <span>{currentPlayer.avatar}</span>
                <span>{currentPlayer.name}'s Challenge!</span>
              </div>

              {/* TRIVIA MODE */}
              {activeMode === 'trivia' && (
                <div className="space-y-6">
                  <h3 className="font-['Cinzel'] font-bold text-xl sm:text-2xl text-[#F4E4CC]">
                    "{currentTrivia.question}"
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                    {currentTrivia.options.map((opt, i) => {
                      const isChosen = selectedOption === i;
                      const isCorrect = i === currentTrivia.correctIndex;
                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswerTrivia(i)}
                          disabled={selectedOption !== null}
                          className={`p-4 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                            selectedOption === null
                              ? 'bg-[#1E293B] border-gray-700 hover:border-[#D6A56C] hover:bg-[#283548]'
                              : isCorrect
                              ? 'bg-green-950 border-green-500 text-green-200'
                              : isChosen
                              ? 'bg-red-950 border-red-500 text-red-200'
                              : 'bg-gray-900 border-gray-800 opacity-40'
                          }`}
                        >
                          <span>{opt}</span>
                          {selectedOption !== null && isCorrect && <CheckCircle2 size={16} className="text-green-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {feedback && (
                    <div className="text-xs font-bold text-[#FFE4B5] animate-fadeIn">
                      {feedback}
                    </div>
                  )}
                </div>
              )}

              {/* BLUFFING / DECEPTION MODE */}
              {activeMode === 'bluff' && (
                <div className="space-y-6">
                  <div className="text-xs font-bold text-[#A51F2B] uppercase tracking-wider">
                    {currentBluff.category}
                  </div>
                  <h3 className="font-serif italic text-lg sm:text-xl text-[#FFE4B5] max-w-md mx-auto">
                    "{currentBluff.prompt}"
                  </h3>

                  <p className="text-xs text-gray-400">
                    Did the player succeed or fool the group? Award points:
                  </p>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleScoreBluff(100)}
                      className="btn-horror px-6 py-2.5 text-xs"
                    >
                      SUCCESS (+100 PTS)
                    </button>
                    <button
                      onClick={() => handleScoreBluff(50)}
                      className="btn-horror-outline px-6 py-2.5 text-xs"
                    >
                      PARTIAL (+50 PTS)
                    </button>
                    <button
                      onClick={() => handleScoreBluff(0)}
                      className="px-6 py-2.5 rounded-lg border border-red-800 text-red-400 text-xs hover:bg-red-950"
                    >
                      BUSTED (0 PTS)
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* GAME FINISHED SCREEN */}
        {gameFinished && (
          <div className="horror-card p-8 bg-[#131A29] border-2 border-[#FFE4B5] text-center max-w-lg mx-auto space-y-6 animate-fadeIn">
            <div className="text-6xl animate-bounce">👑</div>
            <h2 className="font-['Cinzel'] font-black text-3xl text-[#FFE4B5]">
              PARTY CORONATION
            </h2>

            {/* Ranked List */}
            <div className="space-y-2">
              {[...players].sort((a, b) => b.score - a.score).map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border ${
                    idx === 0
                      ? 'bg-[#30213E] border-[#FFE4B5] shadow-lg'
                      : 'bg-[#1E293B] border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-[#FFE4B5]">#{idx + 1}</span>
                    <span className="text-2xl">{p.avatar}</span>
                    <span className="text-xs font-bold text-[#F4E4CC]">{p.name}</span>
                  </div>
                  <div className="text-sm font-black text-[#FFE4B5]">
                    {p.score} PTS
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="btn-horror-gold px-6 py-3 text-xs"
              >
                PLAY ANOTHER PARTY
              </button>
              <button
                onClick={() => { soundManager.playClick(); onBack(); }}
                className="btn-horror-outline px-6 py-3 text-xs"
              >
                RETURN TO HUB
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
