const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('./frontend/node_modules/puppeteer-core');

const METADATA_PATH = path.resolve('demo_assets/audio/scenes_meta.json');
const VIDEO_DIR = path.resolve('demo_assets/video');

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function recordScene(page, sceneMeta, actionFn) {
  const outputMp4 = path.join(VIDEO_DIR, `${sceneMeta.id}_raw.mp4`);
  console.log(`\n========================================`);
  console.log(`RECORDING [${sceneMeta.id}]: ${sceneMeta.title}`);
  console.log(`Target Duration: ${sceneMeta.video_duration}s`);
  console.log(`========================================`);

  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '25',
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'veryfast',
    outputMp4
  ]);

  ffmpeg.stderr.on('data', () => {}); // silence pipe buffer

  const client = await page.target().createCDPSession();
  let active = true;

  client.on('Page.screencastFrame', async (frame) => {
    if (!active) return;
    try {
      const buf = Buffer.from(frame.data, 'base64');
      ffmpeg.stdin.write(buf);
      await client.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
    } catch (e) {}
  });

  await client.send('Page.startScreencast', { format: 'jpeg', quality: 85, everyNthFrame: 1 });

  const startTime = Date.now();
  const targetMs = sceneMeta.video_duration * 1000;

  // Execute scene actions
  try {
    await actionFn(page);
  } catch (err) {
    console.warn(`Warning during action for ${sceneMeta.id}:`, err.message);
  }

  // Keep recording until target duration is reached
  const elapsed = Date.now() - startTime;
  if (elapsed < targetMs) {
    await delay(targetMs - elapsed);
  }

  active = false;
  try {
    await client.send('Page.stopScreencast');
  } catch (e) {}
  
  ffmpeg.stdin.end();
  await new Promise(resolve => ffmpeg.on('close', resolve));
  await client.detach();

  const stats = fs.statSync(outputMp4);
  console.log(`[DONE] ${sceneMeta.id}_raw.mp4 recorded (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
}

async function main() {
  const scenes = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf-8'));
  
  console.log("Launching Headless Chrome for 1080p Gameplay Recording...");
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: [
      '--window-size=1920,1080',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--force-device-scale-factor=1'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Inject a continuous 30fps repaint trigger so Chrome emits screencast frames smoothly throughout gameplay
  await page.evaluate(() => {
    const pulse = document.createElement('div');
    pulse.id = '__paint_pulse';
    pulse.style.position = 'fixed';
    pulse.style.bottom = '0';
    pulse.style.right = '0';
    pulse.style.width = '2px';
    pulse.style.height = '2px';
    pulse.style.pointerEvents = 'none';
    pulse.style.zIndex = '9999999';
    document.body.appendChild(pulse);
    let count = 0;
    function tick() {
      count++;
      pulse.style.backgroundColor = count % 2 === 0 ? 'rgba(255,0,0,0.01)' : 'rgba(0,0,0,0.01)';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  // SCENE 1: INTRO
  await recordScene(page, scenes[0], async (p) => {
    await p.evaluate(() => {
      window.__setGame('home');
      window.__closeModals();
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await delay(2000);
    // Subtle breathing scroll
    await p.evaluate(() => window.scrollBy({ top: 120, behavior: 'smooth' }));
    await delay(4000);
    await p.evaluate(() => window.scrollBy({ top: -120, behavior: 'smooth' }));
  });

  // SCENE 2: HOMEPAGE & OVERVIEW
  await recordScene(page, scenes[1], async (p) => {
    await p.evaluate(() => {
      const el = document.getElementById('games');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 680, behavior: 'smooth' });
    });
    await delay(3000);
    // Hover across game cards
    await p.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await delay(3000);
  });

  // SCENE 3A: THE RED BALLOON
  await recordScene(page, scenes[2], async (p) => {
    await p.evaluate(() => {
      window.__closeModals();
      window.__setGame('red-balloon');
    });
    await delay(2000);
    // Click location or item
    await p.evaluate(() => {
      const locBtn = document.querySelector('button[title*="Town Square"], button[title*="Derelict"], button:has(.lucide-map-pin)') || document.querySelector('.bg-\\[\\#1F2937\\]\\/80');
      if (locBtn) locBtn.click();
    });
    await delay(3000);
    // Type in riddle input
    await p.evaluate(() => {
      const inp = document.querySelector('input[type="text"]');
      if (inp) {
        inp.value = "balloon";
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await delay(2000);
  });

  // SCENE 3B: HAUNTED MANSION
  await recordScene(page, scenes[3], async (p) => {
    await p.evaluate(() => {
      window.__closeModals();
      window.__setGame('haunted-mansion');
    });
    await delay(2500);
    await p.evaluate(() => {
      const searchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Search') || b.textContent.includes('Inspect') || b.textContent.includes('Enter'));
      if (searchBtn) searchBtn.click();
    });
    await delay(3000);
  });

  // SCENE 3C: THE LOST CARNIVAL
  await recordScene(page, scenes[4], async (p) => {
    await p.evaluate(() => {
      window.__closeModals();
      window.__setGame('lost-carnival');
    });
    await delay(2500);
    await p.evaluate(() => {
      const playBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Challenge') || b.textContent.includes('Enter') || b.textContent.includes('Play'));
      if (playBtn) playBtn.click();
    });
    await delay(3000);
  });

  // SCENE 3D: GHOST PARTY
  await recordScene(page, scenes[5], async (p) => {
    await p.evaluate(() => {
      window.__closeModals();
      window.__setGame('ghost-party');
    });
    await delay(2000);
    await p.evaluate(() => {
      const optBtn = document.querySelector('button.border-\\[\\#D6A56C\\]\\/40, button.bg-\\[\\#1F2937\\]\\/80');
      if (optBtn) optBtn.click();
    });
    await delay(2500);
  });

  // SCENE 3E: DAY OF THE DEAD
  await recordScene(page, scenes[6], async (p) => {
    await p.evaluate(() => {
      window.__closeModals();
      window.__setGame('day-of-the-dead');
    });
    await delay(2000);
    await p.evaluate(() => {
      const addCandle = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Candle') || b.textContent.includes('Offer'));
      if (addCandle) addCandle.click();
    });
    await delay(2500);
  });

  // SCENE 3F: GHOST STORY TELLER
  await recordScene(page, scenes[7], async (p) => {
    await p.evaluate(() => {
      window.__closeModals();
      window.__setGame('ghost-story-teller');
    });
    await delay(2000);
    await p.evaluate(() => {
      const genBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Generate') || b.textContent.includes('Awaken'));
      if (genBtn) genBtn.click();
    });
    await delay(4000);
  });

  // SCENE 3G: THE LOST KEY
  await recordScene(page, scenes[8], async (p) => {
    await p.evaluate(() => {
      window.__closeModals();
      window.__setGame('lost-key');
    });
    await delay(2000);
    await p.evaluate(() => {
      const hintBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Hint') || b.textContent.includes('Clue'));
      if (hintBtn) hintBtn.click();
    });
    await delay(2000);
    await p.evaluate(() => {
      const inp = document.querySelector('input[type="text"]');
      if (inp) {
        inp.value = "1988";
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await delay(2000);
  });

  // SCENE 4: AI ARCHITECTURE MODAL
  await recordScene(page, scenes[9], async (p) => {
    await p.evaluate(() => {
      window.__setGame('home');
      window.__openModal('ai');
    });
    await delay(3000);
  });

  // SCENE 5: OFFLINE PWA & PERSISTENCE
  await recordScene(page, scenes[10], async (p) => {
    await p.evaluate(() => {
      window.__closeModals();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    await delay(2500);
    await p.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await delay(2500);
  });

  // SCENE 6: ACHIEVEMENTS & AUDIO
  await recordScene(page, scenes[11], async (p) => {
    await p.evaluate(() => {
      window.__openModal('achievements');
    });
    await delay(3000);
  });

  // SCENE 7: FULL STACK ARCHITECTURE
  await recordScene(page, scenes[12], async (p) => {
    await p.evaluate(() => {
      window.__closeModals();
      // Inject Apple-style glassmorphic Architecture showcase overlay
      const overlay = document.createElement('div');
      overlay.id = '__arch_overlay';
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.backgroundColor = 'rgba(10, 14, 23, 0.96)';
      overlay.style.backdropFilter = 'blur(16px)';
      overlay.style.zIndex = '999999';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.padding = '40px';
      overlay.style.fontFamily = 'Inter, sans-serif';

      overlay.innerHTML = `
        <div style="max-width: 1100px; width: 100%; text-align: center;">
          <div style="display: inline-block; padding: 6px 18px; border-radius: 9999px; background: rgba(165,31,43,0.25); border: 1px solid #A51F2B; color: #F4E4CC; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
            Production Architecture Overview
          </div>
          <h1 style="font-family: Cinzel, serif; font-size: 44px; font-weight: 900; color: #F4E4CC; margin-bottom: 36px; text-shadow: 0 0 20px rgba(230,42,59,0.5);">
            IT'S PLAYTIME FULL-STACK ECOSYSTEM
          </h1>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: left;">
            <!-- Card 1 -->
            <div style="background: rgba(31, 41, 55, 0.6); border: 1px solid rgba(214, 165, 108, 0.3); border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <div style="font-size: 32px; margin-bottom: 12px;">⚛️</div>
              <h3 style="font-size: 20px; font-weight: bold; color: #F4E4CC; margin-bottom: 8px;">Frontend SPA</h3>
              <p style="font-size: 13px; color: #9CA3AF; line-height: 1.6;">
                React 18 &bull; Vite &bull; Tailwind CSS<br/>
                Web Audio procedural sound synthesizer<br/>
                Zero external graphic dependencies
              </p>
            </div>

            <!-- Card 2 -->
            <div style="background: rgba(31, 41, 55, 0.6); border: 1px solid rgba(214, 165, 108, 0.3); border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <div style="font-size: 32px; margin-bottom: 12px;">🐍</div>
              <h3 style="font-size: 20px; font-weight: bold; color: #F4E4CC; margin-bottom: 8px;">Backend API</h3>
              <p style="font-size: 13px; color: #9CA3AF; line-height: 1.6;">
                Python 3.13 &bull; Flask &bull; Gunicorn<br/>
                Modular Story & Riddle Services<br/>
                CORS-enabled REST endpoints
              </p>
            </div>

            <!-- Card 3 -->
            <div style="background: rgba(75, 16, 24, 0.7); border: 1px solid #A51F2B; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(165,31,43,0.3);">
              <div style="font-size: 32px; margin-bottom: 12px;">🧠</div>
              <h3 style="font-size: 20px; font-weight: bold; color: #F4E4CC; margin-bottom: 8px;">Local AI Model</h3>
              <p style="font-size: 13px; color: #F4E4CC; line-height: 1.6;">
                <strong>Qwen 2.5 3B Instruct</strong> via Ollama<br/>
                Zero paid tokens &bull; 100% Private<br/>
                Rich offline question & story fallback
              </p>
            </div>

            <!-- Card 4 -->
            <div style="background: rgba(31, 41, 55, 0.6); border: 1px solid rgba(214, 165, 108, 0.3); border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <div style="font-size: 32px; margin-bottom: 12px;">📱</div>
              <h3 style="font-size: 20px; font-weight: bold; color: #F4E4CC; margin-bottom: 8px;">Offline-First PWA</h3>
              <p style="font-size: 13px; color: #9CA3AF; line-height: 1.6;">
                Service Worker shell precaching<br/>
                IndexedDB progress & achievements<br/>
                Installable on Mobile, Tablet & Desktop
              </p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    });
    await delay(5000);
  });

  // SCENE 14: CLOSING
  await recordScene(page, scenes[13], async (p) => {
    await p.evaluate(() => {
      const arch = document.getElementById('__arch_overlay');
      if (arch) arch.remove();
      window.__closeModals();
      window.__setGame('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Add closing cinematic card
      const card = document.createElement('div');
      card.id = '__closing_card';
      card.style.position = 'fixed';
      card.style.bottom = '80px';
      card.style.left = '50%';
      card.style.transform = 'translateX(-50%)';
      card.style.backgroundColor = 'rgba(17, 24, 39, 0.94)';
      card.style.border = '2px solid #A51F2B';
      card.style.borderRadius = '16px';
      card.style.padding = '24px 48px';
      card.style.textAlign = 'center';
      card.style.boxShadow = '0 0 50px rgba(165,31,43,0.7)';
      card.style.zIndex = '99999';

      card.innerHTML = `
        <h2 style="font-family: Cinzel, serif; font-size: 32px; font-weight: 900; color: #F4E4CC; margin-bottom: 8px; letter-spacing: 3px;">
          YOU FLOAT, YOU PLAY, YOU SURVIVE.
        </h2>
        <div style="font-size: 16px; color: #D6A56C; margin-bottom: 12px; font-family: sans-serif;">
          🎈 Live Web Application: <strong style="color: #fff;">https://its-playtime-frontend.onrender.com/</strong>
        </div>
        <div style="font-size: 14px; color: #9CA3AF; font-family: monospace;">
          GitHub: https://github.com/Nitu-Bathyal/its-playtime
        </div>
      `;
      document.body.appendChild(card);
    });
    await delay(6000);
  });

  await browser.close();
  console.log("\n[SUCCESS] ALL 14 SCENES RECORDED IN FULL 1080P HD!");
}

main().catch(err => {
  console.error("FATAL ERROR IN RECORDING:", err);
  process.exit(1);
});
