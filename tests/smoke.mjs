// Smoke test: serve the folder, load index.test.html (the game plus a test handle) in headless Chrome, report errors,
// drive the game, screenshot the main views into tests/out/ and compare them with thumbnails in tests/reference/
// (UPDATE_REFS=1 re-approves them), and repeat the key screens at phone size.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'tests', 'out');
const CHROME = process.env.CHROME_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find(p => fs.existsSync(p));
if (!CHROME) { console.error('No Chrome or Chromium found. Set CHROME_PATH to its executable.'); process.exit(2); }
const REF = path.join(ROOT, 'tests', 'reference'), UPDATE = process.env.UPDATE_REFS === '1';
fs.mkdirSync(REF, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.wav': 'audio/wav', '.mp3': 'audio/mpeg' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const url = `http://localhost:${server.address().port}/index.test.html`;   // the same build plus the test handle
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
/* steady pictures: no pencil "boil" (reduced motion) and a seeded Math.random, so the crowds start the same way each run */
const steady = async pg => { await pg.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]); await pg.evaluateOnNewDocument(() => { let s = 20261001; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }); };
const page = await browser.newPage();
await steady(page);
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
/* wait for the scene to finish what it is doing: toast gone, camera arrived, a few frames drawn */
const settled = pg => pg.waitForFunction(() => { const j = window.__journey; if (!j || !j.loaded()) return false; const c = j.cam; return document.getElementById('toast').hidden && Math.abs(c.zoom - c.tz) < .02 * c.tz && Math.hypot(c.x - c.tx, c.y - c.ty) < .3; }, { timeout: 10000 })
  .then(() => pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))))));
/* compare a screenshot with its approved 96-px-wide thumbnail: catches blank or broken scenes and big layout changes, shrugs off moving traffic */
const THRESH = { mad: 11, bad: .10, dev: 8 };   // the same scene varies by at most ~6.5 / 4% between runs
const cmp = (pg, curB64, refB64) => pg.evaluate(async (curB64, refB64, w) => {
  const load = async b => { const i = new Image(); i.src = 'data:image/png;base64,' + b; await i.decode(); return i; };
  const cur = await load(curB64), h = Math.round(w * cur.naturalHeight / cur.naturalWidth);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high'; x.drawImage(cur, 0, 0, w, h);
  const A = x.getImageData(0, 0, w, h).data, thumb = c.toDataURL('image/png').split(',')[1];
  let m = 0; const lum = new Float32Array(w * h); for (let i = 0; i < w * h; i++) { lum[i] = .3 * A[i * 4] + .59 * A[i * 4 + 1] + .11 * A[i * 4 + 2]; m += lum[i]; } m /= w * h;
  let v = 0; for (let i = 0; i < w * h; i++) v += (lum[i] - m) ** 2; const dev = Math.sqrt(v / (w * h));
  if (!refB64) return { thumb, dev };
  const ref = await load(refB64); if (ref.naturalWidth !== w || ref.naturalHeight !== h) return { thumb, dev, size: true };
  x.clearRect(0, 0, w, h); x.drawImage(ref, 0, 0); const B = x.getImageData(0, 0, w, h).data; let sum = 0, bad = 0;
  for (let i = 0; i < w * h; i++) { const d = (Math.abs(A[i * 4] - B[i * 4]) + Math.abs(A[i * 4 + 1] - B[i * 4 + 1]) + Math.abs(A[i * 4 + 2] - B[i * 4 + 2])) / 3; sum += d; if (d > 40) bad++; }
  return { thumb, dev, mad: sum / (w * h), bad: bad / (w * h) };
}, curB64, refB64, 96);
const looks = [];
const compareRef = async (pg, name, file) => {
  const refFile = path.join(REF, `${name}.png`), have = fs.existsSync(refFile);
  const r = await cmp(pg, fs.readFileSync(file).toString('base64'), have && !UPDATE ? fs.readFileSync(refFile).toString('base64') : null);
  if (!have || UPDATE) { fs.writeFileSync(refFile, Buffer.from(r.thumb, 'base64')); looks.push(`${name}: reference ${have ? 'updated' : 'created'}`); return; }
  looks.push(`${name}: diff ${r.mad === undefined ? 'size changed' : r.mad.toFixed(1) + ' / ' + (r.bad * 100).toFixed(0) + '% cells'}, contrast ${r.dev.toFixed(0)}`);
  if (r.dev < THRESH.dev) errors.push(`${name}: the picture looks blank (contrast ${r.dev.toFixed(1)})`);
  if (r.size) errors.push(`${name}: screenshot size differs from its reference (run UPDATE_REFS=1 if intended)`);
  else if (r.mad > THRESH.mad || r.bad > THRESH.bad) errors.push(`${name}: differs from the approved reference (mean diff ${r.mad.toFixed(1)}, ${(r.bad * 100).toFixed(0)}% of cells); run UPDATE_REFS=1 if the change is intended`);
};
/* a screenshot is taken at a fixed hour with the world paused, so the sky and shadows are the same every run */
const HOURS = { '07-night': 21 }, hourFor = name => HOURS[name] ?? (/^(09|10|11)/.test(name) ? 10 : 8.5);
const pause = (pg, on) => pg.evaluate(on => { const b = document.getElementById('btnPause'); if ((b.getAttribute('aria-pressed') === 'true') !== on) b.click(); }, on);
const shot = async (name, pg = page) => {
  const fixed = !/^08/.test(name);   // 08 follows the avatar through a live crowd, so it is only a picture to look at
  if (fixed) { await pg.evaluate(h => { const s = document.getElementById('timeSlider'); s.value = h; s.dispatchEvent(new Event('input')); }, hourFor(name)); await pause(pg, true); }
  await settled(pg); const file = path.join(OUT, `${name}.png`); await pg.screenshot({ path: file });
  if (fixed) { await compareRef(pg, name, file); await pause(pg, false); }
};
const click = id => page.click('#' + id);
const setHour = h => page.evaluate(h => { const s = document.getElementById('timeSlider'); s.value = h; s.dispatchEvent(new Event('input')); }, h);

const results = [];
const renderMs = () => page.evaluate(() => { const { render, inside } = window.__journey; if (inside()) return 0; const n = 20, t = performance.now(); for (let i = 0; i < n; i++) render(); return (performance.now() - t) / n; });
const step = async (name, fn) => { if (fn) await fn(); await shot(name); results.push({ view: name, fps: await fps(), ms: await renderMs() }); };
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
await page.evaluate(() => {   // start from a clear runway so a passer-by can't block the key test
  const { me, navAt, hitDyn, cellAt } = window.__journey;
  for (let r = 0; r < 120; r += 4) for (let a = 0; a < 16; a++) {
    const x0 = me.x + Math.cos(a) * r, y0 = me.y + Math.sin(a) * r; let ok = true;
    for (let d = -1; d <= 9 && ok; d += .5) if (navAt(x0 + d, y0) || hitDyn(x0 + d, y0) || cellAt(x0 + d, y0) !== 1) ok = false;   // footpath only, no traffic
    if (ok) { me.x = me.dx = x0; me.y = me.dy = y0; return; }
  }
});
await settle(1200);
const a0 = await pos();
await page.keyboard.down('ArrowRight'); await settle(900); await page.keyboard.up('ArrowRight'); await settle(800);
const a1 = await pos();
const moved = Math.hypot(a1.x - a0.x, a1.y - a0.y);
const camGap = Math.hypot(a1.cx - a1.x, a1.cy - a1.y);
console.log(`Avatar keys: moved ${moved.toFixed(1)} m, camera ${camGap.toFixed(1)} m from avatar, following=${a1.follow}`);
if (moved < 2.5) errors.push(`avatar did not move with keys (moved ${moved.toFixed(2)} m): ` + JSON.stringify(await page.evaluate(() => { const { me, cam, STAT } = window.__journey; return { inside: window.__journey.inside(), spd: me.spd, hit: me.hit ? (me.hit.T ? 'vehicle' : me.hit.stall ? 'hawker' : 'person') : null, energy: STAT.energy, follow: cam.follow === me, zoom: cam.zoom, active: document.activeElement && document.activeElement.id }; })));
if (!a1.follow || camGap > 8) errors.push('camera is not following the avatar');
// held 'd' also works on its own, and tired legs are slower than fresh ones
const holdRun = async energy => {
  await page.evaluate(({ a0, energy }) => { const { me, STAT } = window.__journey; me.x = me.dx = a0.x; me.y = me.dy = a0.y; me.spd = 0; me.path = null; STAT.energy = energy; }, { a0, energy });
  await page.keyboard.down('d'); await page.keyboard.down('Shift'); await settle(450);
  const sp = await page.evaluate(() => window.__journey.me.spd); await page.keyboard.up('Shift'); await page.keyboard.up('d'); await settle(100);
  return sp;
};
let fresh = 0; for (let tries = 0; tries < 3 && fresh < 5; tries++) fresh = await holdRun(100);   // a passer-by can legitimately block a try
const tired = await holdRun(0);
console.log(`Energy: fresh run ${fresh.toFixed(1)} m/s, exhausted ${tired.toFixed(1)} m/s`);
if (!(fresh > 0)) errors.push('avatar speed is zero while a key is held');
if (!(tired > 0 && tired < fresh * .7)) errors.push(`exhausted avatar should be much slower (${tired.toFixed(1)} vs ${fresh.toFixed(1)} m/s)`);
await page.evaluate(() => { const { me, STAT } = window.__journey; me.spd = 0; STAT.energy = 100; });
// the status bar shows what the game state says, and walking drains energy
await page.evaluate(() => { window.__journey.STAT.energy = 60; window.__journey.STAT.wallet = 300; });
await settle(900);
const ui = await page.evaluate(() => ({ wallet: document.getElementById('wallet').textContent, fill: parseFloat(document.getElementById('energyFill').style.width), goal: document.getElementById('goalTxt').textContent, clock: document.getElementById('clockEn').textContent }));
console.log(`Status bar: wallet ${ui.wallet}, energy ${ui.fill.toFixed(0)}%, goal "${ui.goal}", clock ${ui.clock}`);
if (!/300|৩০০/.test(ui.wallet) || ui.fill < 55 || ui.fill > 66 || !ui.goal || !ui.clock) errors.push('status bar does not match game state: ' + JSON.stringify(ui));
const drain = await page.evaluate(() => { const { STAT, updEnergy } = window.__journey; STAT.energy = 80; for (let i = 0; i < 30; i++) updEnergy(1 / 30, 1, false); const walk = 80 - STAT.energy; STAT.energy = 80; for (let i = 0; i < 30; i++) updEnergy(1 / 30, 1, true); return { walk, run: 80 - STAT.energy }; });
console.log(`Energy cost of 30 m: walking ${drain.walk.toFixed(2)}, running ${drain.run.toFixed(2)}`);
if (!(drain.walk > .2 && drain.run > drain.walk * 1.5)) errors.push('walking should cost energy and running more: ' + JSON.stringify(drain));
await page.evaluate(() => { window.__journey.STAT.energy = 100; });
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
// plazas, campuses and the station hall are walkable now; the pond, tracks and columns are not
const plazas = await page.evaluate(() => {
  const { sites, FW, navAt, nearestFree, findPath } = window.__journey, out = { free: {} };
  for (const name of ['baitul', 'kamalapur', 'ndc', 'mgbhs', 'green']) {
    const F = sites[name]; if (!F) continue; let free = 0, total = 0;
    for (let a = 2; a < F.L - 2; a += 2) for (let b = 2; b < F.D - 2; b += 2) { const p = FW(F, a, b); total++; if (!navAt(p[0], p[1])) free++; }
    out.free[name] = +(free / total).toFixed(2);
  }
  const K = sites.kamalapur, G = sites.green, B = sites.baitul;
  if (K) { const r = FW(K, 50, 90), h = FW(K, 22.5, 19.5), col = FW(K, 28, 25); out.rails = navAt(r[0], r[1]); out.hall = !navAt(h[0], h[1]); out.column = navAt(col[0], col[1]); }
  if (G) { const c = FW(G, G.L * .42, G.D * .55); out.pond = navAt(c[0], c[1]); }
  if (B) { const a = nearestFree(...FW(B, 8, 8), 8), b = nearestFree(...FW(B, B.L - 8, B.D - 8), 8); out.route = !!(a && b && findPath(a[0], a[1], b[0], b[1])); }
  return out;
});
console.log(`Plazas: free share ${JSON.stringify(plazas.free)}; pond ${plazas.pond ? 'solid' : 'OPEN'}, tracks ${plazas.rails ? 'solid' : 'OPEN'}, station hall ${plazas.hall ? 'open' : 'BLOCKED'}, column ${plazas.column ? 'solid' : 'OPEN'}, route across Baitul plaza ${plazas.route ? 'found' : 'NONE'}`);
for (const [n, f] of Object.entries(plazas.free)) if (f < .4) errors.push(`site ${n} is still mostly blocked (${f})`);
if (!plazas.pond || !plazas.rails || !plazas.hall || !plazas.column || !plazas.route) errors.push('site details wrong: ' + JSON.stringify(plazas));
// walled-in targets: walk as close as possible instead of giving up
const partial = await page.evaluate(() => {
  const { findPath, nearestFree } = window.__journey; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60; i++) {
    const a = nearestFree((rnd() - .5) * 700, (rnd() - .5) * 700, 20), b = nearestFree((rnd() - .5) * 700, (rnd() - .5) * 700, 20); if (!a || !b) continue;
    const p = findPath(a[0], a[1], b[0], b[1]);
    if (p && p.partial) { const end = p[p.length - 1]; return { start: Math.hypot(a[0] - b[0], a[1] - b[1]), end: Math.hypot(end[0] - b[0], end[1] - b[1]) }; }
  }
  return null;
});
console.log(`Walled-in target: ${partial ? `route ends ${partial.end.toFixed(0)} m from it (started ${partial.start.toFixed(0)} m away)` : 'no partial route found'}`);
if (!partial || partial.end > partial.start * .8) errors.push('unreachable targets should still get a route to the nearest reachable ground: ' + JSON.stringify(partial));
// tap-to-go: click empty ground 25-70 m away (skipping spots with a person or vehicle under the tap), expect the avatar to arrive (A* around obstacles)
await page.evaluate(() => { const { me, cam, nearestFree, cellAt } = window.__journey; let f0 = null; for (let r = 0; r < 80 && !f0; r += 2) for (let a = 0; a < 16 && !f0; a++) { const g = nearestFree(Math.cos(a) * r, -60 + Math.sin(a) * r, 1); if (g && cellAt(g[0], g[1]) === 1) f0 = g; } f0 = f0 || nearestFree(0, -60, 60); me.x = me.dx = f0[0]; me.y = me.dy = f0[1]; me.path = null; cam.follow = me; cam.tz = 6.5; });
await settle(2500);
const spots = await page.evaluate(() => {
  const { me, nearestFree, findPath, toScreen, peds, vehicles, fixedPeople, cellAt } = window.__journey;
  const near = (x, y) => { const s = toScreen(x, y); return [...peds, ...vehicles, ...fixedPeople].some(o => { const p = toScreen(o.dx ?? o.x, o.dy ?? o.y); return Math.hypot(p[0] - s[0], p[1] - s[1]) < 60; }); };
  const out = [];
  for (let r = 25; r <= 70; r += 5) for (let a = 0; a < 16; a++) {
    const x = me.x + Math.cos(a) * r, y = me.y + Math.sin(a) * r, g = nearestFree(x, y, 2);
    if (!g || Math.hypot(g[0] - x, g[1] - y) > .1 ) continue; const s = toScreen(x, y);
    if (s[0] > 120 && s[0] < innerWidth - 300 && s[1] > 120 && s[1] < innerHeight - 120 && !near(x, y) && findPath(me.x, me.y, x, y)) out.push({ x, y, sx: s[0], sy: s[1], walk: cellAt(x, y) === 1 });
  }
  out.sort((a, b) => b.walk - a.walk);   // footpath spots first: a road crossing can legitimately be held up by traffic
  return out.slice(0, 6);
});
let tapped = null, miss = 99;
for (const sp of spots.slice(0, 3)) {
  await page.evaluate(() => { const { me, cam, nearestFree, cellAt } = window.__journey; let f0 = null; for (let r = 0; r < 80 && !f0; r += 2) for (let a = 0; a < 16 && !f0; a++) { const g = nearestFree(Math.cos(a) * r, -60 + Math.sin(a) * r, 1); if (g && cellAt(g[0], g[1]) === 1) f0 = g; } f0 = f0 || nearestFree(0, -60, 60); me.x = me.dx = f0[0]; me.y = me.dy = f0[1]; me.path = null; me.spd = 0; cam.follow = me; });
  await settle(400);
  await page.mouse.click(sp.sx, sp.sy); await settle(150);
  if (!(await page.evaluate(() => !!window.__journey.me.path))) continue;
  tapped = sp;
  await page.waitForFunction(() => !window.__journey.me.path, { timeout: 25000 }).catch(() => {});
  await settle(500);
  const end = await pos(); miss = Math.hypot(end.x - sp.x, end.y - sp.y);
  if (miss <= 3) break;   // traffic can legitimately stop a walk across a road; try the next spot
}
if (!tapped) errors.push('tap-to-go: tapping empty ground did not start a walk');
else {
  console.log(`Avatar tap-to-go: arrived ${miss.toFixed(1)} m from the tapped spot`);
  if (miss > 3) errors.push(`tap-to-go ended ${miss.toFixed(1)} m from the target`);
}

// sprint 5: bodies are solid, crowds give way, hard bumps get a reaction
const bodies = await page.evaluate(() => {
  const { me, nearestFree, navAt, stepMove, hitDyn, vehicles, fixedPeople, peds } = window.__journey;
  const out = {};
  // walk straight at a parked vehicle, then at a hawker, from each side; neither may be entered
  const approach = (target, cx, cy) => {   // try each side; report the best attempt that actually touched the target
    let best = null;
    for (const [ux, uy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (const r of [3, 4, 5]) {
      const sx = cx + ux * r, sy = cy + uy * r; if (navAt(sx, sy) || hitDyn(sx, sy)) continue;
      me.x = me.dx = sx; me.y = me.dy = sy; me.path = null; let hit = null;
      for (let i = 0; i < 40; i++) { const dx = cx - me.x, dy = cy - me.y, d = Math.hypot(dx, dy) || 1; stepMove(dx / d * .3, dy / d * .3); if (me.hit) hit = me.hit; }
      const res = { hit: !!hit, isTarget: hit === target, inside: !!hitDyn(me.x, me.y), dist: Math.hypot(cx - me.x, cy - me.y) };
      if (res.inside || (res.isTarget && !best?.isTarget) || !best) best = res; if (res.inside) return res;
    }
    return best;
  };
  for (const v of vehicles.filter(v => v.hx !== undefined && v.parked && v.T && Math.abs(v.dx) < 300 && Math.abs(v.dy) < 300).slice(0, 8)) {
    v.dx = v.x; v.dy = v.y; const r = approach(v, v.dx, v.dy); if (r && (!out.vehicle || (r.isTarget && !out.vehicle.isTarget))) out.vehicle = r; if (out.vehicle?.isTarget) break;
  }
  for (const h of fixedPeople.filter(f => f.stall && !f.hidden).slice(0, 8)) {
    const r = approach(h, h.x, h.y); if (r && (!out.hawker || (r.isTarget && !out.hawker.isTarget))) out.hawker = r; if (out.hawker?.isTarget) break;
  }
  // crowd gives way: freeze one walker, stand a metre from it, step the yield logic, expect a sidestep
  const cand = peds.filter(p => p.st === 'walk' && !p.onRoad && Math.abs(p.dx) < 200);
  for (const p of cand) {
    const f = nearestFree(p.dx + 1, p.dy, 1); if (!f || navAt(f[0], f[1])) continue;
    me.x = me.dx = f[0]; me.y = me.dy = f[1]; me.spd = 0;
    for (let i = 0; i < 40; i++) window.__journey.updYield(1 / 30);
    const g = Math.hypot(p.gx || 0, p.gy || 0);
    if (g > .2) { out.yield = { g }; me.x = me.dx = me.x + 20; me.y = me.dy = me.y + 20; for (let i = 0; i < 90; i++) window.__journey.updYield(1 / 30); out.yield.after = Math.hypot(p.gx || 0, p.gy || 0); break; }
  }
  return out;
});
const bump = await page.evaluate(() => {
  const { me, bumpInto, bubbles, fixedPeople, vehicles } = window.__journey;
  const h = fixedPeople.find(f => f.stall && !f.hidden), v = vehicles.find(v => v.T && !v.parked && v.hx !== undefined);
  me.x = me.dx = h.x + 1; me.y = me.dy = h.y; let said = false; for (let i = 0; i < 4 && !said; i++) { me.spd = 8; h.sayUntil = 0; bumpInto(h, 8); said = bubbles.some(b => b.owner === h && /^bump_/.test(b.l.id)); }   // each line has a 9 s cooldown, so a second line may be needed
  const person = { stagger: me.bumpT > 0, slowed: me.spd < 3, said };
  v.honk = undefined; bumpInto(v, 8);
  return { ...person, honked: v.honk !== undefined };
});
console.log(`Bump: person ${bump.said ? 'spoke' : 'SILENT'}, vehicle ${bump.honked ? 'honked' : 'SILENT'}, avatar ${bump.stagger && bump.slowed ? 'staggered' : 'DID NOT STAGGER'}`);
if (!bump.said || !bump.honked || !bump.stagger || !bump.slowed) errors.push('bump reaction incomplete: ' + JSON.stringify(bump));
const fmt = o => o ? `${o.dist.toFixed(2)} m from centre, ${o.inside ? 'INSIDE' : 'outside'}` : 'no spot';
console.log(`Bodies: vehicle ${fmt(bodies.vehicle)}, hawker ${fmt(bodies.hawker)}, yield ${bodies.yield ? `${bodies.yield.g.toFixed(2)} m aside, back to ${bodies.yield.after.toFixed(2)} m` : 'NONE'}`);
if (!bodies.vehicle || bodies.vehicle.inside || !bodies.vehicle.isTarget) errors.push('avatar can walk through a vehicle (or never touched it)');
if (!bodies.hawker || bodies.hawker.inside || !bodies.hawker.isTarget) errors.push('avatar can walk through a hawker (or never touched one)');
if (!bodies.yield || bodies.yield.after > .1) errors.push('walkers do not step aside and settle back');
await page.evaluate(() => { const { me, nearestFree } = window.__journey; const f = nearestFree(me.x, me.y, 60); if (f) { me.x = me.dx = f[0]; me.y = me.dy = f[1]; } me.spd = 0; me.path = null; });
// goals: the fountain pays nothing, eating at the hotel is next (tested below), then the bank pays 100
const goalAt = (n) => page.evaluate(async n => {
  const { me, STAT, nearestFree, goalPos } = window.__journey, wait = ms => new Promise(r => setTimeout(r, ms));
  const p = goalPos(), f = nearestFree(p[0], p[1], 60); me.x = me.dx = f[0]; me.y = me.dy = f[1]; me.spd = 0; me.path = null;
  await wait(600); return { goal: STAT.goal, wallet: STAT.wallet };
}, n);
await page.evaluate(() => { const { STAT } = window.__journey; STAT.goal = 0; STAT.wallet = 300; STAT.ate = false; });
const g1 = await goalAt();
console.log(`Goals: fountain -> goal ${g1.goal}, wallet ${g1.wallet}`);
if (g1.goal !== 1 || g1.wallet !== 300) errors.push('fountain goal should advance to the hotel goal for free: ' + JSON.stringify(g1));

// restaurant: prompt, enter, order, closed hours, tap-to-enter, leave
const resto = await page.evaluate(() => { const { RESTO, MENU } = window.__journey; return RESTO.st ? { name: RESTO.st.name[1], dishes: MENU.length, open: RESTO.st.open, entry: RESTO.entry } : null; });
if (!resto) errors.push('no restaurant was generated');
else {
  const J = () => page.evaluate(() => { const j = window.__journey; return { inside: j.inside(), state: j.restoState(), wallet: j.STAT.wallet, energy: j.STAT.energy, hour: j.hour(), goal: j.STAT.goal, ate: j.STAT.ate, btn: !document.getElementById('btnEnter').hidden, btnText: document.getElementById('btnEnter').textContent, btnOff: document.getElementById('btnEnter').disabled, overlay: !document.getElementById('inside').hidden, dishes: [...document.querySelectorAll('#dishes .dish')].map(b => b.disabled) }; });
  const toEntry = () => page.evaluate(() => { const { me, RESTO } = window.__journey; me.x = me.dx = RESTO.entry[0]; me.y = me.dy = RESTO.entry[1]; me.spd = 0; me.path = null; });
  await toEntry(); await settle(600);
  const near = await J();
  await page.evaluate(() => { const { me, RESTO, nearestFree } = window.__journey; const f = nearestFree(RESTO.entry[0] + 40, RESTO.entry[1], 30); me.x = me.dx = f[0]; me.y = me.dy = f[1]; });
  await settle(500); const far = await J();
  console.log(`Restaurant: ${resto.name}; prompt near=${near.btn ? '"' + near.btnText + '"' : 'HIDDEN'} far=${far.btn ? 'SHOWN' : 'hidden'}`);
  if (!near.btn || near.state !== 1 || near.btnOff || far.btn) errors.push('enter prompt should show next to the hotel and only there: ' + JSON.stringify({ near, far }));
  // closed in the small hours
  await setHour(3); await settle(900); await toEntry(); await settle(500); const shut = await J();
  console.log(`Restaurant at 3 AM: state ${shut.state}, button ${shut.btnOff ? 'disabled' : 'ENABLED'}`);
  if (shut.state !== 2 || !shut.btnOff) errors.push('hotel should be closed at 3 AM');
  await page.keyboard.press('Enter'); await settle(200); if ((await J()).inside) errors.push('walked into a closed hotel');
  await setHour(10); await settle(900); await toEntry(); await settle(500);
  // walk in with the Enter key
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); const { STAT } = window.__journey; STAT.energy = 30; STAT.wallet = 300; });
  await page.keyboard.press('Enter'); await settle(500);
  const inn = await J();
  console.log(`Inside: ${inn.inside ? 'yes' : 'NO'}, overlay ${inn.overlay ? 'shown' : 'HIDDEN'}, ${inn.dishes.length} dishes`);
  if (!inn.inside || !inn.overlay || inn.dishes.length !== resto.dishes) errors.push('Enter key did not take the avatar inside: ' + JSON.stringify(inn));
  await step('09-restaurant');
  // order rice and dal: pays 80, +35 energy, 20 minutes pass
  const h0 = (await J()).hour; await page.click('#dishes .dish[data-i="0"]'); await settle(300);
  const mid = await J(); await settle(2600);
  const done = await J();
  const dh = ((done.hour - h0 + 24) % 24) * 60;
  console.log(`Order: wallet ${mid.wallet} then ${done.wallet}, energy ${done.energy.toFixed(0)}, ${dh.toFixed(0)} min passed, buttons while eating ${mid.dishes.every(Boolean) ? 'locked' : 'OPEN'}`);
  if (mid.wallet !== 220 || !mid.dishes.every(Boolean)) errors.push('ordering should charge at once and lock the menu while eating: ' + JSON.stringify(mid));
  if (Math.abs(done.energy - 65) > .5 || Math.abs(dh - 20) > 1.5 || !done.ate) errors.push(`meal effects wrong: energy ${done.energy}, minutes ${dh}, ate ${done.ate}`);
  // leave with Escape, the goal moves on, you are still at the door
  await page.keyboard.press('Escape'); await settle(700);
  const out = await J();
  console.log(`Leaving: inside ${out.inside}, goal ${out.goal}`);
  if (out.inside || out.overlay || out.goal !== 2) errors.push('leaving did not close the hotel or advance the goal: ' + JSON.stringify(out));
  // can't afford / not hungry
  const probe = async (wallet, energy) => { await page.evaluate(([w, e]) => { const { STAT } = window.__journey; STAT.wallet = w; STAT.energy = e; }, [wallet, energy]); await settle(150); await page.keyboard.press('Enter'); await settle(300); const r = await J(); await page.keyboard.press('Escape'); await settle(300); return r.dishes; };
  const poor = await probe(5, 30), full = await probe(300, 100);
  console.log(`Menu limits: broke -> ${poor.map(d => d ? 'x' : 'ok').join(' ')}; full -> ${full.map(d => d ? 'x' : 'ok').join(' ')}`);
  if (!poor.every(Boolean) || !(full[0] && full[3] && !full[4])) errors.push('menu should lock what you cannot afford, and meals (not tea) when you are full');
  // tap the hotel from 30 m away: walk over and go in
  await page.evaluate(() => { const { me, cam, RESTO, nearestFree } = window.__journey; const f = nearestFree(RESTO.entry[0] + 30, RESTO.entry[1] + 4, 30); me.x = me.dx = f[0]; me.y = me.dy = f[1]; me.path = null; me.spd = 0; cam.follow = me; cam.tz = 10; });
  await settle(2200);
  let tapIn = false;
  for (let attempt = 0; attempt < 4 && !tapIn; attempt++) {
    await page.evaluate(() => { const { me, cam, RESTO, nearestFree } = window.__journey; const f = nearestFree(RESTO.entry[0] + 30, RESTO.entry[1] + 4, 30); me.x = me.dx = f[0]; me.y = me.dy = f[1]; me.path = null; me.spd = 0; cam.follow = me; cam.tz = 10; });
    await settle(2200);
    const pt = await page.evaluate(() => {
      const { RESTO, toScreen, peds, vehicles, fixedPeople } = window.__journey, st = RESTO.st;
            let best = null, bestAny = 0;   // scan the ground around the hotel for the point farthest from anyone
      for (let dx = -3; dx <= 3; dx += .6) for (let dy = -3; dy <= 3; dy += .6) {
        const x = RESTO.entry[0] + dx, y = RESTO.entry[1] + dy; if (Math.hypot(x - st.x, y - st.y) > 3.3) continue;
        const s = toScreen(x, y); let clear = 1e9;
        for (const o of [...peds, ...vehicles, ...fixedPeople]) { const p = toScreen(o.dx ?? o.x, o.dy ?? o.y); clear = Math.min(clear, Math.hypot(p[0] - s[0], p[1] - s[1])); }
        bestAny = Math.max(bestAny, clear);
        if (clear > 27 && (!best || clear > best.clear)) best = { x: s[0], y: s[1], clear };   // pick() grabs anyone within 22 px
      }
      if (best) return best;
      return { none: true, bestAny, zoom: window.__journey.cam.zoom, follow: window.__journey.who() };
      return null;
    });
    if (pt.none) { console.log('  no clear spot:', JSON.stringify(pt)); continue; }
    await page.mouse.click(pt.x, pt.y);
    tapIn = await page.waitForFunction(() => window.__journey.inside(), { timeout: 20000 }).then(() => true).catch(() => false);
    if (!tapIn) console.log('  tap attempt failed:', JSON.stringify(await page.evaluate(pt => { const j = window.__journey; return { click: pt, who: j.who(), path: j.me.path && j.me.path.length, enter: j.me.enterOnArrive, state: j.restoState(), pos: [j.me.x, j.me.y], entry: j.RESTO.entry, open: j.RESTO.st.open, hour: j.hour() }; }, pt)));
  }
  console.log(`Tap the hotel: ${tapIn ? 'walked over and went in' : 'DID NOT GO IN'}`);
  if (!tapIn) errors.push('tapping the hotel from a distance did not take the avatar inside');
  await page.keyboard.press('Escape'); await settle(500);
}
// bank goal pays 100
const g2 = await goalAt();
console.log(`Goals: bank -> goal ${g2.goal}, wallet ${g2.wallet}`);
if (g2.goal !== 3 || g2.wallet !== 400) errors.push('bank goal should pay 100 and move on: ' + JSON.stringify(g2));
await page.evaluate(() => { const { me, STAT, nearestFree } = window.__journey; STAT.wallet = 777; STAT.energy = 64; window.__journey.cam.follow = me; const f = nearestFree(me.x, me.y, 60); me.x = me.dx = f[0]; me.y = me.dy = f[1]; });
await step('08-avatar-closeup', () => page.evaluate(() => { window.__journey.cam.tz = 16; }));

// save/load check: change state, reload, confirm it was restored
await page.evaluate(() => { document.getElementById('btnBld').click(); const s = document.getElementById('timeSlider'); s.value = 15.5; s.dispatchEvent(new Event('input')); });
await page.evaluate(() => window.__journey.saveState());   // the game also saves every 3 s; save now instead of sleeping
const before = await page.evaluate(() => ({ b: document.getElementById('btnBld').textContent, f: document.getElementById('facing').textContent, x: window.__journey.me.x, y: window.__journey.me.y, w: window.__journey.STAT.wallet, e: window.__journey.STAT.energy, g: window.__journey.STAT.goal }));
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => window.__journey && window.__journey.loaded(), { timeout: 30000 });
await settled(page);
const after = await page.evaluate(() => ({ b: document.getElementById('btnBld').textContent, f: document.getElementById('facing').textContent, hour: window.__journey.hour(), x: window.__journey.me.x, y: window.__journey.me.y, follow: window.__journey.cam.follow === window.__journey.me, w: window.__journey.STAT.wallet, e: window.__journey.STAT.energy, g: window.__journey.STAT.goal }));
const saveOk = before.b === after.b && before.f === after.f && Math.abs(after.hour - 15.5) < .5 && Math.hypot(before.x - after.x, before.y - after.y) < 1 && after.follow && before.w === after.w && before.g === after.g && Math.abs(before.e - after.e) < 4;
console.log(`Save/load: ${saveOk ? 'restored' : 'NOT restored'} (${after.b}, ${after.f}, hour ${after.hour.toFixed(1)}, avatar ${before.x.toFixed(1)},${before.y.toFixed(1)} -> ${after.x.toFixed(1)},${after.y.toFixed(1)}, following=${after.follow}, wallet ${before.w} -> ${after.w}, energy ${before.e.toFixed(0)} -> ${after.e.toFixed(0)}, goal ${before.g} -> ${after.g})`);
if (!saveOk) errors.push('save/load did not restore state');
// phone-sized run in a fresh browser context (no saved state): layout, status bar and the hotel menu must fit a 390x780 screen
const ctx2 = await browser.createBrowserContext(), phone = await ctx2.newPage();
await steady(phone);
await phone.setViewport({ width: 390, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
phone.on('pageerror', e => errors.push(`phone pageerror: ${e.message}`));
phone.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`phone console: ${m.text()}`); });
await phone.goto(url, { waitUntil: 'load' });
await phone.waitForFunction(() => window.__journey && window.__journey.loaded() && !document.getElementById('loading'), { timeout: 30000 });
await phone.evaluate(() => { const s = document.getElementById('timeSlider'); s.value = 10; s.dispatchEvent(new Event('input')); });
await shot('10-phone-default', phone);
const lay = await phone.evaluate(() => {
  const R = sel => document.querySelector(sel).getBoundingClientRect(), fits = b => b.left >= 0 && b.right <= innerWidth && b.top >= 0 && b.bottom <= innerHeight;
  const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  return { overflow: document.documentElement.scrollWidth > innerWidth, status: fits(R('#status')), title: fits(R('.title')), buttons: fits(R('#toolsToggle')) && fits(R('#soundFab')), clash: hit(R('.title'), R('#soundFab')) || hit(R('.title'), R('#toolsToggle')) || hit(R('#status'), R('#soundFab')) || hit(R('#status'), R('#toolsToggle')) };
});
console.log(`Phone layout: ${lay.overflow ? 'SCROLLS SIDEWAYS' : 'no sideways scroll'}, status ${lay.status ? 'fits' : 'CUT OFF'}, title ${lay.title ? 'fits' : 'CUT OFF'}, buttons ${lay.buttons ? 'fit' : 'CUT OFF'}, ${lay.clash ? 'PANELS OVERLAP' : 'no overlap'}`);
if (lay.overflow || !lay.status || !lay.title || !lay.buttons || lay.clash) errors.push('phone layout broken: ' + JSON.stringify(lay));
await phone.evaluate(() => { const { me, RESTO, enterRestaurant } = window.__journey; me.x = me.dx = RESTO.entry[0]; me.y = me.dy = RESTO.entry[1]; me.spd = 0; me.path = null; });
await phone.waitForFunction(() => window.__journey.restoState() === 1, { timeout: 5000 });
await phone.evaluate(() => window.__journey.enterRestaurant());
await phone.waitForFunction(() => window.__journey.inside(), { timeout: 5000 });
await new Promise(r => setTimeout(r, 400));
const menu = await phone.evaluate(() => { const R = id => document.getElementById(id).getBoundingClientRect(), fits = b => b.left >= 0 && b.right <= innerWidth && b.top >= 0 && b.bottom <= innerHeight; const m = R('menu'), l = R('btnLeave'); return { menu: fits(m), leave: l.bottom <= innerHeight && l.top >= 0, scrolls: document.getElementById('menu').scrollHeight > document.getElementById('menu').clientHeight }; });
console.log(`Phone hotel menu: ${menu.menu ? 'fits the screen' : 'CUT OFF'}, Leave button ${menu.leave ? 'visible' : 'HIDDEN'}${menu.scrolls ? ' (menu scrolls)' : ''}`);
if (!menu.menu || !menu.leave) errors.push('phone hotel menu does not fit: ' + JSON.stringify(menu));
await shot('11-phone-restaurant', phone);
await ctx2.close();
await browser.close();
server.close();

console.log(`Load: ${loadMs} ms`);
for (const r of results) { console.log(`${r.view.padEnd(18)} ${r.fps.toFixed(0)} fps (capped at the display rate), draw cost ${r.ms.toFixed(1)} ms/frame`); if (r.ms > 60) errors.push(`${r.view}: drawing a frame took ${r.ms.toFixed(0)} ms`); }
for (const l of looks) console.log('  ' + l);
console.log(`Screenshots: ${path.relative(ROOT, OUT)}/`);
if (errors.length) { console.log(`\nFAIL — ${errors.length} error(s):`); for (const e of errors) console.log('  ' + e); process.exit(1); }
console.log('\nPASS — no errors');
