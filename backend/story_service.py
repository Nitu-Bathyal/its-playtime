import json
import os
import random
import re

class StoryService:
    def __init__(self, ai_service, banks_dir=None):
        self.ai = ai_service
        if banks_dir is None:
            banks_dir = os.path.join(os.path.dirname(__file__), "offline_banks")
        self.banks_dir = banks_dir
        self.offline_stories = self._load_offline_stories()

    def _load_offline_stories(self):
        stories_file = os.path.join(self.banks_dir, "stories.json")
        if os.path.exists(stories_file):
            try:
                with open(stories_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading offline stories: {e}")
        return []

    def generate_story(self, prompt, category="Creepy carnival", intensity="Chilling dread", protagonist="The Curious Teen", length="Medium"):
        """
        Generate interactive horror story with paragraphs, choices, and atmospheric immersion.
        """
        system_prompt = (
            "You are an acclaimed horror author for 'IT's Playtime', an offline-first horror gaming universe. "
            "Write an atmospheric, suspenseful story featuring psychological tension, eerie environmental details, "
            "and distinct horror tropes (abandoned carnivals, flickering lights, red balloons, creaking doors, mysterious clowns). "
            "Output your story strictly in JSON format with fields:\n"
            "{\n"
            '  "title": "Story Title",\n'
            '  "paragraphs": ["Paragraph 1...", "Paragraph 2...", "Paragraph 3..."],\n'
            '  "choices": [\n'
            '     {"id": "c1", "text": "Choice 1 description", "outcome": "Immediate suspenseful result"},\n'
            '     {"id": "c2", "text": "Choice 2 description", "outcome": "Immediate suspenseful result"},\n'
            '     {"id": "c3", "text": "Choice 3 description", "outcome": "Immediate suspenseful result"}\n'
            "  ]\n"
            "}"
        )

        user_prompt = (
            f"Genre / Category: {category}\n"
            f"Horror Intensity: {intensity}\n"
            f"Protagonist Archetype: {protagonist}\n"
            f"Story Length: {length}\n"
            f"User Concept / Seed: {prompt if prompt else 'A red balloon appears on an abandoned carnival carousel'}\n\n"
            "Compose a multi-paragraph horror chapter and provide 3 divergent tactical choices for the player. Return valid JSON only."
        )

        ai_res = self.ai.generate(prompt=user_prompt, system_prompt=system_prompt, temperature=0.75, max_tokens=900)
        
        if ai_res["success"] and not ai_res["is_fallback"]:
            try:
                # Try to extract JSON from markdown or raw text
                text = ai_res["text"]
                json_match = re.search(r"\{[\s\S]*\}", text)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                    parsed["source"] = "qwen-local-ai"
                    parsed["model"] = ai_res["model"]
                    return parsed
            except Exception as e:
                print(f"Failed to parse AI story JSON: {e}")

        # Seamless offline fallback
        fallback = self._get_offline_story(category, intensity, prompt)
        fallback["source"] = "curated-offline-engine"
        fallback["model"] = "offline-fallback"
        return fallback

    def _get_offline_story(self, category, intensity, prompt):
        # Match category or pick random
        matching = [s for s in self.offline_stories if category.lower() in s.get("category", "").lower()]
        base_story = random.choice(matching if matching else self.offline_stories)
        
        # Deep copy
        story_copy = json.loads(json.dumps(base_story))
        if prompt:
            # Customize first paragraph slightly with user seed
            story_copy["paragraphs"][0] = f"Reflecting on '{prompt}': " + story_copy["paragraphs"][0]
        return story_copy

    def continue_story(self, history, chosen_option):
        """
        Generate the next chapter based on the user's selected choice.
        """
        system_prompt = (
            "You are continuing an interactive horror story in 'IT's Playtime'. "
            "Write the following chapter reflecting the consequences of the player's choice. "
            "Output strictly in JSON format:\n"
            "{\n"
            '  "title": "Chapter Sequel",\n'
            '  "paragraphs": ["Consequence paragraph 1...", "Deepening mystery paragraph 2..."],\n'
            '  "choices": [\n'
            '     {"id": "c1", "text": "Next action 1", "outcome": "...", "isEnding": false},\n'
            '     {"id": "c2", "text": "Next action 2", "outcome": "...", "isEnding": false},\n'
            '     {"id": "c3", "text": "Final escape attempt", "outcome": "...", "isEnding": true}\n'
            "  ]\n"
            "}"
        )

        user_prompt = (
            f"Previous Story Summary:\n{json.dumps(history[-2:] if len(history) > 2 else history)}\n\n"
            f"Player Choice Taken:\n{chosen_option}\n\n"
            "What happens next? Resolve this immediate crisis and introduce the next eerie dilemma or ending. Return JSON only."
        )

        ai_res = self.ai.generate(prompt=user_prompt, system_prompt=system_prompt, temperature=0.75, max_tokens=800)
        if ai_res["success"] and not ai_res["is_fallback"]:
            try:
                text = ai_res["text"]
                json_match = re.search(r"\{[\s\S]*\}", text)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                    parsed["source"] = "qwen-local-ai"
                    return parsed
            except Exception as e:
                print(f"Failed to parse continuation JSON: {e}")

        # Curated offline continuation
        return {
            "title": "Into the Abyss",
            "paragraphs": [
                f"You chose to: {chosen_option.get('text', 'proceed forward')}.",
                chosen_option.get("outcome", "The shadows shift violently around you as the clown's mocking laughter reverberates through the damp brickwork."),
                "Ahead in the mist, a final rusted iron door stands locked with three brass tumblers. On the wall beside it, glowing crimson writing reads: 'ONLY THOSE WHO EMBRACE THE DARKNESS MAY PASS.'",
                "You hear water rushing behind you; the sewer sluice gate is closing!"
            ],
            "choices": [
                {
                    "id": "c_esc1",
                    "text": "Turn the brass tumblers using the carnival cipher.",
                    "outcome": "The tumblers click into place! The iron door swings wide, releasing a blast of fresh autumn night air. You stumble out onto the highway as dawn breaks.",
                    "isEnding": True,
                    "endingType": "Survivor"
                },
                {
                    "id": "c_esc2",
                    "text": "Dodge into the clown's secret alcove behind the pipes.",
                    "outcome": "You squeeze into the narrow shaft. You find a chest overflowing with silver tokens and an ancient diary—becoming the new master of the carnival.",
                    "isEnding": True,
                    "endingType": "Keeper of the Carnival"
                },
                {
                    "id": "c_esc3",
                    "text": "Confront the shadow holding the red balloon directly.",
                    "outcome": "The clown bows low and hands you the string of the balloon. 'You're brave,' he chuckles softly. 'Until next year.' He dissolves into crimson mist, leaving you alone under the morning stars.",
                    "isEnding": True,
                    "endingType": "The Marked Player"
                }
            ],
            "source": "curated-offline-engine"
        }
