import { OFFLINE_RIDDLES, OFFLINE_PUZZLES, OFFLINE_STORIES } from './offlineBanks';

class AIServiceClient {
  constructor() {
    let customBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
    if (customBase) {
      this.apiBase = customBase.endsWith('/api') ? customBase : `${customBase}/api`;
    } else {
      this.apiBase = '/api';
    }
    this.isBackendAvailable = false;
    this.isOllamaAvailable = false;
    this.modelName = 'qwen2.5:3b';
  }

  async checkStatus() {
    try {
      const res = await fetch(`${this.apiBase}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        const data = await res.json();
        this.isBackendAvailable = true;
        this.isOllamaAvailable = data.ollama?.connected && data.ollama?.model_available;
        this.modelName = data.ollama?.target_model || 'qwen2.5:3b';
        return {
          backendConnected: true,
          ollamaConnected: !!data.ollama?.connected,
          modelAvailable: !!data.ollama?.model_available,
          installedModels: data.ollama?.installed_models || [],
          targetModel: this.modelName
        };
      }
    } catch (e) {
      // Backend not running or offline
    }

    this.isBackendAvailable = false;
    this.isOllamaAvailable = false;
    return {
      backendConnected: false,
      ollamaConnected: false,
      modelAvailable: false,
      installedModels: [],
      targetModel: this.modelName
    };
  }

  async generateStory(params) {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${this.apiBase}/ai/story/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          signal: AbortSignal.timeout(15000)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend story generation failed, using offline fallback:', e);
      }
    }

    // Client-side offline fallback
    const { category, intensity, prompt } = params;
    const pool = OFFLINE_STORIES;
    const matching = pool.filter(s => category && s.category.toLowerCase().includes(category.toLowerCase()));
    const base = matching.length > 0 ? matching[0] : pool[Math.floor(Math.random() * pool.length)];

    const copy = JSON.parse(JSON.stringify(base));
    if (prompt) {
      copy.paragraphs[0] = `Reflecting upon your vision: "${prompt}"... ` + copy.paragraphs[0];
    }
    copy.source = 'curated-offline-engine';
    copy.model = 'offline-fallback';
    return copy;
  }

  async continueStory(history, chosenOption) {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${this.apiBase}/ai/story/continue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history, chosenOption }),
          signal: AbortSignal.timeout(15000)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend story continue failed, using offline fallback:', e);
      }
    }

    // Client-side offline fallback
    return {
      title: "The Final Threshold",
      paragraphs: [
        `You opted to: ${chosenOption?.text || 'step into the dark'}.`,
        chosenOption?.outcome || "The shadows bend and a red balloon floats upward into the stormy sky.",
        "The whispers subside. In the brick floor ahead, an iron manhole cover sits unlocked.",
        "Do you climb into the sewers, flee back to the carnival gates, or embrace the silence?"
      ],
      choices: [
        {
          id: 'end_1',
          text: 'Descend into the sewers with your flashlight.',
          outcome: 'You drop down into the tunnels. A pair of yellow glowing eyes winks at you from the dark. You have joined the carnival forever.',
          isEnding: true,
          endingType: 'The Lost Wanderer'
        },
        {
          id: 'end_2',
          text: 'Sprint toward the rusted carnival gate before it seals.',
          outcome: 'You burst through the iron gate into the cold morning rain. You survive, but every red balloon you see for the rest of your life will make you shudder.',
          isEnding: true,
          endingType: 'The Survivor'
        }
      ],
      source: 'curated-offline-engine'
    };
  }

  async getRiddle(category, difficulty, useAi = false) {
    if (this.isBackendAvailable && useAi) {
      try {
        const query = new URLSearchParams({
          ...(category && { category }),
          difficulty,
          useAi: 'true'
        });
        const res = await fetch(`${this.apiBase}/ai/riddle?${query}`, {
          signal: AbortSignal.timeout(6000)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    // Client-side fallback
    let pool = OFFLINE_RIDDLES;
    if (category) {
      const filtered = pool.filter(r => r.category.toLowerCase().includes(category.toLowerCase()));
      if (filtered.length > 0) pool = filtered;
    }
    if (difficulty) {
      const diffFilt = pool.filter(r => r.difficulty.toLowerCase() === difficulty.toLowerCase());
      if (diffFilt.length > 0) pool = diffFilt;
    }

    const selected = pool[Math.floor(Math.random() * pool.length)];
    return { ...selected, source: 'curated-offline-engine' };
  }

  async verifyRiddle(riddleId, userAnswer, acceptableAnswers = []) {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${this.apiBase}/ai/riddle/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ riddleId, userAnswer, acceptableAnswers }),
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    // Client-side verification
    const cleanUser = userAnswer.trim().toLowerCase().replace(/[^\w\s]/g, '');
    let candidates = [...acceptableAnswers.map(a => a.toLowerCase().replace(/[^\w\s]/g, ''))];
    const item = OFFLINE_RIDDLES.find(r => r.id === riddleId);
    if (item) {
      candidates.push(item.answer.toLowerCase().replace(/[^\w\s]/g, ''));
      if (item.acceptableAnswers) {
        candidates.push(...item.acceptableAnswers.map(a => a.toLowerCase().replace(/[^\w\s]/g, '')));
      }
    }

    const isCorrect = candidates.some(c => cleanUser === c || (c.length > 3 && cleanUser.includes(c)) || (cleanUser.length > 3 && c.includes(cleanUser)));
    return {
      correct: isCorrect,
      userAnswer,
      feedback: isCorrect ? 'The spirit nods with grim approval!' : 'A chilling gust extinguishes the candle. That answer is incorrect.'
    };
  }

  async getPuzzle(type, difficulty, useAi = false) {
    if (this.isBackendAvailable && useAi) {
      try {
        const query = new URLSearchParams({
          ...(type && { type }),
          difficulty,
          useAi: 'true'
        });
        const res = await fetch(`${this.apiBase}/ai/puzzle?${query}`, {
          signal: AbortSignal.timeout(6000)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    // Client-side fallback
    let pool = OFFLINE_PUZZLES;
    if (type) {
      const filt = pool.filter(p => p.type.toLowerCase() === type.toLowerCase());
      if (filt.length > 0) pool = filt;
    }
    if (difficulty) {
      const diffFilt = pool.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
      if (diffFilt.length > 0) pool = diffFilt;
    }

    const selected = pool[Math.floor(Math.random() * pool.length)];
    return { ...selected, source: 'curated-offline-engine' };
  }

  async verifyPuzzle(puzzleId, solution, acceptableAnswers = []) {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${this.apiBase}/ai/puzzle/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ puzzleId, solution, acceptableAnswers }),
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    const cleanUser = solution.trim().toUpperCase().replace(/[^\w]/g, '');
    let candidates = [...acceptableAnswers.map(a => String(a).toUpperCase().replace(/[^\w]/g, ''))];
    const item = OFFLINE_PUZZLES.find(p => p.id === puzzleId);
    if (item) {
      candidates.push(String(item.answer).toUpperCase().replace(/[^\w]/g, ''));
      if (item.acceptableAnswers) {
        candidates.push(...item.acceptableAnswers.map(a => String(a).toUpperCase().replace(/[^\w]/g, '')));
      }
    }

    const isCorrect = candidates.some(c => cleanUser === c);
    return {
      correct: isCorrect,
      userSolution: solution,
      feedback: isCorrect ? 'The tumblers click open! The mechanism gives way.' : 'The iron lock rattles rigidly. Solution rejected.'
    };
  }
}

export const aiService = new AIServiceClient();
export default aiService;
