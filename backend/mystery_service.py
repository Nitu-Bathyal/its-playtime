import json
import os
import random
import re

class MysteryService:
    def __init__(self, ai_service, banks_dir=None):
        self.ai = ai_service
        if banks_dir is None:
            banks_dir = os.path.join(os.path.dirname(__file__), "offline_banks")
        self.banks_dir = banks_dir
        self.offline_mysteries = self._load_offline_mysteries()

    def _load_offline_mysteries(self):
        file_path = os.path.join(self.banks_dir, "mysteries.json")
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading offline mysteries: {e}")
        return []

    def generate_clue(self, location="Town Square", theme="clown mystery"):
        """
        Generate supernatural clue or case artifact.
        """
        system_prompt = (
            "You are the investigator log generator for IT's Playtime. "
            "Generate a creepy, investigative artifact found in an abandoned horror location. "
            "Output strictly JSON with fields: clueName, description, discoveredLore, unlockedItem, associatedCode."
        )
        user_prompt = f"Location: {location}. Theme: {theme}. Create an eerie discovery artifact in JSON format."

        ai_res = self.ai.generate(prompt=user_prompt, system_prompt=system_prompt, temperature=0.7, max_tokens=400)
        if ai_res["success"] and not ai_res["is_fallback"]:
            try:
                text = ai_res["text"]
                json_match = re.search(r"\{[\s\S]*\}", text)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                    parsed["source"] = "qwen-local-ai"
                    return parsed
            except Exception as e:
                print(f"Failed to parse clue JSON: {e}")

        # Fallback
        pool = self.offline_mysteries
        selected = random.choice(pool) if pool else {
            "clueName": "Torn Yellow Raincoat Fragment",
            "description": "A sodden scrap of bright yellow fabric caught on a jagged sewer grate.",
            "discoveredLore": "A child dropped this while chasing a floating red balloon in the rain.",
            "unlockedItem": "Raincoat Scrap",
            "associatedCode": "1989"
        }
        res = dict(selected)
        res["source"] = "curated-offline-engine"
        return res
