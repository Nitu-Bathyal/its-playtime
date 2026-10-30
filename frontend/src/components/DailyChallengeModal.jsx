import React, { useState } from 'react';
import { X, Calendar, Sparkles, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import soundManager from '../services/soundManager';
import storage from '../services/storage';
import { OFFLINE_RIDDLES } from '../services/offlineBanks';

export default function DailyChallengeModal({ onAddReward, onClose }) {
  // Deterministic daily challenge based on day of month
  const today = new Date();
  const dayIndex = (today.getDate() + today.getMonth() * 31) % OFFLINE_RIDDLES.length;
  const challengeRiddle = OFFLINE_RIDDLES[dayIndex];

  const [inputAnswer, setInputAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputAnswer.trim() || isCompleted) return;

    soundManager.playClick();
    const cleanUser = inputAnswer.trim().toLowerCase().replace(/[^\w\s]/g, '');
    const acceptable = [
      challengeRiddle.answer.toLowerCase().replace(/[^\w\s]/g, ''),
      ...(challengeRiddle.acceptableAnswers || []).map(a => a.toLowerCase().replace(/[^\w\s]/g, ''))
    ];

    const correct = acceptable.some(c => cleanUser === c || (c.length > 3 && cleanUser.includes(c)));

    if (correct) {
      soundManager.playSuccessChime();
      setIsCompleted(true);
      setFeedback({
        type: 'success',
        message: 'The curse lifts! You solved today\'s mystery. +250 XP & +150 Points awarded!'
      });
      if (onAddReward) {
        onAddReward(250, 150);
      }
    } else {
      soundManager.playBalloonSqueak();
      setFeedback({
        type: 'error',
        message: 'The shadows whisper in mockery... That is incorrect. Try again!'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg horror-card border border-[#D6A56C]/40 bg-[#111827] p-6 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => { soundManager.playClick(); onClose(); }}
          className="absolute top-4 right-4 text-[#F4E4CC]/70 hover:text-white p-1 rounded-lg hover:bg-[#374151] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#4B1018] border border-[#A51F2B] flex items-center justify-center text-2xl shadow-inner">
            <Calendar className="text-[#FFE4B5]" size={26} />
          </div>
          <div>
            <h2 className="font-['Cinzel'] font-bold text-2xl text-[#F4E4CC]">
              DAILY HORROR TRIAL
            </h2>
            <p className="text-xs text-[#D6A56C]">
              {today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Riddle Card */}
        <div className="p-4 rounded-xl bg-[#1E293B]/70 border border-[#374151] mb-6">
          <div className="text-[11px] font-bold text-[#A51F2B] uppercase tracking-wider mb-2">
            Riddle of the Day:
          </div>
          <p className="text-sm font-serif italic text-[#FFE4B5] leading-relaxed mb-4">
            "{challengeRiddle.question}"
          </p>

          {showHint && (
            <div className="text-xs bg-[#111827] p-3 rounded border border-[#D6A56C]/30 text-[#D6A56C] mb-2 animate-fadeIn">
              💡 <strong>Clue:</strong> {challengeRiddle.hint}
            </div>
          )}

          {!showHint && (
            <button
              onClick={() => { soundManager.playClick(); setShowHint(true); }}
              className="text-xs text-[#D6A56C] hover:text-[#FFE4B5] flex items-center gap-1 underline"
            >
              <HelpCircle size={14} /> Reveal Clue
            </button>
          )}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-3 rounded-lg mb-4 text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-green-950/60 border border-green-500 text-green-300'
              : 'bg-red-950/60 border border-red-500 text-red-300'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Speak your answer..."
              disabled={isCompleted}
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#111827] border border-[#4B1018] text-[#F4E4CC] focus:outline-none focus:border-[#A51F2B]"
            />
          </div>

          <button
            type="submit"
            disabled={isCompleted || !inputAnswer.trim()}
            className="btn-horror w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>{isCompleted ? 'CHALLENGE CLEARED' : 'SUBMIT ANSWER'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
