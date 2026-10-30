import dbService from './db';
import storage from './storage';
import soundManager from './soundManager';
import { ALL_ACHIEVEMENTS } from '../components/AchievementsModal';

class AchievementManager {
  constructor() {
    this.listeners = new Set();
    this.unlockedCache = new Set();
    this.init();
  }

  async init() {
    const list = await dbService.getAchievements();
    list.forEach(a => this.unlockedCache.add(a.id));
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(achievement) {
    this.listeners.forEach(cb => {
      try { cb(achievement); } catch (e) {}
    });
  }

  async unlock(achievementId) {
    if (this.unlockedCache.has(achievementId)) return false;

    const achDef = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achDef) return false;

    this.unlockedCache.add(achievementId);
    await dbService.unlockAchievement(achDef);
    
    // Add XP & award
    storage.addXP(achDef.xp || 50, 0);

    // Audio cue
    soundManager.playSuccessChime();

    // Broadcast toast notification
    this.notify(achDef);

    return true;
  }

  isUnlocked(achievementId) {
    return this.unlockedCache.has(achievementId);
  }
}

export const achievementManager = new AchievementManager();
export default achievementManager;
