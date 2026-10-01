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

await browser.close();
server.close();

console.log(`Load: ${loadMs} ms`);
for (const r of results) console.log(`${r.view.padEnd(18)} ${r.fps.toFixed(0)} fps`);
console.log(`Screenshots: ${path.relative(ROOT, OUT)}/`);
if (errors.length) { console.log(`\nFAIL — ${errors.length} error(s):`); for (const e of errors) console.log('  ' + e); process.exit(1); }
console.log('\nPASS — no errors');
