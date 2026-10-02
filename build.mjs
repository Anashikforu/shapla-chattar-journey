// Build: concatenate src/shell-head.html + src/js/*.js (in name order) + src/shell-tail.html into index.html.
// `node build.mjs [out] [--hooks]`: --hooks adds the test handle (src/hooks/test-hooks.js); the shipped index.html never has it.
import fs from 'node:fs';
const args = process.argv.slice(2), hooks = args.includes('--hooks'), out = args.find(a => !a.startsWith('--')) || 'index.html';
const files = fs.readdirSync('src/js').filter(f => f.endsWith('.js')).sort();
const js = files.map(f => fs.readFileSync(`src/js/${f}`, 'utf8')).join('') + (hooks ? fs.readFileSync('src/hooks/test-hooks.js', 'utf8') : '');
const html = fs.readFileSync('src/shell-head.html', 'utf8') + js + fs.readFileSync('src/shell-tail.html', 'utf8');
fs.writeFileSync(out, html);
// voices/files.json lists every audio file in voices/, so the game loads them all even when voices.js is stale or missing clips
if (fs.existsSync('voices')) {
  const rank = ['mp3', 'ogg', 'm4a', 'webm', 'flac', 'wav'], best = new Map();   // one file per clip: the compressed one if there is one
  for (const f of fs.readdirSync('voices').filter(f => /\.(wav|mp3|ogg|m4a|webm|flac)$/i.test(f))) {
    const stem = f.replace(/\.[a-z0-9]+$/i, ''), r = rank.indexOf(f.split('.').pop().toLowerCase());
    if (!best.has(stem) || r < best.get(stem).r) best.set(stem, { f, r });
  }
  fs.writeFileSync('voices/files.json', JSON.stringify([...best.values()].map(b => b.f).sort(), null, 1) + '\n');
}
console.log(`Built ${out} (${(html.length / 1024).toFixed(0)} KB) from ${files.length} modules${hooks ? ' + test hooks' : ''}`);
