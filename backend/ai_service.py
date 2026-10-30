import os
import json
import logging
import time
import requests

logger = logging.getLogger(__name__)

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b")

class AIService:
    def __init__(self, host=OLLAMA_HOST, model=DEFAULT_MODEL):
        self.host = host
        self.model = model
        self._last_status = None
        self._last_check_time = 0
        self._cache_ttl = 5.0 # seconds

    def check_status(self, force=False):
        """
        Check if Ollama server is reachable and if target model exists.
        Caches status for 5s to maintain ultra-fast offline responsiveness.
        """
        now = time.time()
        if not force and self._last_status and (now - self._last_check_time < self._cache_ttl):
            return self._last_status

        self._last_check_time = now
        try:
            resp = requests.get(f"{self.host}/api/tags", timeout=0.6)
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                target_found = any(self.model in m or "qwen" in m.lower() for m in models)
                self._last_status = {
                    "connected": True,
                    "model_available": target_found,
                    "installed_models": models,
                    "target_model": self.model,
                    "host": self.host
                }
                return self._last_status
        except Exception as e:
            logger.debug(f"Ollama connection check failed: {e}")
        
        self._last_status = {
            "connected": False,
            "model_available": False,
            "installed_models": [],
            "target_model": self.model,
            "host": self.host
        }
        return self._last_status

    def generate(self, prompt, system_prompt="You are the dark narrator of IT's Playtime horror gaming universe.", temperature=0.7, max_tokens=600):
        """
        Generate raw completion using Ollama.
        Returns dict with { 'success': bool, 'text': str, 'is_fallback': bool, 'model': str }
        """
        status = self.check_status()
        if not status["connected"]:
            return {
                "success": False,
                "text": "",
                "is_fallback": True,
                "model": "offline-fallback",
                "error": "Ollama service is not reachable on localhost:11434"
            }

        active_model = self.model
        if not status["model_available"] and status["installed_models"]:
            active_model = status["installed_models"][0]

        payload = {
            "model": active_model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }

        try:
            resp = requests.post(f"{self.host}/api/generate", json=payload, timeout=30.0)
            if resp.status_code == 200:
                result = resp.json()
                return {
                    "success": True,
                    "text": result.get("response", "").strip(),
                    "is_fallback": False,
                    "model": active_model
                }
            else:
                return {
                    "success": False,
                    "text": "",
                    "is_fallback": True,
                    "model": "offline-fallback",
                    "error": f"Ollama error {resp.status_code}: {resp.text}"
                }
        except Exception as e:
            return {
                "success": False,
                "text": "",
                "is_fallback": True,
                "model": "offline-fallback",
                "error": str(e)
            }
