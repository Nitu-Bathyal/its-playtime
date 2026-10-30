import wave
import struct
import math
import random
import os

def generate_horror_track(output_path, duration_sec=215, sample_rate=44100):
    num_samples = int(duration_sec * sample_rate)
    frames = bytearray()
    
    # Music box chime frequencies (A minor pentatonic: A, C, D, E, G)
    chime_freqs = [440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]
    
    # Pre-generate chime schedule
    chimes = []
    t_curr = 5.0
    while t_curr < duration_sec - 5:
        chimes.append({
            'start': t_curr,
            'freq': random.choice(chime_freqs),
            'duration': 3.5,
            'vol': random.uniform(0.04, 0.08)
        })
        t_curr += random.uniform(10.0, 18.0)
        
    print(f"Synthesizing {duration_sec}s horror ambient score with {len(chimes)} carnival chimes...")
    
    for i in range(num_samples):
        t = i / sample_rate
        
        # 1. Binaural Sub Drone (48Hz and 51.5Hz)
        drone_l = 0.18 * math.sin(2 * math.pi * 48.0 * t)
        drone_r = 0.18 * math.sin(2 * math.pi * 51.5 * t)
        
        # 2. Slow breathing pad (110Hz A2 + 164.8Hz E3)
        lfo = 0.5 + 0.5 * math.sin(2 * math.pi * 0.12 * t)
        pad = 0.08 * math.sin(2 * math.pi * 110.0 * t) * lfo + 0.05 * math.sin(2 * math.pi * 164.81 * t) * lfo
        
        # 3. Creepy tritone tension (155.56Hz Eb3 - Diabolus in Musica)
        tritone = 0.03 * math.sin(2 * math.pi * 155.56 * t) * (0.5 + 0.5 * math.sin(2 * math.pi * 0.08 * t))
        
        # 4. Ghostly wind whisper
        wind = 0.015 * (random.random() * 2 - 1) * (0.6 + 0.4 * math.sin(2 * math.pi * 0.15 * t))
        
        # 5. Distant music box bell chime
        chime_val = 0.0
        for ch in chimes:
            dt = t - ch['start']
            if 0 <= dt <= ch['duration']:
                # Exponential decay bell envelope
                env = math.exp(-2.2 * dt)
                # Pure sine + subtle harmonic
                chime_val += ch['vol'] * env * (
                    math.sin(2 * math.pi * ch['freq'] * dt) + 
                    0.3 * math.sin(4 * math.pi * ch['freq'] * dt)
                )
                
        left = drone_l + pad + tritone + wind + chime_val
        right = drone_r + pad + tritone + wind + chime_val
        
        # Master volume limiting (keep soft - around -18dB)
        left = max(-1.0, min(1.0, left * 0.45))
        right = max(-1.0, min(1.0, right * 0.45))
        
        sample_l = int(left * 32767.0)
        sample_r = int(right * 32767.0)
        
        frames += struct.pack('<hh', sample_l, sample_r)
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with wave.open(output_path, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(frames)
        
    print(f"[OK] Ambient horror music generated: {output_path} ({os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    generate_horror_track("demo_assets/audio/background_music.wav", duration_sec=215)
