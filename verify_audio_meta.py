import os
import json
import subprocess

DIR = os.path.abspath("demo_assets/audio")

SCENES = [
    {
        "id": "scene01_intro",
        "title": "IT'S PLAYTIME",
        "subtitle": "Every game has a dark side. Wanna play?",
        "narration": "Welcome to IT's Playtime, an interactive horror gaming platform where mystery, adventure, puzzles, and artificial intelligence come together. Explore haunted worlds, challenge your mind, and discover what awaits behind every game."
    },
    {
        "id": "scene02_homepage",
        "title": "PLATFORM OVERVIEW",
        "subtitle": "Haunted Carnival Experience & Player Dashboard",
        "narration": "From the haunted midway to forgotten sewers, the intuitive game selector lets you jump straight into the action. Track your player rank, view offline status, toggle the procedural sound engine, and access persistent saved progress."
    },
    {
        "id": "scene03_red_balloon",
        "title": "GAME 1: THE RED BALLOON",
        "subtitle": "Signature Town Mystery & Sewer Escape",
        "narration": "The Red Balloon is our signature mystery adventure. Follow the floating balloon across an abandoned town, search locations, gather critical inventory like flashlights and keys, avoid supernatural encounters, and solve the final sewer riddle to escape."
    },
    {
        "id": "scene04_haunted_mansion",
        "title": "GAME 2: HAUNTED MANSION",
        "subtitle": "Room Exploration & Hidden Secrets",
        "narration": "Step into the Haunted Mansion, an eerie room-by-room exploration mystery. Search the dusty library and grand foyer for hidden keys, uncover secret passages, crack ancient logic locks, and lift the centuries-old curse."
    },
    {
        "id": "scene05_lost_carnival",
        "title": "GAME 3: THE LOST CARNIVAL",
        "subtitle": "Midway Survival & Timed Challenges",
        "narration": "Survive The Lost Carnival, packed with classic midway attractions. Test your reflexes in the Hall of Mirrors, spin the Wheel of Torment, collect carnival tokens, and bypass deadly traps to unlock the rusted carnival gates."
    },
    {
        "id": "scene06_ghost_party",
        "title": "GAME 4: GHOST PARTY",
        "subtitle": "Local Pass-and-Play Multiplayer",
        "narration": "Ghost Party is our pass-and-play multiplayer party game for one to four local players. Battle friends through horror trivia, bluffing duels, and ghost riddles, with no internet connection required."
    },
    {
        "id": "scene07_day_of_dead",
        "title": "GAME 5: DAY OF THE DEAD",
        "subtitle": "Día de los Muertos Digital Remembrance",
        "narration": "Day of the Dead offers a warm, respectful remembrance experience. Build a digital ofrenda with glowing virtual candles, vibrant cempasúchil marigolds, and personal memory tributes to honor loved ones."
    },
    {
        "id": "scene08_story_teller",
        "title": "GAME 6: GHOST STORY TELLER",
        "subtitle": "Interactive AI-Powered Branching Horror",
        "narration": "Ghost Story Teller is our core AI experience. Select your horror intensity, theme, and protagonist to generate a multi-paragraph, immersive tale. Make real-time branching decisions with multiple unpredictable endings."
    },
    {
        "id": "scene09_lost_key",
        "title": "GAME 7: THE LOST KEY",
        "subtitle": "Cryptographic Puzzle Adventure",
        "narration": "The Lost Key is a dedicated cryptographic puzzle room. Decode number sequences, solve cryptic word riddles, use the multi-tier hint system, and crack secret lock combinations to reveal what lies within."
    },
    {
        "id": "scene10_ai_architecture",
        "title": "OPEN-SOURCE AI ENGINE",
        "subtitle": "Qwen 2.5 3B Instruct via Local Ollama",
        "narration": "The AI platform is powered by the open-weight Qwen 2.5 3B Instruct model running locally via Ollama. It requires zero paid API keys, keeps player data private, and falls back gracefully to built-in horror banks when offline."
    },
    {
        "id": "scene11_offline_pwa",
        "title": "100% OFFLINE-FIRST ARCHITECTURE",
        "subtitle": "Service Worker & IndexedDB Caching",
        "narration": "Built as an offline-first Progressive Web App, Service Workers cache all game assets and procedural sounds. Even without an internet connection, all games remain fully playable with IndexedDB storing your progress locally."
    },
    {
        "id": "scene12_achievements_audio",
        "title": "ACHIEVEMENTS & AUDIO SYNTHESIS",
        "subtitle": "Procedural Web Audio & Real-time Progression",
        "narration": "Unlock dozens of chilling achievements, level up your player profile, and immerse yourself in the procedural Web Audio synthesizer that generates dynamic horror soundscapes without external audio files."
    },
    {
        "id": "scene13_tech_stack",
        "title": "MODERN FULL-STACK ARCHITECTURE",
        "subtitle": "React 18 • Flask • Qwen 2.5 • PWA",
        "narration": "Built with a modern, resilient tech stack: React 18, Vite, and Tailwind CSS on the frontend, with a Python Flask and Gunicorn backend, connected to local Ollama inference and IndexedDB."
    },
    {
        "id": "scene14_closing",
        "title": "YOU FLOAT, YOU PLAY, YOU SURVIVE",
        "subtitle": "Available Online & Open Source on GitHub",
        "narration": "From haunted adventures to mind-bending puzzles and AI-powered storytelling, IT's Playtime brings a new dimension to interactive gaming. Explore the unknown, solve the mysteries, and see how long you can survive. You float, you play, you survive."
    }
]

total_duration = 0.0

for s in SCENES:
    mp3_path = os.path.join(DIR, f"{s['id']}.mp3")
    if not os.path.exists(mp3_path):
        raise FileNotFoundError(f"Missing {mp3_path}")
    res = subprocess.run([
        'ffprobe', '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        mp3_path
    ], capture_output=True, text=True, check=True)
    dur = float(res.stdout.strip())
    s["audio_duration"] = round(dur, 2)
    s["video_duration"] = round(dur + 0.8, 2) # 0.8s buffer for smooth transitions
    s["audio_path"] = mp3_path
    total_duration += s["video_duration"]
    print(f"[{s['id']}] Audio: {s['audio_duration']}s -> Clip: {s['video_duration']}s")

meta_file = os.path.join(DIR, "scenes_meta.json")
with open(meta_file, "w", encoding="utf-8") as f:
    json.dump(SCENES, f, indent=2)

print(f"\n[OK] All 14 scenes verified! Total video runtime: {round(total_duration, 1)}s (~{round(total_duration/60, 2)} min)")
