import json
import os
import random
import re

class PuzzleService:
    def __init__(self, ai_service, banks_dir=None):
        self.ai = ai_service
        if banks_dir is None:
            banks_dir = os.path.join(os.path.dirname(__file__), "offline_banks")
        self.banks_dir = banks_dir
        self.offline_puzzles = self._load_offline_puzzles()

    def _load_offline_puzzles(self):
        file_path = os.path.join(self.banks_dir, "puzzles.json")
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading offline puzzles: {e}")
        return []

    def get_puzzle(self, puzzle_type=None, difficulty="novice", use_ai=False):
        """
        Get logic, sequence, cipher, or pattern puzzle.
        """
        if use_ai:
            system_prompt = (
                "You are the Cursed Locksmith of IT's Playtime. "
                "Design a clever, solvable horror puzzle (number sequence, word cipher, or deduction). "
                "Output strictly in JSON format with fields:\n"
                "{\n"
                '  "id": "ai_puzzle",\n'
                '  "title": "Puzzle Title",\n'
                '  "type": "sequence|cipher|logic|pattern",\n'
                '  "difficulty": "novice|investigator|cryptographer|master",\n'
                '  "description": "Flavor text explaining the puzzle clearly",\n'
                '  "answer": "EXACT_ANSWER",\n'
                '  "acceptableAnswers": ["EXACT_ANSWER", "alt"],\n'
                '  "hints": ["Hint 1", "Hint 2", "Hint 3"]\n'
                "}"
            )
            user_prompt = f"Create a {difficulty} puzzle of type {puzzle_type or 'sequence or cipher'} with a clear unique answer."
            ai_res = self.ai.generate(prompt=user_prompt, system_prompt=system_prompt, temperature=0.6, max_tokens=500)
            if ai_res["success"] and not ai_res["is_fallback"]:
                try:
                    text = ai_res["text"]
                    json_match = re.search(r"\{[\s\S]*\}", text)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        parsed["source"] = "qwen-local-ai"
                        return parsed
                except Exception as e:
                    print(f"Failed to parse AI puzzle: {e}")

        # Curated offline bank
        pool = self.offline_puzzles
        if puzzle_type:
            matching = [p for p in pool if puzzle_type.lower() == p.get("type", "").lower()]
            if matching:
                pool = matching
        if difficulty:
            diff_matching = [p for p in pool if difficulty.lower() == p.get("difficulty", "").lower()]
            if diff_matching:
                pool = diff_matching

        selected = random.choice(pool if pool else self.offline_puzzles)
        res = dict(selected)
        res["source"] = "curated-offline-engine"
        return res

    def verify_solution(self, puzzle_id, user_solution, acceptable_answers=None):
        clean_user = user_solution.strip().upper()
        clean_user = re.sub(r"[^\w]", "", clean_user)

        candidates = []
        if acceptable_answers:
            candidates.extend([re.sub(r"[^\w]", "", str(a).strip().upper()) for a in acceptable_answers])

        for p in self.offline_puzzles:
            if p.get("id") == puzzle_id:
                candidates.extend([re.sub(r"[^\w]", "", str(a).strip().upper()) for a in p.get("acceptableAnswers", [])])
                candidates.append(re.sub(r"[^\w]", "", str(p.get("answer", "")).strip().upper()))

        is_correct = any(clean_user == c for c in candidates if c)
        return {
            "correct": is_correct,
            "userSolution": user_solution,
            "feedback": "The tumblers align! The heavy iron lock clicks open." if is_correct else "The mechanism resists. A cold click echoes in failure."
        }
