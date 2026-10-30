import puppeteer from 'puppeteer-core';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('../screenshots');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  console.log('🎈 Launching headless Chrome to capture UI screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  // 1. Home / Hero Screenshot
  console.log('📸 Capturing Hero & Platform...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.waitForTimeout ? page.waitForTimeout(1500) : new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-hero-showcase.png') });

  // 2. Game Grid Section
  console.log('📸 Capturing Game Grid...');
  const gameSection = await page.$('#games-section');
  if (gameSection) {
    await gameSection.scrollIntoView();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-choose-your-game.png') });
  }

  // 3. Game 1: The Red Balloon
  console.log('📸 Capturing The Red Balloon gameplay...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  // Click first play now
  const playButtons = await page.$$('button');
  for (const btn of playButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('THE RED BALLOON')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-the-red-balloon-game.png') });

  // 4. Game 3: The Lost Carnival
  console.log('📸 Capturing The Lost Carnival...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  // Scroll and find Lost Carnival play button
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.horror-card'));
    const carnivalCard = cards.find(c => c.textContent.includes('The Lost Carnival'));
    if (carnivalCard) {
      const btn = carnivalCard.querySelector('button');
      if (btn) btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-the-lost-carnival.png') });

  // 5. Game 5: Day of the Dead
  console.log('📸 Capturing Day of the Dead Ofrenda...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.horror-card'));
    const dodCard = cards.find(c => c.textContent.includes('Day of the Dead'));
    if (dodCard) {
      const btn = dodCard.querySelector('button');
      if (btn) btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-day-of-the-dead-ofrenda.png') });

  // 6. Game 6: Ghost Story Teller
  console.log('📸 Capturing Ghost Story Teller AI Forge...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.horror-card'));
    const gstCard = cards.find(c => c.textContent.includes('Ghost Story Teller'));
    if (gstCard) {
      const btn = gstCard.querySelector('button');
      if (btn) btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-ghost-story-teller.png') });

  console.log('✨ All UI screenshots captured successfully!');
  await browser.close();
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
