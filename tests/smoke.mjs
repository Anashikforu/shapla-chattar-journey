// Smoke test: serve the folder, load index.html in headless Chrome, report errors,
// measure frame rate, and screenshot the main views into tests/out/.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'tests', 'out');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.wav': 'audio/wav', '.mp3': 'audio/mpeg' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const url = `http://localhost:${server.address().port}/index.html`;
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 860 });
const errors = [];
page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`); });
page.on('response', r => { if (r.status() >= 400 && !/favicon\.ico$/.test(r.url())) errors.push(`HTTP ${r.status()}: ${r.url().replace(/^https?:\/\/[^/]+/, '')}`); });

const t0 = Date.now();
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => !document.getElementById('loading'), { timeout: 30000 });
const loadMs = Date.now() - t0;

const fps = () => page.evaluate(() => new Promise(r => { let n = 0; const t = performance.now(); const f = () => { n++; performance.now() - t < 2000 ? requestAnimationFrame(f) : r(n / 2); }; requestAnimationFrame(f); }));
const shot = async name => { await new Promise(r => setTimeout(r, 1500)); await page.screenshot({ path: path.join(OUT, `${name}.png`) }); };
const click = id => page.click('#' + id);
const setHour = h => page.evaluate(h => { const s = document.getElementById('timeSlider'); s.value = h; s.dispatchEvent(new Event('input')); }, h);

const results = [];
const step = async (name, fn) => { if (fn) await fn(); await shot(name); results.push({ view: name, fps: await fps() }); };
await step('01-default');
await step('02-turn-right', () => click('btnRotR'));
await step('03-street-level', () => click('btnAngle'));
await step('04-top-down', () => click('btnAngle'));
await step('05-bird-cutaway', async () => { await click('btnAngle'); await click('btnRotL'); await click('btnBld'); });
await step('06-footprints', () => click('btnBld'));
await step('07-night', async () => { await click('btnBld'); await setHour(21); });

// avatar checks: keyboard walk, camera follow, wall collision, tap-to-go, shot of the avatar close up
await setHour(10);
await page.evaluate(() => { document.getElementById('btnBld').textContent.includes('full') || document.getElementById('btnBld').click(); window.__journey.cam.tz = 14; });
const pos = () => page.evaluate(() => { const { me, cam } = window.__journey; return { x: me.x, y: me.y, follow: cam.follow === me, cx: cam.x, cy: cam.y }; });
const settle = ms => new Promise(r => setTimeout(r, ms));
await settle(1500);
const a0 = await pos();
await page.keyboard.down('ArrowRight'); await settle(900); await page.keyboard.up('ArrowRight'); await settle(800);
const a1 = await pos();
const moved = Math.hypot(a1.x - a0.x, a1.y - a0.y);
const camGap = Math.hypot(a1.cx - a1.x, a1.cy - a1.y);
console.log(`Avatar keys: moved ${moved.toFixed(1)} m, camera ${camGap.toFixed(1)} m from avatar, following=${a1.follow}`);
if (moved < 3) errors.push(`avatar did not move with keys (moved ${moved.toFixed(2)} m)`);
if (!a1.follow || camGap > 8) errors.push('camera is not following the avatar');
// held 'd' also works on its own
await page.keyboard.down('d'); await page.keyboard.down('Shift'); await settle(300);
const run = await page.evaluate(() => window.__journey.me.spd); await page.keyboard.up('Shift'); await page.keyboard.up('d');
if (!(run > 0)) errors.push('avatar speed is zero while a key is held');
await page.evaluate(() => { window.__journey.me.spd = 0; });
// walls: walking at a building from a free cell must stop at the wall
const wall = await page.evaluate(() => {
  const { me, navAt, nearestFree, stepMove, buildings, qCenter } = window.__journey;
  for (const b of buildings) {
    const c = qCenter(b.foot), f = nearestFree(c[0], c[1], 40);
    if (!f || !navAt(c[0], c[1])) continue;
    me.x = me.dx = f[0]; me.y = me.dy = f[1]; me.path = null;
    for (let i = 0; i < 60; i++) { const dx = c[0] - me.x, dy = c[1] - me.y, d = Math.hypot(dx, dy) || 1; stepMove(dx / d * 0.5, dy / d * 0.5); }
    return { inside: true, blocked: navAt(me.x, me.y) };
  }
  return null;
});
console.log(`Avatar walls: building centre ${wall ? 'blocked' : 'OPEN'}, avatar ${wall && !wall.blocked ? 'stayed outside' : 'CLIPPED IN'}`);
if (!wall || wall.blocked) errors.push('avatar can walk into buildings');
// tap-to-go: click empty ground 25-70 m away (skipping spots with a person or vehicle under the tap), expect the avatar to arrive (A* around obstacles)
await page.evaluate(() => { const { me, cam, nearestFree } = window.__journey; const f0 = nearestFree(0, -60, 60); me.x = me.dx = f0[0]; me.y = me.dy = f0[1]; me.path = null; cam.follow = me; cam.tz = 6.5; });
await settle(2500);
const spots = await page.evaluate(() => {
  const { me, nearestFree, findPath, toScreen, peds, vehicles, fixedPeople } = window.__journey;
  const near = (x, y) => { const s = toScreen(x, y); return [...peds, ...vehicles, ...fixedPeople].some(o => { const p = toScreen(o.dx ?? o.x, o.dy ?? o.y); return Math.hypot(p[0] - s[0], p[1] - s[1]) < 60; }); };
  const out = [];
  for (let r = 25; r <= 70; r += 5) for (let a = 0; a < 16; a++) {
    const x = me.x + Math.cos(a) * r, y = me.y + Math.sin(a) * r, g = nearestFree(x, y, 2);
    if (!g || Math.hypot(g[0] - x, g[1] - y) > .1) continue; const s = toScreen(x, y);
    if (s[0] > 120 && s[0] < innerWidth - 300 && s[1] > 120 && s[1] < innerHeight - 120 && !near(x, y) && findPath(me.x, me.y, x, y)) out.push({ x, y, sx: s[0], sy: s[1] });
  }
  return out.slice(0, 6);
});
let tapped = null;
for (const sp of spots) {
  await page.mouse.click(sp.sx, sp.sy); await settle(150);
  if (await page.evaluate(() => !!window.__journey.me.path)) { tapped = sp; break; }
}
if (!tapped) errors.push('tap-to-go: tapping empty ground did not start a walk');
else {
  await page.waitForFunction(() => !window.__journey.me.path, { timeout: 25000 }).catch(() => {});
  await settle(500);
  const end = await pos();
  const miss = Math.hypot(end.x - tapped.x, end.y - tapped.y);
  console.log(`Avatar tap-to-go: arrived ${miss.toFixed(1)} m from the tapped spot`);
  if (miss > 3) errors.push(`tap-to-go ended ${miss.toFixed(1)} m from the target`);
}
await step('08-avatar-closeup', () => page.evaluate(() => { window.__journey.cam.tz = 16; }));

// save/load check: change state, reload, confirm it was restored
await page.evaluate(() => { document.getElementById('btnBld').click(); const s = document.getElementById('timeSlider'); s.value = 15.5; s.dispatchEvent(new Event('input')); });
await new Promise(r => setTimeout(r, 3500));
const before = await page.evaluate(() => ({ b: document.getElementById('btnBld').textContent, f: document.getElementById('facing').textContent, x: window.__journey.me.x, y: window.__journey.me.y }));
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => !document.getElementById('loading'), { timeout: 30000 });
await new Promise(r => setTimeout(r, 2500));
const after = await page.evaluate(() => ({ b: document.getElementById('btnBld').textContent, f: document.getElementById('facing').textContent, clock: document.getElementById('clockEn').textContent, x: window.__journey.me.x, y: window.__journey.me.y, follow: window.__journey.cam.follow === window.__journey.me }));
const saveOk = before.b === after.b && before.f === after.f && /^3:/.test(after.clock) && Math.hypot(before.x - after.x, before.y - after.y) < 1 && after.follow;
console.log(`Save/load: ${saveOk ? 'restored' : 'NOT restored'} (${after.b}, ${after.f}, ${after.clock}, avatar ${before.x.toFixed(1)},${before.y.toFixed(1)} -> ${after.x.toFixed(1)},${after.y.toFixed(1)}, following=${after.follow})`);
if (!saveOk) errors.push('save/load did not restore state');
await browser.close();
server.close();

console.log(`Load: ${loadMs} ms`);
for (const r of results) console.log(`${r.view.padEnd(18)} ${r.fps.toFixed(0)} fps`);
console.log(`Screenshots: ${path.relative(ROOT, OUT)}/`);
if (errors.length) { console.log(`\nFAIL — ${errors.length} error(s):`); for (const e of errors) console.log('  ' + e); process.exit(1); }
console.log('\nPASS — no errors');
