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
await page.evaluate(() => {   // start from a clear runway so a passer-by can't block the key test
  const { me, navAt, hitDyn } = window.__journey;
  for (let r = 0; r < 120; r += 4) for (let a = 0; a < 16; a++) {
    const x0 = me.x + Math.cos(a) * r, y0 = me.y + Math.sin(a) * r; let ok = true;
    for (let d = -1; d <= 9 && ok; d += .5) if (navAt(x0 + d, y0) || hitDyn(x0 + d, y0)) ok = false;
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
if (moved < 3) errors.push(`avatar did not move with keys (moved ${moved.toFixed(2)} m)`);
if (!a1.follow || camGap > 8) errors.push('camera is not following the avatar');
// held 'd' also works on its own, and tired legs are slower than fresh ones
const holdRun = async energy => {
  await page.evaluate(({ a0, energy }) => { const { me, STAT } = window.__journey; me.x = me.dx = a0.x; me.y = me.dy = a0.y; me.spd = 0; me.path = null; STAT.energy = energy; }, { a0, energy });
  await page.keyboard.down('d'); await page.keyboard.down('Shift'); await settle(450);
  const sp = await page.evaluate(() => window.__journey.me.spd); await page.keyboard.up('Shift'); await page.keyboard.up('d'); await settle(100);
  return sp;
};
const fresh = await holdRun(100), tired = await holdRun(0);
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
  me.x = me.dx = h.x + 1; me.y = me.dy = h.y; me.spd = 8; bumpInto(h, 8);
  const person = { stagger: me.bumpT > 0, slowed: me.spd < 3, said: bubbles.some(b => b.owner === h && /^bump_/.test(b.l.id)) };
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
// goals: reaching a place advances the goal and pays out
const goals = await page.evaluate(async () => {
  const { me, STAT, GOALS, nearestFree, goalPos } = window.__journey, wait = ms => new Promise(r => setTimeout(r, ms)), out = [];
  STAT.goal = 0; STAT.wallet = 300;
  for (let i = 0; i < 2; i++) {
    const p = goalPos(), f = nearestFree(p[0], p[1], 60); me.x = me.dx = f[0]; me.y = me.dy = f[1]; me.spd = 0; me.path = null;
    await wait(500); out.push({ goal: STAT.goal, wallet: STAT.wallet });
  }
  await wait(500);
  return { out, shown: document.getElementById('goalTxt').textContent, next: GOALS[STAT.goal]?.bn };
});
console.log(`Goals: ${goals.out.map(o => `goal ${o.goal} wallet ${o.wallet}`).join(' → ')}; shown "${goals.shown}"`);
if (goals.out[0].goal !== 1 || goals.out[0].wallet !== 300 || goals.out[1].goal !== 2 || goals.out[1].wallet !== 400 || goals.shown !== goals.next) errors.push('goal progression/payout wrong: ' + JSON.stringify(goals));
await page.evaluate(() => { const { me, STAT, nearestFree } = window.__journey; STAT.wallet = 777; STAT.energy = 64; const f = nearestFree(me.x, me.y, 60); me.x = me.dx = f[0]; me.y = me.dy = f[1]; });
await step('08-avatar-closeup', () => page.evaluate(() => { window.__journey.cam.tz = 16; }));

// save/load check: change state, reload, confirm it was restored
await page.evaluate(() => { document.getElementById('btnBld').click(); const s = document.getElementById('timeSlider'); s.value = 15.5; s.dispatchEvent(new Event('input')); });
await new Promise(r => setTimeout(r, 3500));
const before = await page.evaluate(() => ({ b: document.getElementById('btnBld').textContent, f: document.getElementById('facing').textContent, x: window.__journey.me.x, y: window.__journey.me.y, w: window.__journey.STAT.wallet, e: window.__journey.STAT.energy, g: window.__journey.STAT.goal }));
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => !document.getElementById('loading'), { timeout: 30000 });
await new Promise(r => setTimeout(r, 2500));
const after = await page.evaluate(() => ({ b: document.getElementById('btnBld').textContent, f: document.getElementById('facing').textContent, clock: document.getElementById('clockEn').textContent, x: window.__journey.me.x, y: window.__journey.me.y, follow: window.__journey.cam.follow === window.__journey.me, w: window.__journey.STAT.wallet, e: window.__journey.STAT.energy, g: window.__journey.STAT.goal }));
const saveOk = before.b === after.b && before.f === after.f && /^3:/.test(after.clock) && Math.hypot(before.x - after.x, before.y - after.y) < 1 && after.follow && before.w === after.w && before.g === after.g && Math.abs(before.e - after.e) < 4;
console.log(`Save/load: ${saveOk ? 'restored' : 'NOT restored'} (${after.b}, ${after.f}, ${after.clock}, avatar ${before.x.toFixed(1)},${before.y.toFixed(1)} -> ${after.x.toFixed(1)},${after.y.toFixed(1)}, following=${after.follow}, wallet ${before.w} -> ${after.w}, energy ${before.e.toFixed(0)} -> ${after.e.toFixed(0)}, goal ${before.g} -> ${after.g})`);
if (!saveOk) errors.push('save/load did not restore state');
await browser.close();
server.close();

console.log(`Load: ${loadMs} ms`);
for (const r of results) console.log(`${r.view.padEnd(18)} ${r.fps.toFixed(0)} fps`);
console.log(`Screenshots: ${path.relative(ROOT, OUT)}/`);
if (errors.length) { console.log(`\nFAIL — ${errors.length} error(s):`); for (const e of errors) console.log('  ' + e); process.exit(1); }
console.log('\nPASS — no errors');
