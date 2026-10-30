import json
import os
import random
import re

class RiddleService:
    def __init__(self, ai_service, banks_dir=None):
        self.ai = ai_service
        if banks_dir is None:
            banks_dir = os.path.join(os.path.dirname(__file__), "offline_banks")
        self.banks_dir = banks_dir
        self.offline_riddles = self._load_offline_riddles()

    def _load_offline_riddles(self):
        file_path = os.path.join(self.banks_dir, "riddles.json")
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading offline riddles: {e}")
        return []

    def get_riddle(self, category=None, difficulty="medium", use_ai=False):
        """
        Fetch a riddle, either AI-generated or from offline banks.
        """
        if use_ai:
            system_prompt = (
                "You are the Sinister Jester of IT's Playtime horror gaming universe. "
                "Craft an original, poetic, creepy horror riddle with a single word or short noun answer. "
                "Output strictly in JSON format:\n"
                "{\n"
                '  "id": "ai_riddle",\n'
                '  "category": "horror",\n'
                '  "difficulty": "medium",\n'
                '  "question": "Poetic riddle text...",\n'
                '  "answer": "target answer",\n'
                '  "acceptableAnswers": ["answer", "the answer", "an answer"],\n'
                '  "hint": "Subtle clue without spoiling",\n'
                '  "lore": "One sentence creepy background lore"\n'
                "}"
            )
            user_prompt = f"Create a {difficulty} horror riddle centered on {category or 'carnivals, ghosts, shadows, or red balloons'}."
            ai_res = self.ai.generate(prompt=user_prompt, system_prompt=system_prompt, temperature=0.8, max_tokens=400)
            if ai_res["success"] and not ai_res["is_fallback"]:
                try:
                    text = ai_res["text"]
                    json_match = re.search(r"\{[\s\S]*\}", text)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        parsed["source"] = "qwen-local-ai"
                        return parsed
                except Exception as e:
                    print(f"Failed to parse AI riddle: {e}")

        # Offline bank fallback
        pool = self.offline_riddles
        if category:
            matching = [r for r in pool if category.lower() in r.get("category", "").lower()]
            if matching:
                pool = matching
        if difficulty:
            diff_matching = [r for r in pool if difficulty.lower() == r.get("difficulty", "").lower()]
            if diff_matching:
                pool = diff_matching

        selected = random.choice(pool if pool else self.offline_riddles)
        res = dict(selected)
        res["source"] = "curated-offline-engine"
        return res

    def verify_answer(self, riddle_id, user_answer, acceptable_answers=None):
        """
        Verifies answer fuzzily against target and acceptable alternatives.
        """
        clean_user = user_answer.strip().lower()
        # Clean punctuation
        clean_user = re.sub(r"[^\w\s]", "", clean_user)
        
        # Check against passed acceptable answers or look up in offline bank
        candidates = []
        if acceptable_answers:
            candidates.extend([re.sub(r"[^\w\s]", "", a.strip().lower()) for a in acceptable_answers])
        
        # If ID is in offline riddles, include those
        for r in self.offline_riddles:
            if r.get("id") == riddle_id:
                candidates.extend([re.sub(r"[^\w\s]", "", a.strip().lower()) for a in r.get("acceptableAnswers", [])])
                candidates.append(re.sub(r"[^\w\s]", "", r.get("answer", "").strip().lower()))

        is_correct = any(clean_user == c or clean_user in c or c in clean_user for c in candidates if len(c) > 2)
        return {
            "correct": is_correct,
            "userAnswer": user_answer,
            "feedback": "The spirits accept your offering!" if is_correct else "A cold wind howls... That is not the true name."
        }
