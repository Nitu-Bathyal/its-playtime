import os
import json
import subprocess
import textwrap

BASE_DIR = os.path.abspath(".").replace("\\", "/")
AUDIO_DIR = os.path.join(BASE_DIR, "demo_assets", "audio").replace("\\", "/")
VIDEO_DIR = os.path.join(BASE_DIR, "demo_assets", "video").replace("\\", "/")
FINAL_DIR = os.path.join(BASE_DIR, "demo").replace("\\", "/")
OUTPUT_MP4 = os.path.join(FINAL_DIR, "ITs_Playtime_Project_Demo.mp4").replace("\\", "/")

os.makedirs(FINAL_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

def ff_path(p):
    return p.replace("\\", "/").replace(":", "\\:")

def compose_scene(scene, idx, total):
    scene_id = scene["id"]
    raw_mp4 = os.path.join(VIDEO_DIR, f"{scene_id}_raw.mp4").replace("\\", "/")
    audio_mp3 = os.path.join(AUDIO_DIR, f"{scene_id}.mp3").replace("\\", "/")
    out_scene_mp4 = os.path.join(VIDEO_DIR, f"{scene_id}_master.mp4").replace("\\", "/")
    
    if not os.path.exists(raw_mp4):
        raise FileNotFoundError(f"Missing {raw_mp4}")
    if not os.path.exists(audio_mp3):
        raise FileNotFoundError(f"Missing {audio_mp3}")
        
    title = scene.get("title", "IT'S PLAYTIME").upper()
    subtitle = scene.get("subtitle", "Horror Gaming Platform")
    narration = scene.get("narration", "")
    
    # Wrap narration text nicely for subtitle display
    wrapped_lines = textwrap.wrap(narration, width=85)
    caption_text = "\n".join(wrapped_lines)
    
    # Write text files so FFmpeg reads them with zero escaping or character issues
    title_txt_path = os.path.join(VIDEO_DIR, f"{scene_id}_title.txt")
    sub_txt_path = os.path.join(VIDEO_DIR, f"{scene_id}_sub.txt")
    cap_txt_path = os.path.join(VIDEO_DIR, f"{scene_id}_cap.txt")
    
    with open(title_txt_path, "w", encoding="utf-8") as f:
        f.write(title)
    with open(sub_txt_path, "w", encoding="utf-8") as f:
        f.write(subtitle)
    with open(cap_txt_path, "w", encoding="utf-8") as f:
        f.write(caption_text)
        
    brand_txt_path = os.path.join(VIDEO_DIR, "brand.txt")
    with open(brand_txt_path, "w", encoding="utf-8") as f:
        f.write("IT'S PLAYTIME")
    b_file = ff_path(brand_txt_path)
    
    font_bold = "C\\:/Windows/Fonts/georgiab.ttf"
    font_regular = "C\\:/Windows/Fonts/arial.ttf"
    
    t_file = ff_path(title_txt_path)
    s_file = ff_path(sub_txt_path)
    c_file = ff_path(cap_txt_path)
    
    # Number of subtitle lines decides box height
    box_h = 60 if len(wrapped_lines) <= 1 else (85 if len(wrapped_lines) == 2 else 110)
    
    # Subtitle box coordinates (exact numbers for 1080p frame)
    box_y = 1080 - (box_h + 25)
    text_y = box_y + 12
    
    filter_chains = [
        # Scale to 1080p 25fps and hold final frame if needed to match narration duration
        "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,fps=25,tpad=stop_mode=clone:stop_duration=35",
        
        # Header ribbon
        "drawbox=x=0:y=0:w=1920:h=85:color=black@0.85:t=fill",
        "drawbox=x=0:y=83:w=1920:h=2:color=#A51F2B@0.95:t=fill",
        f"drawtext=fontfile='{font_bold}':textfile='{t_file}':expansion=none:fontcolor=#F4E4CC:fontsize=28:x=40:y=18",
        f"drawtext=fontfile='{font_regular}':textfile='{s_file}':expansion=none:fontcolor=#D6A56C:fontsize=15:x=42:y=52",
        f"drawtext=fontfile='{font_bold}':textfile='{b_file}':expansion=none:fontcolor=#E62A3B:fontsize=22:x=1920-text_w-40:y=28",
        
        # Subtitle box
        f"drawbox=x=80:y={box_y}:w=1760:h={box_h}:color=black@0.85:t=fill",
        f"drawbox=x=80:y={box_y}:w=1760:h=2:color=#D6A56C@0.50:t=fill",
        f"drawtext=fontfile='{font_regular}':textfile='{c_file}':expansion=none:fontcolor=white:fontsize=20:line_spacing=6:x=(1920-text_w)/2:y={text_y}"
    ]
    
    vf = ",".join(filter_chains)
    
    cmd = [
        "ffmpeg", "-y",
        "-i", raw_mp4,
        "-i", audio_mp3,
        "-vf", vf,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        out_scene_mp4
    ]
    
    print(f"[{idx+1}/{total}] Compiling {scene_id}_master.mp4...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"ERROR on {scene_id}:")
        print("=== STDERR START ===")
        print(res.stderr)
        print("=== STDERR END ===")
        raise RuntimeError(f"FFmpeg failed on {scene_id}")
    return out_scene_mp4

def main():
    meta_path = os.path.join(AUDIO_DIR, "scenes_meta.json")
    with open(meta_path, "r", encoding="utf-8") as f:
        scenes = json.load(f)
        
    print(f"=== Starting Post-Production Video Assembly ({len(scenes)} scenes) ===")
    
    master_clips = []
    for idx, s in enumerate(scenes):
        clip_path = compose_scene(s, idx, len(scenes))
        master_clips.append(clip_path)
        
    # Create concat list
    concat_txt = os.path.join(VIDEO_DIR, "concat_list.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for c in master_clips:
            safe_path = c.replace("\\", "/")
            f.write(f"file '{safe_path}'\n")
            
    temp_concat_mp4 = os.path.join(VIDEO_DIR, "all_scenes_concat.mp4").replace("\\", "/")
    print("\nConcatenating all master clips into single continuous track...")
    subprocess.run([
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_txt,
        "-c", "copy",
        temp_concat_mp4
    ], check=True)
    
    # Mix background ambient horror track
    bg_music = os.path.join(AUDIO_DIR, "background_music.wav").replace("\\", "/")
    print("\nMixing atmospheric horror background music with dialogue bed...")
    
    subprocess.run([
        "ffmpeg", "-y",
        "-i", temp_concat_mp4,
        "-stream_loop", "-1",
        "-i", bg_music,
        "-filter_complex",
        "[0:a]volume=1.0[voice];[1:a]volume=0.18[music];[voice][music]amix=inputs=2:duration=first[aout]",
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "256k",
        OUTPUT_MP4
    ], check=True)
    
    size_mb = os.path.getsize(OUTPUT_MP4) / (1024 * 1024)
    print(f"\n=======================================================")
    print(f"[SUCCESS] FINAL PROJECT DEMO VIDEO CREATED SUCCESSFULLY!")
    print(f"Location: {OUTPUT_MP4}")
    print(f"File Size: {size_mb:.2f} MB")
    print(f"Resolution: 1920x1080 (1080p, 16:9)")
    print(f"=======================================================")

if __name__ == "__main__":
    main()
