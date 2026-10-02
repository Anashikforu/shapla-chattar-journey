// Converts every voices/*.wav to a small mono MP3 next to it (skips ones that are already up to date).
// The game prefers the MP3 and falls back to the WAV, so run `npm run voices` after generating clips.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const dir = 'voices';
if (spawnSync('ffmpeg', ['-version']).status !== 0) { console.error('ffmpeg not found; skipping (the game will load the WAV files instead)'); process.exit(0); }
let done = 0, kept = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.wav'))) {
  const wav = `${dir}/${f}`, mp3 = wav.replace(/\.wav$/, '.mp3');
  if (fs.existsSync(mp3) && fs.statSync(mp3).mtimeMs >= fs.statSync(wav).mtimeMs) { kept++; continue; }
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-ar', '24000', '-b:a', '56k', mp3]);
  if (r.status === 0) done++; else console.error(`failed: ${f}`);
}
const size = d => fs.readdirSync(dir).filter(f => f.endsWith(d)).reduce((a, f) => a + fs.statSync(`${dir}/${f}`).size, 0) / 1048576;
console.log(`MP3: ${done} converted, ${kept} up to date. WAV ${size('.wav').toFixed(1)} MB -> MP3 ${size('.mp3').toFixed(1)} MB`);
