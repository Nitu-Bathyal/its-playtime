import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import GameGrid from './components/GameGrid';
import BalloonCanvas from './components/BalloonCanvas';
import Footer from './components/Footer';
import AchievementToast from './components/AchievementToast';

// Modals
import PlayerModal from './components/PlayerModal';
import AiStatusModal from './components/AiStatusModal';
import AchievementsModal from './components/AchievementsModal';
import LeaderboardModal from './components/LeaderboardModal';
import DailyChallengeModal from './components/DailyChallengeModal';

// Games
import RedBalloonGame from './games/RedBalloon/Index';
import HauntedMansionGame from './games/HauntedMansion/Index';
import LostCarnivalGame from './games/LostCarnival/Index';
import GhostPartyGame from './games/GhostParty/Index';
import DayOfTheDeadGame from './games/DayOfTheDead/Index';
import GhostStoryTellerGame from './games/GhostStoryTeller/Index';
import LostKeyGame from './games/LostKey/Index';

// Services
import storage from './services/storage';
import aiService from './services/aiService';
import soundManager from './services/soundManager';
import dbService from './services/db';
import achievementManager from './services/achievementManager';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [playerProfile, setPlayerProfile] = useState(() => storage.getPlayerProfile());
  const [aiStatus, setAiStatus] = useState(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState(['first_blood']);
  const [poppedCount, setPoppedCount] = useState(0);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  // Modals
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showDailyChallengeModal, setShowDailyChallengeModal] = useState(false);

  // Check Local AI / Ollama Status on mount
  useEffect(() => {
    async function checkAi() {
      const status = await aiService.checkStatus();
      setAiStatus(status);
    }
    checkAi();

    // Load achievements
    async function loadAchievements() {
      const achs = await dbService.getAchievements();
      if (achs && achs.length > 0) {
        setUnlockedAchievements(achs.map(a => a.id));
      }
    }
    loadAchievements();

    // Expose helpers for automated demo navigation
    window.__setGame = (gameId) => setCurrentView(gameId);
    window.__openModal = (modalName) => {
      if (modalName === 'ai') setShowAiModal(true);
      if (modalName === 'achievements') setShowAchievementsModal(true);
      if (modalName === 'player') setShowPlayerModal(true);
      if (modalName === 'leaderboard') setShowLeaderboardModal(true);
    };
    window.__closeModals = () => {
      setShowAiModal(false);
      setShowAchievementsModal(false);
      setShowPlayerModal(false);
      setShowLeaderboardModal(false);
    };

    // Listen for PWA beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Subscribe to live achievement updates
    const unsub = achievementManager.subscribe((newAch) => {
      setUnlockedAchievements(prev => [...new Set([...prev, newAch.id])]);
      setPlayerProfile(storage.getPlayerProfile());
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      unsub();
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  };

  const handlePopBalloon = () => {
    const updated = storage.addXP(15, 10);
    setPlayerProfile(updated);
    const newCount = poppedCount + 1;
    setPoppedCount(newCount);
    if (newCount >= 5) {
      achievementManager.unlock('balloon_popper');
    }
  };

  const handleAddReward = (xp, points) => {
    const updated = storage.addXP(xp, points);
    setPlayerProfile(updated);
    achievementManager.unlock('night_owl');
  };

  const handleSelectGame = (gameId) => {
    setCurrentView(gameId);
    const p = storage.getPlayerProfile();
    p.gamesPlayed = (p.gamesPlayed || 0) + 1;
    storage.setPlayerProfile(p);
    setPlayerProfile(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setPlayerProfile(storage.getPlayerProfile());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToGames = () => {
    const el = document.getElementById('games-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-[#F4E4CC] relative selection:bg-[#A51F2B] selection:text-white">
      
      {/* Fog Atmospheric Overlay */}
      <div className="fog-overlay" />

      {/* Floating Interactive Balloons on Main Screen */}
      {currentView === 'home' && (
        <BalloonCanvas onPopBalloon={handlePopBalloon} />
      )}

      {/* Real-Time Horror Achievement Toast Notification */}
      <AchievementToast />

      {/* Navigation Header */}
      <Navbar
        playerProfile={playerProfile}
        aiStatus={aiStatus}
        canInstall={canInstall}
        onInstallPwa={handleInstallPwa}
        onOpenProfile={() => setShowPlayerModal(true)}
        onOpenAiModal={() => setShowAiModal(true)}
        onOpenAchievements={() => setShowAchievementsModal(true)}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenDailyChallenge={() => setShowDailyChallengeModal(true)}
        onNavigateHome={handleBackToHome}
      />

      {/* MAIN VIEW ROUTING */}
      <main className="relative z-20">
        {currentView === 'home' && (
          <>
            <Hero
              onPlaySignatureGame={() => handleSelectGame('red-balloon')}
              onScrollToGames={handleScrollToGames}
              onOpenAiModal={() => setShowAiModal(true)}
            />
            <GameGrid onSelectGame={handleSelectGame} />
          </>
        )}

        {/* 7 PLAYABLE GAMES */}
        {currentView === 'red-balloon' && (
          <RedBalloonGame onBack={handleBackToHome} />
        )}

        {currentView === 'haunted-mansion' && (
          <HauntedMansionGame onBack={handleBackToHome} />
        )}

        {currentView === 'lost-carnival' && (
          <LostCarnivalGame onBack={handleBackToHome} />
        )}

        {currentView === 'ghost-party' && (
          <GhostPartyGame onBack={handleBackToHome} />
        )}

        {currentView === 'day-of-the-dead' && (
          <DayOfTheDeadGame onBack={handleBackToHome} />
        )}

        {currentView === 'ghost-story-teller' && (
          <GhostStoryTellerGame onBack={handleBackToHome} />
        )}

        {currentView === 'lost-key' && (
          <LostKeyGame onBack={handleBackToHome} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onOpenAiModal={() => setShowAiModal(true)} />

      {/* MODALS */}
      {showPlayerModal && (
        <PlayerModal
          profile={playerProfile}
          onUpdateProfile={(updated) => setPlayerProfile(updated)}
          onClose={() => setShowPlayerModal(false)}
        />
      )}

      {showAiModal && (
        <AiStatusModal
          aiStatus={aiStatus}
          onRefreshStatus={(st) => setAiStatus(st)}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {showAchievementsModal && (
        <AchievementsModal
          unlockedIds={unlockedAchievements}
          onClose={() => setShowAchievementsModal(false)}
        />
      )}

      {showLeaderboardModal && (
        <LeaderboardModal onClose={() => setShowLeaderboardModal(false)} />
      )}

      {showDailyChallengeModal && (
        <DailyChallengeModal
          onAddReward={handleAddReward}
          onClose={() => setShowDailyChallengeModal(false)}
        />
      )}

    </div>
  );
}
