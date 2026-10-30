import unittest
import json
from app import app

class TestItsPlaytimePlatform(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('status'), 'healthy')
        self.assertTrue(data.get('offline_ready'))
        self.assertIn('ollama', data)
        print("[OK] Health Check Passed: Server healthy and offline ready")

    def test_02_ai_status(self):
        res = self.client.get('/api/ai/status')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('connected', data)
        self.assertIn('target_model', data)
        print("[OK] AI Status Passed: Real Ollama check validated")

    def test_03_story_generation(self):
        payload = {
            "prompt": "A lone red balloon hovers in the sewer grate",
            "category": "Creepy carnival",
            "intensity": "Chilling dread",
            "protagonist": "The Curious Teen",
            "length": "Medium"
        }
        res = self.client.post('/api/ai/story/generate', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('title', data)
        self.assertIn('paragraphs', data)
        self.assertTrue(len(data['paragraphs']) > 0)
        self.assertIn('choices', data)
        self.assertTrue(len(data['choices']) >= 2)
        print(f"[OK] Story Generation Passed: '{data.get('title')}' with {len(data['paragraphs'])} paragraphs")

    def test_04_story_continuation(self):
        payload = {
            "history": [{"title": "Chapter 1", "paragraphs": ["A spooky mist rises."]}],
            "chosenOption": {"text": "Step into the dark tunnel", "outcome": "A whisper guides your feet."}
        }
        res = self.client.post('/api/ai/story/continue', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('paragraphs', data)
        self.assertIn('choices', data)
        print("[OK] Story Continuation Passed: Seamless branching progression")

    def test_05_riddle_retrieval_and_verification(self):
        res = self.client.get('/api/ai/riddle?difficulty=easy')
        self.assertEqual(res.status_code, 200)
        riddle = res.get_json()
        self.assertIn('question', riddle)
        self.assertIn('answer', riddle)
        print(f"[OK] Riddle Retrieved: '{riddle.get('question')[:40]}...'")

        # Verify correct answer
        verify_payload = {
            "riddleId": riddle.get('id'),
            "userAnswer": riddle.get('answer'),
            "acceptableAnswers": riddle.get('acceptableAnswers', [])
        }
        v_res = self.client.post('/api/ai/riddle/verify', json=verify_payload)
        self.assertEqual(v_res.status_code, 200)
        v_data = v_res.get_json()
        self.assertTrue(v_data.get('correct'))
        print("[OK] Riddle Verification Passed: Correct answer accepted")

    def test_06_puzzle_retrieval_and_verification(self):
        res = self.client.get('/api/ai/puzzle?difficulty=novice')
        self.assertEqual(res.status_code, 200)
        puzzle = res.get_json()
        self.assertIn('title', puzzle)
        self.assertIn('answer', puzzle)
        print(f"[OK] Puzzle Retrieved: '{puzzle.get('title')}'")

        # Verify solution
        p_res = self.client.post('/api/ai/puzzle/verify', json={
            "puzzleId": puzzle.get('id'),
            "solution": str(puzzle.get('answer')),
            "acceptableAnswers": puzzle.get('acceptableAnswers', [])
        })
        self.assertEqual(p_res.status_code, 200)
        p_data = p_res.get_json()
        self.assertTrue(p_data.get('correct'))
        print("[OK] Puzzle Verification Passed: Solution validated")

    def test_07_clue_generation(self):
        res = self.client.get('/api/ai/clue?location=Town Square')
        self.assertEqual(res.status_code, 200)
        clue = res.get_json()
        self.assertIn('clueName', clue)
        self.assertIn('description', clue)
        print(f"[OK] Clue Generated: '{clue.get('clueName')}'")

if __name__ == '__main__':
    unittest.main()
