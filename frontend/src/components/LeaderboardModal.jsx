import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Flame, Calendar } from 'lucide-react';
import soundManager from '../services/soundManager';
import dbService from '../services/db';

export default function LeaderboardModal({ onClose }) {
  const [scores, setScores] = useState([]);
  const [filterGame, setFilterGame] = useState('all');

  useEffect(() => {
    async function loadScores() {
      const list = await dbService.getLeaderboard(filterGame === 'all' ? null : filterGame);
      // If empty, supply default immersive local records
      if (list.length === 0) {
        setScores([
          { id: 1, playerName: 'DerryWatcher', avatar: '🎈', score: 1450, gameTitle: 'The Red Balloon', date: 'Local Device' },
          { id: 2, playerName: 'CryptKeeper', avatar: '💀', score: 1220, gameTitle: 'The Lost Key', date: 'Local Device' },
          { id: 3, playerName: 'MidwayRider', avatar: '🎪', score: 980, gameTitle: 'The Lost Carnival', date: 'Local Device' },
          { id: 4, playerName: 'ManorScout', avatar: '🏰', score: 850, gameTitle: 'Haunted Mansion', date: 'Local Device' },
          { id: 5, playerName: 'SpiritHost', avatar: '👻', score: 720, gameTitle: 'Ghost Party', date: 'Local Device' }
        ]);
      } else {
        setScores(list);
      }
    }
    loadScores();
  }, [filterGame]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl horror-card border border-[#D6A56C]/40 bg-[#111827] p-6 shadow-2xl rounded-2xl overflow-hidden">
        
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
            <Medal className="text-[#FFE4B5]" size={26} />
          </div>
          <div>
            <h2 className="font-['Cinzel'] font-bold text-2xl text-[#F4E4CC]">
              LOCAL HALL OF VALOR
            </h2>
            <p className="text-xs text-[#D6A56C]">
              Offline Device High Scores (1-4 Players Supported)
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 text-xs">
          {['all', 'red-balloon', 'haunted-mansion', 'lost-carnival', 'ghost-party', 'lost-key'].map((tab) => (
            <button
              key={tab}
              onClick={() => { soundManager.playClick(); setFilterGame(tab); }}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition-all ${
                filterGame === tab
                  ? 'bg-[#A51F2B] text-white shadow'
                  : 'bg-[#1F2937]/70 text-[#D6A56C] hover:bg-[#374151]'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Scores Table */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {scores.map((entry, index) => (
            <div
              key={entry.id || index}
              className="flex items-center justify-between p-3 rounded-xl bg-[#1F2937]/60 border border-[#374151] hover:border-[#A51F2B] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-bold text-sm ${
                  index === 0 ? 'text-[#FFD700]' : index === 1 ? 'text-[#C0C0C0]' : index === 2 ? 'text-[#CD7F32]' : 'text-gray-400'
                }`}>
                  #{index + 1}
                </span>
                <span className="text-xl">{entry.avatar || '🎈'}</span>
                <div>
                  <div className="text-xs font-bold text-[#F4E4CC]">
                    {entry.playerName || 'Player'}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {entry.gameTitle || 'Horror Challenge'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-[#FFE4B5]">
                  {entry.score} PTS
                </div>
                <div className="text-[10px] text-gray-400">
                  {entry.date ? (typeof entry.date === 'string' ? entry.date : new Date(entry.date).toLocaleDateString()) : 'Local Save'}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
