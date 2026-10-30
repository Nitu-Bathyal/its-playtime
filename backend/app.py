import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ai_service import AIService
from story_service import StoryService
from riddle_service import RiddleService
from mystery_service import MysteryService
from puzzle_service import PuzzleService

app = Flask(__name__)
# Enable CORS for frontend dev server, preview, and production domains
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Initialize services
ai_service = AIService()
story_service = StoryService(ai_service)
riddle_service = RiddleService(ai_service)
mystery_service = MysteryService(ai_service)
puzzle_service = PuzzleService(ai_service)

@app.route("/api/health", methods=["GET"])
def health():
    ai_status = ai_service.check_status()
    return jsonify({
        "status": "healthy",
        "app": "IT's Playtime AI Backend",
        "version": "1.0.0",
        "offline_ready": True,
        "ollama": ai_status
    })

@app.route("/api/ai/status", methods=["GET"])
def ai_status():
    status = ai_service.check_status()
    return jsonify(status)

@app.route("/api/ai/story/generate", methods=["POST"])
def generate_story():
    data = request.get_json() or {}
    prompt = data.get("prompt", "")
    category = data.get("category", "Creepy carnival")
    intensity = data.get("intensity", "Chilling dread")
    protagonist = data.get("protagonist", "The Curious Teen")
    length = data.get("length", "Medium")
    
    story = story_service.generate_story(
        prompt=prompt,
        category=category,
        intensity=intensity,
        protagonist=protagonist,
        length=length
    )
    return jsonify(story)

@app.route("/api/ai/story/continue", methods=["POST"])
def continue_story():
    data = request.get_json() or {}
    history = data.get("history", [])
    chosen_option = data.get("chosenOption", {})
    
    continuation = story_service.continue_story(history, chosen_option)
    return jsonify(continuation)

@app.route("/api/ai/riddle", methods=["GET"])
def get_riddle():
    category = request.args.get("category")
    difficulty = request.args.get("difficulty", "medium")
    use_ai = request.args.get("useAi", "false").lower() == "true"
    
    riddle = riddle_service.get_riddle(category, difficulty, use_ai)
    return jsonify(riddle)

@app.route("/api/ai/riddle/verify", methods=["POST"])
def verify_riddle():
    data = request.get_json() or {}
    riddle_id = data.get("riddleId")
    user_answer = data.get("userAnswer", "")
    acceptable = data.get("acceptableAnswers")
    
    res = riddle_service.verify_answer(riddle_id, user_answer, acceptable)
    return jsonify(res)

@app.route("/api/ai/clue", methods=["GET"])
def get_clue():
    location = request.args.get("location", "Town Square")
    theme = request.args.get("theme", "clown mystery")
    
    clue = mystery_service.generate_clue(location, theme)
    return jsonify(clue)

@app.route("/api/ai/puzzle", methods=["GET"])
def get_puzzle():
    puzzle_type = request.args.get("type")
    difficulty = request.args.get("difficulty", "novice")
    use_ai = request.args.get("useAi", "false").lower() == "true"
    
    puzzle = puzzle_service.get_puzzle(puzzle_type, difficulty, use_ai)
    return jsonify(puzzle)

@app.route("/api/ai/puzzle/verify", methods=["POST"])
def verify_puzzle():
    data = request.get_json() or {}
    puzzle_id = data.get("puzzleId")
    solution = data.get("solution", "")
    acceptable = data.get("acceptableAnswers")
    
    res = puzzle_service.verify_solution(puzzle_id, solution, acceptable)
    return jsonify(res)

DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # Don't intercept API routes
    if path.startswith("api/"):
        return jsonify({"error": "Endpoint not found"}), 404
        
    if path != "" and os.path.exists(os.path.join(DIST_DIR, path)):
        return send_from_directory(DIST_DIR, path)
    if os.path.exists(os.path.join(DIST_DIR, "index.html")):
        return send_from_directory(DIST_DIR, "index.html")
    return jsonify({
        "status": "IT's Playtime Backend is running",
        "api_docs": "/api/health"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] IT's Playtime running on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
