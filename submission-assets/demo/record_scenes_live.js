const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');

const demoDir = 'C:\\Agentforge-AI\\submission-assets\\demo';
const clipsDir = path.join(demoDir, 'live_clips');
if (!fs.existsSync(clipsDir)) fs.mkdirSync(clipsDir, { recursive: true });

function apiPost(apiPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: apiPath,
      method: 'POST',
      headers: {
        'x-agentforge-request': '1',
        'origin': 'http://127.0.0.1:3000'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

const cursorInitScript = () => {
  window.addEventListener('DOMContentLoaded', () => {
    // 100% standard desktop browser scale
    document.documentElement.style.zoom = '1.25';

    const cursor = document.createElement('div');
    cursor.id = 'playwright-mouse-cursor';
    cursor.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 22px; height: 22px;
      border: 2px solid #38bdf8;
      background: rgba(56, 189, 248, 0.45);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999999;
      transform: translate(-100px, -100px);
      transition: transform 0.05s linear, background 0.1s ease, box-shadow 0.1s ease;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.7);
    `;
    document.body.appendChild(cursor);

    window.addEventListener('mousemove', e => {
      cursor.style.left = (e.clientX / 1.25 - 11) + 'px';
      cursor.style.top = (e.clientY / 1.25 - 11) + 'px';
    });
    window.addEventListener('mousedown', () => {
      cursor.style.transform = 'scale(0.75)';
      cursor.style.background = 'rgba(34, 211, 238, 0.9)';
      cursor.style.boxShadow = '0 0 16px rgba(34, 211, 238, 1)';
    });
    window.addEventListener('mouseup', () => {
      cursor.style.transform = 'scale(1)';
      cursor.style.background = 'rgba(56, 189, 248, 0.45)';
      cursor.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.7)';
    });
  });
};

async function smoothMove(page, startX, startY, endX, endY, durationMs = 600) {
  const steps = Math.max(10, Math.floor(durationMs / 25));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const x = startX + (endX - startX) * ease;
    const y = startY + (endY - startY) * ease;
    await page.mouse.move(x, y);
    await page.waitForTimeout(durationMs / steps);
  }
}

async function clickAt(page, x, y, delay = 120) {
  await page.mouse.move(x, y);
  await page.waitForTimeout(80);
  await page.mouse.down();
  await page.waitForTimeout(delay);
  await page.mouse.up();
}

async function recordScene(sceneNum, targetDurationSec, actionFn) {
  console.log(`\n--- Recording Scene ${sceneNum} (target duration: ${targetDurationSec}s) ---`);
  const sceneOutDir = path.join(clipsDir, `scene_${sceneNum}`);
  if (fs.existsSync(sceneOutDir)) fs.rmSync(sceneOutDir, { recursive: true, force: true });
  fs.mkdirSync(sceneOutDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const context = await browser.newContext({
    recordVideo: { dir: sceneOutDir, size: { width: 1920, height: 1080 } },
    viewport: { width: 1920, height: 1080 },
    acceptDownloads: true
  });

  const page = await context.newPage();
  await page.addInitScript(cursorInitScript);

  const startTime = Date.now();
  await actionFn(page);
  const elapsed = (Date.now() - startTime) / 1000;
  
  if (elapsed < targetDurationSec) {
    const remain = (targetDurationSec - elapsed) * 1000;
    console.log(`  Waiting remaining ${remain.toFixed(0)}ms to fill target duration...`);
    await page.waitForTimeout(remain);
  }

  await page.close();
  await context.close();
  await browser.close();

  // Find recorded webm - pick the largest file (downloads can create a 2KB stub webm)
  const files = fs.readdirSync(sceneOutDir)
    .filter(f => f.endsWith('.webm'))
    .sort((a, b) => fs.statSync(path.join(sceneOutDir, b)).size - fs.statSync(path.join(sceneOutDir, a)).size);
  if (files.length > 0) {
    const src = path.join(sceneOutDir, files[0]);
    const dst = path.join(clipsDir, `raw_scene_${sceneNum}.webm`);
    fs.copyFileSync(src, dst);
    console.log(`  Scene ${sceneNum} recorded: ${dst} (${fs.statSync(dst).size} bytes)`);
  } else {
    console.error(`  Scene ${sceneNum} recording failed!`);
  }
}

async function main() {
  const targetScene = process.argv[2] ? parseInt(process.argv[2]) : null;

  // Scene durations:
  // Scene 1: 23.39s
  // Scene 2: 18.46s
  // Scene 3: 23.90s
  // Scene 4: 17.09s
  // Scene 5: 23.58s
  // Scene 6: 22.80s
  // Scene 7: 15.27s

  // Reset task store before starting if full run or scene 1
  if (!targetScene || targetScene === 1) {
    console.log('Resetting task store...');
    await apiPost('/api/tasks/reset');
  }

  // --- SCENE 1: Intro & Overview (23.39s) ---
  if (!targetScene || targetScene === 1) {
  await recordScene(1, 23.4, async (page) => {
    let curX = 960, curY = 540;
    await page.goto('http://127.0.0.1:3000/?task=task_calc-vault&tab=overview');
    await page.waitForTimeout(1000);

    // Cursor moves to header logo
    await smoothMove(page, curX, curY, 150, 35, 800);
    curX = 150; curY = 35;
    await page.waitForTimeout(1800);

    // Move to Nebius x NVIDIA Hackathon banner
    await smoothMove(page, curX, curY, 280, 35, 600);
    curX = 280; curY = 35;
    await page.waitForTimeout(1800);

    // Move to Nemotron badge in navbar
    await smoothMove(page, curX, curY, 1400, 35, 800);
    curX = 1400; curY = 35;
    await page.waitForTimeout(2000);

    // Move to Left Task Queue (Workspaces)
    await smoothMove(page, curX, curY, 120, 240, 800);
    curX = 120; curY = 240;
    await page.waitForTimeout(2500);

    // Move down to CalcVault card
    await smoothMove(page, curX, curY, 120, 360, 700);
    curX = 120; curY = 360;
    await page.waitForTimeout(2500);

    // Move into CalcVault title in main area
    await smoothMove(page, curX, curY, 400, 130, 800);
    curX = 400; curY = 130;
    await page.waitForTimeout(2500);

    // Move to loop monitor & security guardrails on right rail
    await smoothMove(page, curX, curY, 1450, 260, 800);
    curX = 1450; curY = 260;
    await page.waitForTimeout(3000);
  });
  }

  // --- SCENE 2: CalcVault Selection & Problem Analysis (18.46s) ---
  if (!targetScene || targetScene === 2) {
  await recordScene(2, 18.5, async (page) => {
    let curX = 960, curY = 540;
    await page.goto('http://127.0.0.1:3000/?task=task_calc-vault&tab=overview');
    await page.waitForTimeout(1000);

    // Move to Task Objective
    await smoothMove(page, curX, curY, 350, 260, 800);
    curX = 350; curY = 260;
    await page.waitForTimeout(1500);

    // Hover over bug 1 (safeDivide)
    await smoothMove(page, curX, curY, 450, 310, 700);
    curX = 450; curY = 310;
    await page.waitForTimeout(2500);

    // Hover over bug 2 (compound interest)
    await smoothMove(page, curX, curY, 450, 360, 700);
    curX = 450; curY = 360;
    await page.waitForTimeout(2500);

    // Move to target files
    await smoothMove(page, curX, curY, 500, 540, 700);
    curX = 500; curY = 540;
    await page.waitForTimeout(2000);

    // Move to Start Repair Run button and hover
    const startBtn = await page.$('button:has-text("Start Repair Run")');
    if (startBtn) {
      const box = await startBtn.boundingBox();
      if (box) {
        await smoothMove(page, curX, curY, box.x + box.width / 2, box.y + box.height / 2, 700);
        curX = box.x + box.width / 2; curY = box.y + box.height / 2;
      }
    }
    await page.waitForTimeout(3000);
  });
  }

  // --- SCENE 3: Model Settings & Live Nebius Diagnostic (23.90s) ---
  if (!targetScene || targetScene === 3) {
  await recordScene(3, 23.9, async (page) => {
    let curX = 960, curY = 540;
    await page.goto('http://127.0.0.1:3000/?task=task_calc-vault&tab=overview');
    await page.waitForTimeout(800);

    // Move to "Model & Settings" in navbar
    const settingsLink = await page.waitForSelector('a[href="/settings"]');
    const sBox = await settingsLink.boundingBox();
    if (sBox) {
      await smoothMove(page, curX, curY, sBox.x + sBox.width / 2, sBox.y + sBox.height / 2, 700);
      curX = sBox.x + sBox.width / 2; curY = sBox.y + sBox.height / 2;
      await clickAt(page, curX, curY);
    }
    await page.goto('http://127.0.0.1:3000/settings');
    await page.waitForTimeout(1200);

    // In settings, move to Test Connection button
    const testBtn = await page.waitForSelector('button:has-text("Test Connection")');
    const tBox = await testBtn.boundingBox();
    if (tBox) {
      await smoothMove(page, curX, curY, tBox.x + tBox.width / 2, tBox.y + tBox.height / 2, 800);
      curX = tBox.x + tBox.width / 2; curY = tBox.y + tBox.height / 2;
      await page.waitForTimeout(500);
      await clickAt(page, curX, curY);
      console.log('  Clicked Test Connection button in Settings...');
    }

    // Wait for the live API response to show the green badge and latency
    await page.waitForTimeout(4500);

    // Find and hover over the green "Nebius Connection Healthy" badge
    const badge = await page.$('text=Nebius Connection Healthy');
    if (badge) {
      const bBox = await badge.boundingBox();
      if (bBox) {
        await smoothMove(page, curX, curY, bBox.x + bBox.width / 2, bBox.y + bBox.height / 2, 700);
        curX = bBox.x + bBox.width / 2; curY = bBox.y + bBox.height / 2;
      }
    }
    await page.waitForTimeout(2500);

    // Move to Server-Side Secret Isolation card (masked key)
    const keyCard = await page.$('text=Server-Isolated');
    if (keyCard) {
      const kBox = await keyCard.boundingBox();
      if (kBox) {
        await smoothMove(page, curX, curY, kBox.x + kBox.width / 2, kBox.y + kBox.height / 2, 700);
        curX = kBox.x + kBox.width / 2; curY = kBox.y + kBox.height / 2;
      }
    }
    await page.waitForTimeout(3000);

    // Move down to NVIDIA Nemotron catalog cards
    await smoothMove(page, curX, curY, 700, 850, 800);
    await page.waitForTimeout(3000);
  });
  }

  // --- SCENE 4: Autonomous Plan Formulating (21.72s) ---
  if (!targetScene || targetScene === 4) {
  console.log('Pre-generating 5-phase plan on server for Scene 4...');
  await apiPost('/api/tasks/task_calc-vault/plan');

  await recordScene(4, 21.8, async (page) => {
    let curX = 960, curY = 540;
    await page.goto('http://127.0.0.1:3000/?task=task_calc-vault&tab=overview');
    await page.waitForTimeout(1000);

    // Move to "Plan (5)" tab button and click it!
    const planTab = await page.waitForSelector('button:has-text("Plan")', { timeout: 6000 });
    const pBox = await planTab.boundingBox();
    if (pBox) {
      await smoothMove(page, curX, curY, pBox.x + pBox.width / 2, pBox.y + pBox.height / 2, 700);
      curX = pBox.x + pBox.width / 2; curY = pBox.y + pBox.height / 2;
      await clickAt(page, curX, curY);
    }
    console.log('  Clicked Plan (5) tab...');
    await page.waitForTimeout(1200);

    // Inspect all 5 phases smoothly
    // Phase 1: Context Analysis & Failing Assertions
    await smoothMove(page, curX, curY, 450, 290, 700);
    curX = 450; curY = 290;
    await page.waitForTimeout(2200);

    // Phase 2: Patch Formulation
    await smoothMove(page, curX, curY, 450, 410, 700);
    curX = 450; curY = 410;
    await page.waitForTimeout(2200);

    // Phase 3: Patch Application
    await smoothMove(page, curX, curY, 450, 530, 700);
    curX = 450; curY = 530;
    await page.waitForTimeout(2200);

    // Phase 4: Test Suite Execution
    await smoothMove(page, curX, curY, 450, 640, 700);
    curX = 450; curY = 640;
    await page.waitForTimeout(2200);

    // Phase 5: Verification & Report
    await smoothMove(page, curX, curY, 450, 750, 700);
    curX = 450; curY = 750;
    await page.waitForTimeout(2500);

    // Glide toward right rail Approval Gate Active
    await smoothMove(page, curX, curY, 1450, 250, 700);
    curX = 1450; curY = 250;
    await page.waitForTimeout(2000);
  });
  }

  // --- SCENE 5: Code Diff & Human Approval Gate (23.58s) ---
  if (!targetScene || targetScene === 5) {
  await apiPost('/api/tasks/task_calc-vault/plan');
  await recordScene(5, 23.6, async (page) => {
    let curX = 500, curY = 200;
    await page.goto('http://127.0.0.1:3000/?task=task_calc-vault&tab=diff');
    await page.waitForTimeout(1000);

    // Cursor starts on diff tab, moves into diff content
    await smoothMove(page, curX, curY, 450, 450, 700);
    curX = 450; curY = 450;
    await page.waitForTimeout(1500);

    // Smooth scroll down to reveal fixed safeDivide and compound interest
    for (let scroll = 0; scroll <= 280; scroll += 20) {
      await page.mouse.wheel(0, 20);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(2500);

    // Scroll back up to the Human Approval Gate card
    for (let scroll = 0; scroll <= 280; scroll += 30) {
      await page.mouse.wheel(0, -30);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(1500);

    // Move to Human Approval Gate banner
    await smoothMove(page, curX, curY, 350, 250, 700);
    curX = 350; curY = 250;
    await page.waitForTimeout(2500);

    // Move to "Approve & Run Tests" green button and hover
    const approveBtn = await page.waitForSelector('button:has-text("Approve & Run Tests")');
    const aBox = await approveBtn.boundingBox();
    if (aBox) {
      await smoothMove(page, curX, curY, aBox.x + aBox.width / 2, aBox.y + aBox.height / 2, 700);
      curX = aBox.x + aBox.width / 2; curY = aBox.y + aBox.height / 2;
    }
    await page.waitForTimeout(3500);
  });
  }

  // --- SCENE 6: Approve & 143ms Real Test Execution (22.80s) ---
  if (!targetScene || targetScene === 6) {
  await apiPost('/api/tasks/task_calc-vault/plan');
  await recordScene(6, 22.8, async (page) => {
    let curX = 500, curY = 300;
    await page.goto('http://127.0.0.1:3000/?task=task_calc-vault&tab=diff');
    await page.waitForTimeout(1000);

    // Move to "Approve & Run Tests" button and click it!
    const approveBtn = await page.waitForSelector('button:has-text("Approve & Run Tests")', { timeout: 8000 });
    const box = await approveBtn.boundingBox();
    if (box) {
      await smoothMove(page, curX, curY, box.x + box.width / 2, box.y + box.height / 2, 700);
      curX = box.x + box.width / 2; curY = box.y + box.height / 2;
      await page.waitForTimeout(300);
      await clickAt(page, curX, curY);
    }
    console.log('  Clicked Approve & Run Tests...');

    // Wait for the Tests & Evidence view to display live results
    await page.waitForTimeout(2000);

    // Ensure Tests & Evidence tab is active
    const testsTabBtn = await page.$('button:has-text("Tests & Evidence")');
    if (testsTabBtn) {
      const tBox = await testsTabBtn.boundingBox();
      if (tBox) {
        await clickAt(page, tBox.x + tBox.width / 2, tBox.y + tBox.height / 2);
        curX = tBox.x + tBox.width / 2; curY = tBox.y + tBox.height / 2;
      }
      await page.waitForTimeout(800);
    }

    // Move to Exit Code 0 card
    await smoothMove(page, curX, curY, 320, 310, 700);
    curX = 320; curY = 310;
    await page.waitForTimeout(2000);

    // Move to Duration: 143ms card!
    await smoothMove(page, curX, curY, 520, 310, 700);
    curX = 520; curY = 310;
    await page.waitForTimeout(2500);

    // Move to Passed Assertions: 5 / 5
    await smoothMove(page, curX, curY, 720, 310, 700);
    curX = 720; curY = 310;
    await page.waitForTimeout(2000);

    // Glide down through the 5 green passing test assertions
    await smoothMove(page, curX, curY, 450, 440, 600);
    curX = 450; curY = 440;
    await page.waitForTimeout(1200);

    await smoothMove(page, curX, curY, 450, 500, 600);
    curX = 450; curY = 500;
    await page.waitForTimeout(1200);

    await smoothMove(page, curX, curY, 450, 560, 600);
    curX = 450; curY = 560;
    await page.waitForTimeout(1200);

    await smoothMove(page, curX, curY, 450, 620, 600);
    curX = 450; curY = 620;
    await page.waitForTimeout(1200);

    await smoothMove(page, curX, curY, 450, 680, 600);
    curX = 450; curY = 680;
    await page.waitForTimeout(1500);
  });
  }

  // --- SCENE 7: Final Evidence Synthesis & Patch Export (15.27s) ---
  if (!targetScene || targetScene === 7) {
  // Ensure task is in completed verified state for Final Report tab
  await apiPost('/api/tasks/task_calc-vault/plan');
  await apiPost('/api/tasks/task_calc-vault/approve');

  await recordScene(7, 15.3, async (page) => {
    let curX = 960, curY = 540;
    await page.goto('http://127.0.0.1:3000/?task=task_calc-vault&tab=overview');
    await page.waitForTimeout(800);

    // Click Final Report tab button
    const reportTabBtn = await page.waitForSelector('button:has-text("Final Report")', { timeout: 6000 });
    const repBox = await reportTabBtn.boundingBox();
    if (repBox) {
      await smoothMove(page, curX, curY, repBox.x + repBox.width / 2, repBox.y + repBox.height / 2, 600);
      curX = repBox.x + repBox.width / 2; curY = repBox.y + repBox.height / 2;
      await clickAt(page, curX, curY);
    }
    await page.waitForTimeout(1200);

    // Hover over Evidence-Backed Verification Synthesis card
    await smoothMove(page, curX, curY, 500, 310, 700);
    curX = 500; curY = 310;
    await page.waitForTimeout(2000);

    // Scroll down to view verified behaviors
    for (let scroll = 0; scroll <= 160; scroll += 20) {
      await page.mouse.wheel(0, 20);
      await page.waitForTimeout(70);
    }
    await page.waitForTimeout(2000);

    // Scroll up to Export .patch button
    for (let scroll = 0; scroll <= 160; scroll += 30) {
      await page.mouse.wheel(0, -30);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(1000);

    // Move to cyan "Export .patch" button, hover and click!
    const exportBtn = await page.$('button:has-text("Export .patch")');
    if (exportBtn) {
      const expBox = await exportBtn.boundingBox();
      if (expBox) {
        await smoothMove(page, curX, curY, expBox.x + expBox.width / 2, expBox.y + expBox.height / 2, 600);
        curX = expBox.x + expBox.width / 2; curY = expBox.y + expBox.height / 2;
        await Promise.all([
          page.waitForEvent('download', { timeout: 4000 }).catch(() => null),
          clickAt(page, curX, curY)
        ]);
      }
    }
    await page.waitForTimeout(2000);
    console.log('  Clicked Export .patch button...');
  });
  }

  console.log('\n=== ALL 7 LIVE SCENES RECORDED SUCCESSFULLY ===');
}

main().catch(err => {
  console.error('Recording error:', err);
  process.exit(1);
});
