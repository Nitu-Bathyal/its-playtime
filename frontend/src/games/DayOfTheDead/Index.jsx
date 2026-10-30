import React, { useState, useEffect } from 'react';
import { 
  Heart, Sparkles, Flame, CheckCircle2, 
  Save, Plus, Trash2, BookOpen, Share2 
} from 'lucide-react';
import GameHeader from '../../components/GameHeader';
import soundManager from '../../services/soundManager';
import dbService from '../../services/db';
import storage from '../../services/storage';
import achievementManager from '../../services/achievementManager';

const OFFERINGS = [
  { id: 'marigold', name: 'Cempasúchil Marigolds', emoji: '🌼', desc: 'Vibrant orange petals guiding souls home with warmth and fragrance.' },
  { id: 'candle', name: 'Veladora (Virtual Candle)', emoji: '🕯️', desc: 'A beacon of hope and remembrance illuminating the path.' },
  { id: 'calavera', name: 'Sugar Skull (Calavera)', emoji: '💀', desc: 'Sweet, colorful remembrance celebrating the joy of departed lives.' },
  { id: 'bread', name: 'Pan de Muerto', emoji: '🍞', desc: 'Traditional sweet bread of the dead offering nourishment to weary spirits.' },
  { id: 'copal', name: 'Copal Incense', emoji: '✨', desc: 'Sacred resin smoke carrying prayers and love to the heavens.' },
  { id: 'water', name: 'Pure Water', emoji: '💧', desc: 'Quenches the thirst of souls after their long journey.' }
];

export default function DayOfTheDeadGame({ onBack }) {
  const [altarItems, setAltarItems] = useState([
    { id: 1, type: 'marigold', emoji: '🌼', name: 'Cempasúchil', tier: 1 },
    { id: 2, type: 'candle', emoji: '🕯️', name: 'Veladora', tier: 1 },
    { id: 3, type: 'calavera', emoji: '💀', name: 'Sugar Skull', tier: 2 },
    { id: 4, type: 'candle', emoji: '🕯️', name: 'Veladora', tier: 2 }
  ]);

  const [tributeName, setTributeName] = useState('');
  const [tributeMessage, setTributeMessage] = useState('');
  const [tributes, setTributes] = useState([]);
  const [generatedPoem, setGeneratedPoem] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    achievementManager.unlock('first_blood');
    async function loadOfrenda() {
      const saved = await dbService.getOfrendas();
      if (saved && saved.length > 0) {
        const latest = saved[saved.length - 1];
        if (latest.items) setAltarItems(latest.items);
        if (latest.tributes) setTributes(latest.tributes);
        if (latest.poem) setGeneratedPoem(latest.poem);
      }
    }
    loadOfrenda();
  }, []);

  const handleAddOffering = (offering, tier = 1) => {
    soundManager.playClick();
    const newItem = {
      id: Date.now() + Math.random(),
      type: offering.id,
      emoji: offering.emoji,
      name: offering.name,
      tier
    };
    setAltarItems([...altarItems, newItem]);
  };

  const handleRemoveOffering = (id) => {
    soundManager.playClick();
    setAltarItems(altarItems.filter(i => i.id !== id));
  };

  const handleAddTribute = (e) => {
    e.preventDefault();
    if (!tributeName.trim()) return;

    soundManager.playClick();
    const newTribute = {
      id: Date.now(),
      name: tributeName.trim(),
      message: tributeMessage.trim() || 'Forever held in our hearts and cherished in memory.',
      date: new Date().toLocaleDateString()
    };

    setTributes([...tributes, newTribute]);
    setTributeName('');
    setTributeMessage('');
  };

  const handleGeneratePoem = () => {
    soundManager.playSuccessChime();
    const names = tributes.map(t => t.name).join(', ') || 'our beloved ancestors';
    const poems = [
      `A golden bridge of cempasúchil blooms across the autumn night.\nThough shadows fall, your love remains our beacon and our light.\nWe place the bread, the sugar skull, the flame that gently gleams—\nTo welcome ${names} once more into our waking dreams.`,
      `The autumn wind begins to hum, the candles softly glow.\nWe whisper words of gratitude for those we used to know.\nNo tear of fright, but tears of peace, across this sacred space—\nIn every marigold we see the beauty of your face.`,
      `Listen closely in the quiet, beyond the veil of time,\nThe memories of love ring out like bells in gentle chime.\nFor love does not dissolve with breath; it lingers warm and deep,\nA sacred pact of memory our faithful hearts will keep.`
    ];
    setGeneratedPoem(poems[Math.floor(Math.random() * poems.length)]);
  };

  const handleSaveOfrenda = async () => {
    soundManager.playSuccessChime();
    const ofrendaData = {
      items: altarItems,
      tributes,
      poem: generatedPoem,
      timestamp: Date.now()
    };

    await dbService.saveOfrenda(ofrendaData);
    achievementManager.unlock('ancestral_honor');
    storage.addXP(200, 100);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetAltar = () => {
    soundManager.playBalloonPop();
    setAltarItems([
      { id: 1, type: 'marigold', emoji: '🌼', name: 'Cempasúchil', tier: 1 },
      { id: 2, type: 'candle', emoji: '🕯️', name: 'Veladora', tier: 1 }
    ]);
    setTributes([]);
    setGeneratedPoem(null);
  };

  return (
    <div className="min-h-screen bg-[#140803] text-[#FDF7E7] p-4 md:p-8 animate-fadeIn">
      
      {/* Universal Header with Pause, Resume, and Restart */}
      <div className="max-w-6xl mx-auto">
        <GameHeader
          gameTitle="DÍA DE LOS MUERTOS"
          gameSubtitle="A respectful celebration of remembrance and ancestral heritage"
          gameIcon="🌼"
          score={`${altarItems.length} Offerings`}
          scoreLabel="Altar"
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          onRestart={handleResetAltar}
          onBack={onBack}
          extraStatus={
            <button
              onClick={handleSaveOfrenda}
              className="btn-horror-gold px-3 py-1.5 text-xs flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>{isSaved ? 'SAVED!' : 'SAVE OFRENDA'}</span>
            </button>
          }
        />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Offerings Palette */}
        <div className="space-y-6">
          <div className="horror-card p-5 bg-[#250E04] border border-[#F59E0B]/30">
            <h3 className="font-['Cinzel'] font-bold text-sm text-[#FFE4B5] mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-[#F59E0B]" />
              ADD TRADITIONAL OFFERINGS
            </h3>

            <div className="space-y-2.5">
              {OFFERINGS.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-[#1C0A02] border border-[#3D1A08] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <div className="text-xs font-bold text-[#FDF7E7]">{item.name}</div>
                      <div className="text-[10px] text-[#D6A56C] leading-snug">{item.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddOffering(item, 1)}
                    className="p-1.5 rounded-lg bg-[#F59E0B]/20 text-[#FFE4B5] hover:bg-[#F59E0B] hover:text-[#140803] transition-colors"
                    title="Place on ofrenda"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Memorial Poem Generator */}
          <div className="horror-card p-5 bg-[#250E04] border border-[#F59E0B]/30">
            <h3 className="font-['Cinzel'] font-bold text-sm text-[#FFE4B5] mb-2 flex items-center gap-2">
              <BookOpen size={16} className="text-[#F59E0B]" />
              ANCESTRAL MEMORIAL POETRY
            </h3>
            <p className="text-xs text-gray-300 mb-4 font-serif">
              Compose a meaningful verse dedicated to your remembered family and loved ones.
            </p>

            {generatedPoem ? (
              <div className="p-4 rounded-xl bg-[#1C0A02] border border-[#F59E0B]/40 mb-3 text-xs font-serif italic text-[#FFE4B5] leading-relaxed whitespace-pre-line animate-fadeIn">
                "{generatedPoem}"
              </div>
            ) : null}

            <button
              onClick={handleGeneratePoem}
              className="btn-horror-gold w-full py-2.5 text-xs font-bold"
            >
              COMPOSE MEMORIAL VERSE
            </button>
          </div>
        </div>

        {/* Center: The Virtual Ofrenda 3-Tier Altar */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="horror-card p-6 sm:p-8 bg-gradient-to-b from-[#2B1006] via-[#1F0B03] to-[#120601] border-2 border-[#F59E0B]/50 rounded-2xl relative overflow-hidden shadow-2xl">
            
            {/* Background Festive Papel Picado SVG Bunting */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-around opacity-40 pointer-events-none">
              {['🏵️', '🌼', '💀', '🏵️', '🌼', '💀', '🏵️', '🌼'].map((icon, i) => (
                <span key={i} className="text-2xl">{icon}</span>
              ))}
            </div>

            <div className="text-center mb-6 pt-4">
              <h2 className="font-['Cinzel'] font-black text-2xl sm:text-3xl text-[#FFE4B5] tracking-wider mb-1">
                OFRENDA DE RECUERDO
              </h2>
              <p className="text-xs font-serif italic text-[#F59E0B]">
                "In remembering them, they live forever in our hearts."
              </p>
            </div>

            {/* 3-Tier Altar Representation */}
            <div className="space-y-4">
              
              {/* Tier 1 (Upper Level) */}
              <div className="p-4 rounded-xl bg-[#3D1A08]/70 border border-[#F59E0B]/40 min-h-[90px]">
                <div className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-widest text-center mb-2">
                  Top Tier: The Heavens &amp; Portraits
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {altarItems.filter(i => i.tier === 1).map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleRemoveOffering(item.id)}
                      className="group cursor-pointer relative p-2.5 rounded-xl bg-[#2A1206] border border-[#F59E0B]/30 hover:border-red-400 text-3xl flex flex-col items-center transition-transform hover:scale-110"
                      title="Click to remove from altar"
                    >
                      <span className={item.type === 'candle' ? 'candle-flicker filter drop-shadow-[0_0_8px_#FFA500]' : ''}>
                        {item.emoji}
                      </span>
                      <span className="text-[9px] text-[#FFE4B5] mt-1">{item.name.split(' ')[0]}</span>
                    </div>
                  ))}
                  {altarItems.filter(i => i.tier === 1).length === 0 && (
                    <span className="text-xs text-gray-400 italic">Empty tier. Add offerings from the left.</span>
                  )}
                </div>
              </div>

              {/* Tier 2 (Middle Level) */}
              <div className="p-4 rounded-xl bg-[#2E1306]/70 border border-[#F59E0B]/40 min-h-[90px]">
                <div className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-widest text-center mb-2">
                  Middle Tier: Offerings &amp; Nourishment
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {altarItems.filter(i => i.tier === 2).map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleRemoveOffering(item.id)}
                      className="group cursor-pointer relative p-2.5 rounded-xl bg-[#250E04] border border-[#F59E0B]/30 hover:border-red-400 text-3xl flex flex-col items-center transition-transform hover:scale-110"
                      title="Click to remove from altar"
                    >
                      <span className={item.type === 'candle' ? 'candle-flicker filter drop-shadow-[0_0_8px_#FFA500]' : ''}>
                        {item.emoji}
                      </span>
                      <span className="text-[9px] text-[#FFE4B5] mt-1">{item.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Memorial Message Cards Display */}
            <div className="mt-8 pt-6 border-t border-[#F59E0B]/30">
              <h4 className="font-['Cinzel'] font-bold text-xs uppercase tracking-wider text-[#F59E0B] mb-3 text-center">
                MEMORIAL DEDICATION CARDS ({tributes.length})
              </h4>

              {tributes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center italic">
                  No dedication cards written yet. Use the form below to honor someone special.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                  {tributes.map((trib) => (
                    <div key={trib.id} className="p-3 rounded-xl bg-[#1C0A02] border border-[#F59E0B]/40 text-xs font-serif">
                      <div className="font-bold text-[#FFE4B5] text-sm flex items-center gap-1.5 mb-1">
                        <Heart size={14} className="text-red-500 fill-current" />
                        <span>{trib.name}</span>
                      </div>
                      <p className="text-gray-300 italic mb-2">"{trib.message}"</p>
                      <span className="text-[10px] text-[#D6A56C]">{trib.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dedication Form */}
            <form onSubmit={handleAddTribute} className="mt-6 p-4 rounded-xl bg-[#1C0A02] border border-[#3D1A08] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                Write a Remembrance Letter:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Loved one's name or title..."
                  value={tributeName}
                  onChange={(e) => setTributeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#271005] border border-[#3D1A08] text-xs text-[#FDF7E7] focus:outline-none focus:border-[#F59E0B]"
                />
                <input
                  type="text"
                  placeholder="A cherished memory or blessing..."
                  value={tributeMessage}
                  onChange={(e) => setTributeMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#271005] border border-[#3D1A08] text-xs text-[#FDF7E7] focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
              <button
                type="submit"
                disabled={!tributeName.trim()}
                className="btn-horror-gold w-full py-2.5 text-xs uppercase tracking-wider disabled:opacity-40"
              >
                PLACE DEDICATION ON ALTAR
              </button>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
