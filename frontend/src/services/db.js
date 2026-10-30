// IndexedDB storage service for IT's Playtime
const DB_NAME = 'its_playtime_db';
const DB_VERSION = 1;

class DBService {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Game saves store
        if (!db.objectStoreNames.contains('game_saves')) {
          db.createObjectStore('game_saves', { keyPath: 'gameId' });
        }
        // Stories store
        if (!db.objectStoreNames.contains('stories')) {
          const storyStore = db.createObjectStore('stories', { keyPath: 'id', autoIncrement: true });
          storyStore.createIndex('createdAt', 'createdAt');
        }
        // Ofrendas store
        if (!db.objectStoreNames.contains('ofrendas')) {
          db.createObjectStore('ofrendas', { keyPath: 'id', autoIncrement: true });
        }
        // Achievements store
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' });
        }
        // Leaderboard store
        if (!db.objectStoreNames.contains('leaderboard')) {
          const lbStore = db.createObjectStore('leaderboard', { keyPath: 'id', autoIncrement: true });
          lbStore.createIndex('score', 'score');
          lbStore.createIndex('gameId', 'gameId');
        }
        // Player profiles
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getStore(storeName, mode = 'readonly') {
    await this.initPromise;
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  // --- Game Saves ---
  async saveGameState(gameId, data) {
    try {
      const store = await this.getStore('game_saves', 'readwrite');
      return new Promise((resolve, reject) => {
        const req = store.put({ gameId, ...data, updatedAt: Date.now() });
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('DB saveGameState error, falling back to localStorage:', e);
      localStorage.setItem(`save_${gameId}`, JSON.stringify(data));
      return true;
    }
  }

  async getGameState(gameId) {
    try {
      const store = await this.getStore('game_saves', 'readonly');
      return new Promise((resolve) => {
        const req = store.get(gameId);
        req.onsuccess = () => {
          if (req.result) resolve(req.result);
          else {
            const local = localStorage.getItem(`save_${gameId}`);
            resolve(local ? JSON.parse(local) : null);
          }
        };
        req.onerror = () => {
          const local = localStorage.getItem(`save_${gameId}`);
          resolve(local ? JSON.parse(local) : null);
        };
      });
    } catch (e) {
      const local = localStorage.getItem(`save_${gameId}`);
      return local ? JSON.parse(local) : null;
    }
  }

  // --- Achievements ---
  async unlockAchievement(achievement) {
    try {
      const store = await this.getStore('achievements', 'readwrite');
      return new Promise((resolve) => {
        const req = store.put({ ...achievement, unlockedAt: Date.now() });
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  async getAchievements() {
    try {
      const store = await this.getStore('achievements', 'readonly');
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  }

  // --- Stories ---
  async saveStory(story) {
    try {
      const store = await this.getStore('stories', 'readwrite');
      return new Promise((resolve) => {
        const req = store.add({ ...story, createdAt: Date.now() });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async getStories() {
    try {
      const store = await this.getStore('stories', 'readonly');
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  }

  // --- Día de los Muertos Ofrendas ---
  async saveOfrenda(ofrenda) {
    try {
      const store = await this.getStore('ofrendas', 'readwrite');
      return new Promise((resolve) => {
        const req = store.add({ ...ofrenda, createdAt: Date.now() });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async getOfrendas() {
    try {
      const store = await this.getStore('ofrendas', 'readonly');
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  }

  // --- Leaderboard ---
  async addScore(entry) {
    try {
      const store = await this.getStore('leaderboard', 'readwrite');
      return new Promise((resolve) => {
        const req = store.add({ ...entry, timestamp: Date.now() });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async getLeaderboard(gameId = null) {
    try {
      const store = await this.getStore('leaderboard', 'readonly');
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          let list = req.result || [];
          if (gameId) {
            list = list.filter(item => item.gameId === gameId);
          }
          list.sort((a, b) => b.score - a.score);
          resolve(list.slice(0, 50));
        };
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  }
}

export const dbService = new DBService();
export default dbService;
