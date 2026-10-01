// Build: concatenate src/shell-head.html + src/js/*.js (in name order) + src/shell-tail.html into index.html.
import fs from 'node:fs';
const js = fs.readdirSync('src/js').filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(`src/js/${f}`, 'utf8')).join('');
const out = fs.readFileSync('src/shell-head.html', 'utf8') + js + fs.readFileSync('src/shell-tail.html', 'utf8');
fs.writeFileSync(process.argv[2] || 'index.html', out);
console.log(`Built index.html (${(out.length / 1024).toFixed(0)} KB) from ${fs.readdirSync('src/js').length} modules`);
