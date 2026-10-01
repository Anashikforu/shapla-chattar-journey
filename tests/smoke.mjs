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
if (moved < 3) errors.push(`avatar did not move with keys (moved ${moved.toFixed(2)} m): ` + JSON.stringify(await page.evaluate(() => { const { me, cam, STAT } = window.__journey; return { inside: window.__journey.inside(), spd: me.spd, hit: me.hit ? (me.hit.T ? 'vehicle' : me.hit.stall ? 'hawker' : 'person') : null, energy: STAT.energy, follow: cam.follow === me, zoom: cam.zoom, active: document.activeElement && document.activeElement.id }; })));
if (!a1.follow || camGap > 8) errors.push('camera is not following the avatar');
// held 'd' also works on its own, and tired legs are slower than fresh ones
const holdRun = async energy => {
  await page.evaluate(({ a0, energy }) => { const { me, STAT } = window.__journey; me.x = me.dx = a0.x; me.y = me.dy = a0.y; me.spd = 0; me.path = null; STAT.energy = energy; }, { a0, energy });
  await page.keyboard.down('d'); await page.keyboard.down('Shift'); await settle(450);
  const sp = await page.evaluate(() => window.__journey.me.spd); await page.keyboard.up('Shift'); await page.keyboard.up('d'); await settle(100);
  return sp;
};
let fresh = 0; for (let tries = 0; tries < 3 && fresh < 8; tries++) fresh = await holdRun(100);   // a passer-by can legitimately block a try
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
