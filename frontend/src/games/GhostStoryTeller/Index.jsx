import React, { useState, useEffect } from 'react';
import { 
  Sparkles, BookOpen, Compass, Save, RefreshCw, 
  CheckCircle2, AlertTriangle, Flame, Cpu, ShieldCheck, ChevronRight 
} from 'lucide-react';
import GameHeader from '../../components/GameHeader';
import soundManager from '../../services/soundManager';
import aiService from '../../services/aiService';
import dbService from '../../services/db';
import storage from '../../services/storage';
import achievementManager from '../../services/achievementManager';

const CATEGORIES = [
  'Psychological horror',
  'Haunted house',
  'Supernatural mystery',
  'Creepy carnival',
  'Ghost encounters',
  'Funny Halloween',
  'Mystery thriller'
];

const INTENSITIES = [
  { id: 'Eerie Whisper', color: '#60A5FA', desc: 'Subtle psychological chills and creeping unease' },
  { id: 'Chilling Dread', color: '#F59E0B', desc: 'Suspenseful paranormal encounters and dark secrets' },
  { id: 'Pure Nightmare', color: '#EF4444', desc: 'Heart-pounding terror, relentless clown chases, and dark lore' }
];

const PROTAGONISTS = [
  'The Curious Teen',
  'The Sceptical Detective',
  'The Lost Child',
  'The Town Historian',
  'The Carnie Caretaker'
];

export default function GhostStoryTellerGame({ onBack }) {
  const [prompt, setPrompt] = useState('A lone red balloon hovers inside an abandoned funhouse mirror.');
  const [category, setCategory] = useState('Creepy carnival');
  const [intensity, setIntensity] = useState('Chilling dread');
  const [protagonist, setProtagonist] = useState('The Curious Teen');
  const [length, setLength] = useState('Medium');

  const [isLoading, setIsLoading] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
  const [storyHistory, setStoryHistory] = useState([]);
  const [savedStories, setSavedStories] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('generator'); // generator, library
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    achievementManager.unlock('first_blood');
    async function loadSaved() {
      const list = await dbService.getStories();
      setSavedStories(list);
    }
    loadSaved();
  }, []);

  const handleGenerateStory = async () => {
    soundManager.playDoorCreak();
    setIsLoading(true);
    setIsSaved(false);

    const storyResult = await aiService.generateStory({
      prompt,
      category,
      intensity,
      protagonist,
      length
    });

    setIsLoading(false);
    setActiveStory(storyResult);
    setStoryHistory([storyResult]);
    storage.addXP(100, 50);
  };

  const handleTakeChoice = async (choice) => {
    soundManager.playClick();
    setIsLoading(true);

    const nextChapter = await aiService.continueStory(storyHistory, choice);
    setIsLoading(false);

    const updated = {
      ...nextChapter,
      paragraphs: [
        `Consequence: ${choice.outcome || choice.text}`,
        ...(nextChapter.paragraphs || [])
      ]
    };

    setActiveStory(updated);
    setStoryHistory(prev => [...prev, updated]);
    storage.addXP(80, 40);

    if (choice.isEnding || updated.choices?.some(c => c.isEnding)) {
      soundManager.playSuccessChime();
      achievementManager.unlock('story_weaver');
    }
  };

  const handleSaveStoryToJournal = async () => {
    if (!activeStory) return;
    soundManager.playSuccessChime();

    const fullNarrative = {
      title: activeStory.title || 'The Chronicles of Derrybrook',
      category,
      intensity,
      protagonist,
      history: storyHistory,
      source: activeStory.source || 'qwen-local-ai',
      timestamp: Date.now()
    };

    const id = await dbService.saveStory(fullNarrative);
    setSavedStories(prev => [{ ...fullNarrative, id }, ...prev]);
    setIsSaved(true);
    achievementManager.unlock('story_weaver');
    storage.addXP(150, 80);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleRestart = () => {
    soundManager.playBalloonPop();
    setActiveStory(null);
    setStoryHistory([]);
    setIsSaved(false);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0C0714] text-[#F4E4CC] p-4 md:p-8 animate-fadeIn">
      
      {/* Universal Header with Pause, Resume, and Restart */}
      <div className="max-w-5xl mx-auto">
        <GameHeader
          gameTitle="GHOST STORY TELLER"
          gameSubtitle="Qwen 2.5 3B Open-Source AI + Offline Narrative Engine"
          gameIcon="📖"
          score={`${storyHistory.length} Chapters`}
          scoreLabel="Progression"
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          onRestart={handleRestart}
          onBack={onBack}
          extraStatus={
            <div className="flex bg-[#1E112E] p-1 rounded-xl border border-[#30213E]">
              <button
                onClick={() => { soundManager.playClick(); setActiveTab('generator'); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'generator' ? 'bg-[#A855F7] text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Story Forge
              </button>
              <button
                onClick={() => { soundManager.playClick(); setActiveTab('library'); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'library' ? 'bg-[#A855F7] text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Saved Library ({savedStories.length})
              </button>
            </div>
          }
        />
      </div>

      <div className="max-w-5xl mx-auto">
        
        {/* STORY FORGE GENERATOR */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Parameters Sidebar */}
            <div className="horror-card p-6 bg-[#160D24] border border-[#A855F7]/30 space-y-4">
              <h3 className="font-['Cinzel'] font-bold text-sm text-[#F4E4CC] flex items-center gap-2">
                <Sparkles size={16} className="text-[#A855F7]" />
                STORY PARAMETERS
              </h3>

              {/* Seed / Prompt */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#D6A56C] mb-1.5">
                  Story Seed / Premise
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0617] border border-[#30213E] text-xs text-[#F4E4CC] focus:outline-none focus:border-[#A855F7]"
                  placeholder="e.g. A red balloon floats inside an abandoned hospital..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#D6A56C] mb-1.5">
                  Horror Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0617] border border-[#30213E] text-xs text-[#F4E4CC] focus:outline-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#D6A56C] mb-1.5">
                  Intensity Level
                </label>
                <div className="space-y-1.5">
                  {INTENSITIES.map(int => (
                    <button
                      key={int.id}
                      type="button"
                      onClick={() => setIntensity(int.id)}
                      className={`w-full p-2 rounded-lg text-left text-xs border transition-all ${
                        intensity === int.id
                          ? 'bg-[#30213E] border-[#FFE4B5] text-white shadow'
                          : 'bg-[#0E0617] border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5" style={{ color: int.color }}>
                        <Flame size={12} /> {int.id}
                      </div>
                      <div className="text-[10px] text-gray-400">{int.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Protagonist */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#D6A56C] mb-1.5">
                  Protagonist Archetype
                </label>
                <select
                  value={protagonist}
                  onChange={(e) => setProtagonist(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0E0617] border border-[#30213E] text-xs text-[#F4E4CC] focus:outline-none"
                >
                  {PROTAGONISTS.map(pro => <option key={pro} value={pro}>{pro}</option>)}
                </select>
              </div>

              {/* Generate CTA Button */}
              <button
                onClick={handleGenerateStory}
                disabled={isLoading}
                className="btn-horror w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>{isLoading ? 'CONJURING STORY...' : 'CONJURE NEW STORY'}</span>
              </button>
            </div>

            {/* Right Story Reader & Interactive Decision Branching */}
            <div className="lg:col-span-2 space-y-6">
              
              {!activeStory && !isLoading && (
                <div className="horror-card p-12 bg-[#160D24] border border-[#A855F7]/30 text-center space-y-4">
                  <div className="text-5xl">📖</div>
                  <h3 className="font-['Cinzel'] font-bold text-2xl text-[#F4E4CC]">
                    THE CARNIVAL GRIMOIRE AWAITS
                  </h3>
                  <p className="text-xs text-[#D6A56C] max-w-md mx-auto leading-relaxed">
                    Set your genre, protagonist, and intensity on the left, then click <strong>"CONJURE NEW STORY"</strong> to start an interactive horror journey.
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="horror-card p-12 bg-[#160D24] border border-[#A855F7]/40 text-center space-y-4 animate-pulse">
                  <div className="text-4xl animate-bounce">🎈</div>
                  <h3 className="font-['Cinzel'] font-bold text-xl text-[#FFE4B5]">
                    THE SHADOWS ARE WEAVING YOUR TALE...
                  </h3>
                  <p className="text-xs text-gray-400">
                    Consulting local neural weights &amp; ancestral horror archives.
                  </p>
                </div>
              )}

              {activeStory && !isLoading && (
                <div className="horror-card p-6 sm:p-8 bg-[#160D24] border border-[#A855F7]/40 space-y-6 animate-fadeIn">
                  
                  {/* Story Meta Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#30213E]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#30213E] text-[#A855F7] mr-2">
                        {category}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        Protagonist: {protagonist}
                      </span>
                      <h2 className="font-['Cinzel'] font-black text-2xl sm:text-3xl text-[#FFE4B5] mt-1">
                        {activeStory.title || 'A Whispering in the Fog'}
                      </h2>
                    </div>

                    <button
                      onClick={handleSaveStoryToJournal}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#30213E] border border-[#D6A56C]/40 hover:border-[#FFE4B5] text-xs font-bold text-[#FFE4B5] transition-colors"
                    >
                      <Save size={14} />
                      <span>{isSaved ? 'SAVED TO JOURNAL!' : 'SAVE TALE'}</span>
                    </button>
                  </div>

                  {/* Multi-Paragraph Story Prose */}
                  <div className="space-y-4 text-sm sm:text-base font-serif leading-relaxed text-[#F4E4CC]/90">
                    {(activeStory.paragraphs || []).map((p, idx) => (
                      <p key={idx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-[#FFE4B5]">
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* Interactive Branching Choices */}
                  {activeStory.choices && activeStory.choices.length > 0 && (
                    <div className="pt-6 border-t border-[#30213E] space-y-3">
                      <h4 className="font-['Cinzel'] font-bold text-xs uppercase tracking-wider text-[#A855F7] flex items-center gap-1.5">
                        <ChevronRight size={14} /> WHAT DO YOU DO NEXT?
                      </h4>

                      <div className="space-y-2">
                        {activeStory.choices.map((choice, i) => (
                          <button
                            key={choice.id || i}
                            onClick={() => handleTakeChoice(choice)}
                            className="w-full p-4 rounded-xl text-left bg-[#0E0617] border border-[#30213E] hover:border-[#FFE4B5] hover:bg-[#201133] transition-all flex items-center justify-between group"
                          >
                            <span className="text-xs sm:text-sm font-semibold text-[#F4E4CC] group-hover:text-white">
                              {choice.text}
                            </span>
                            <span className="text-xs text-[#D6A56C] group-hover:translate-x-1 transition-transform">
                              Take Path →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regeneration button */}
                  <div className="pt-4 flex justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Cpu size={12} /> Source: {activeStory.source === 'qwen-local-ai' ? 'Qwen 2.5 3B (Local Ollama)' : 'Curated Offline Engine'}
                    </span>
                    <button
                      onClick={handleGenerateStory}
                      className="underline hover:text-white"
                    >
                      Regenerate Variant ↺
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* SAVED LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className="horror-card p-6 bg-[#160D24] border border-[#A855F7]/30 space-y-6">
            <h3 className="font-['Cinzel'] font-bold text-xl text-[#F4E4CC] mb-4">
              YOUR SAVED HORROR CHRONICLES ({savedStories.length})
            </h3>

            {savedStories.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No saved tales yet. Forge a story and click "SAVE TALE".</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedStories.map((s, idx) => (
                  <div key={s.id || idx} className="p-4 rounded-xl bg-[#0E0617] border border-[#30213E] space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-[#FFE4B5]">{s.title}</h4>
                      <span className="text-[10px] text-gray-400">{new Date(s.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[10px] text-[#A855F7] font-semibold">{s.category} • {s.intensity}</div>
                    <p className="text-xs text-gray-300 font-serif line-clamp-3">
                      {s.history?.[0]?.paragraphs?.[0] || 'A tale of darkness and courage...'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
