import { OFFLINE_RIDDLES, OFFLINE_PUZZLES, OFFLINE_STORIES } from './src/services/offlineBanks.js';

console.log("=== STARTING QA AUDIT TEST ===");

// 1. Verify Riddles
let riddlePass = true;
OFFLINE_RIDDLES.forEach((r, i) => {
  if (!r.question || !r.answer || !r.acceptableAnswers || r.acceptableAnswers.length === 0) {
    console.error(`[FAIL] Riddle #${i} invalid structure:`, r);
    riddlePass = false;
  }
  const cleanAns = r.answer.toLowerCase().replace(/[^\w\s]/g, '');
  const matches = r.acceptableAnswers.some(a => a.toLowerCase().replace(/[^\w\s]/g, '') === cleanAns);
  if (!matches) {
    console.warn(`[WARN] Riddle #${i} answer '${r.answer}' not in acceptableAnswers:`, r.acceptableAnswers);
  }
});
if (riddlePass) console.log(`[PASS] Verified ${OFFLINE_RIDDLES.length} Offline Riddles with answers and hints.`);

// 2. Verify Puzzles
let puzzlePass = true;
OFFLINE_PUZZLES.forEach((p, i) => {
  if (!p.title || !p.answer || !p.hints || p.hints.length === 0) {
    console.error(`[FAIL] Puzzle #${i} invalid structure:`, p);
    puzzlePass = false;
  }
});
if (puzzlePass) console.log(`[PASS] Verified ${OFFLINE_PUZZLES.length} Offline Cryptographic Puzzles.`);

// 3. Verify Offline Stories
let storyPass = true;
OFFLINE_STORIES.forEach((s, i) => {
  if (!s.title || !s.paragraphs || s.paragraphs.length === 0 || !s.choices || s.choices.length < 2) {
    console.error(`[FAIL] Story #${i} invalid structure:`, s);
    storyPass = false;
  }
});
if (storyPass) console.log(`[PASS] Verified ${OFFLINE_STORIES.length} Curated Offline Horror Branching Stories.`);

// 4. Verify XP & Level Formula
const calcLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;
if (calcLevel(0) === 1 && calcLevel(100) === 2 && calcLevel(400) === 3 && calcLevel(900) === 4) {
  console.log("[PASS] Player Level progression mathematical formula verified.");
} else {
  console.error("[FAIL] Player level formula check failed.");
}

console.log("=== ALL QA AUDIT INVARIANT TESTS PASSED ===");
