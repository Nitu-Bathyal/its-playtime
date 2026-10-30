// LocalStorage helper for immediate synchronous state and fallback
const STORAGE_PREFIX = 'its_playtime_';

export const storage = {
  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(STORAGE_PREFIX + key);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      console.warn('Storage get error:', e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (e) {}
  },

  // Player Profile default
  getPlayerProfile() {
    return this.get('profile', {
      nickname: 'Nightstalker',
      avatar: 'clown',
      xp: 0,
      level: 1,
      totalScore: 0,
      completedLevels: 0,
      gamesPlayed: 0
    });
  },

  setPlayerProfile(profile) {
    this.set('profile', profile);
  },

  addXP(amount, points = 0) {
    const profile = this.getPlayerProfile();
    profile.xp = (profile.xp || 0) + amount;
    profile.totalScore = (profile.totalScore || 0) + points;
    // Level formula: Level = floor(sqrt(XP / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(profile.xp / 100)) + 1;
    profile.level = Math.max(1, newLevel);
    this.setPlayerProfile(profile);
    return profile;
  }
};

export default storage;
