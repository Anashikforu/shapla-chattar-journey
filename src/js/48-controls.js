/* ---------------- controls ---------------- */
const slider=$('timeSlider');slider.addEventListener('input',()=>{HOUR=+slider.value});
function togglePause(){PAUSED=!PAUSED;$('btnPause').textContent=PAUSED?'Play':'Pause';$('btnPause').setAttribute('aria-pressed',PAUSED)}
$('btnPause').onclick=togglePause;
const SPEEDS=[[2,'Clock: 1×'],[10,'Clock: 5×'],[1/60,'Clock: real']];let sIdx=0;
$('btnSpeed').onclick=()=>{sIdx=(sIdx+1)%SPEEDS.length;CLOCK_RATE=SPEEDS[sIdx][0];$('btnSpeed').textContent=SPEEDS[sIdx][1]};
const RM=['auto','on','off'];$('btnRain').onclick=()=>{RAIN_MODE=RM[(RM.indexOf(RAIN_MODE)+1)%3];$('btnRain').textContent='Rain: '+RAIN_MODE};
$('btnFriday').onclick=()=>{FRIDAY=!FRIDAY;$('btnFriday').textContent='Weekend: '+(FRIDAY?'on':'off');$('btnFriday').setAttribute('aria-pressed',FRIDAY)};
/* sound is on by default: it starts at the first click, drag, scroll or key press (browsers require a gesture) */
let soundPref=true,soundArmed=false;
function armSound(){if(soundArmed)return;soundArmed=true;audioInit();if(A.ctx.state==='suspended')A.ctx.resume();if(soundPref){A.on=true;A.master.gain.setTargetAtTime(.9,A.ctx.currentTime,.1)}for(const ev of['pointerdown','keydown','wheel','touchstart'])removeEventListener(ev,armSound,true)}
for(const ev of['pointerdown','keydown','wheel','touchstart'])addEventListener(ev,armSound,true);
function syncSoundUI(){const on=!!A.on||(!soundArmed&&soundPref);for(const id of['btnSound','soundFab']){const b=$(id);b.textContent='Sound: '+(on?'on':'off');b.setAttribute('aria-pressed',on)}$('soundFab').setAttribute('aria-label',on?'Turn sound off':'Turn sound on')}
$('soundFab').onclick=()=>{$('btnSound').click()};
$('btnSound').onclick=()=>{soundPref=!A.on;audioInit();if(A.ctx.state==='suspended')A.ctx.resume();A.on=!A.on;A.master.gain.setTargetAtTime(A.on?.9:0,A.ctx.currentTime,.1);$('btnSound').textContent='Sound: '+(A.on?'on':'off');$('btnSound').setAttribute('aria-pressed',A.on);syncSoundUI()};
const LANGS=[['bn','Speech: বাংলা'],['en','Speech: English'],['both','Speech: both']];
$('btnLang').onclick=()=>{const i=(LANGS.findIndex(l=>l[0]===LANG)+1)%3;LANG=LANGS[i][0];$('btnLang').textContent=LANGS[i][1];updateCard()};
$('toolsToggle').onclick=()=>{const t=$('tools');t.classList.toggle('open');$('toolsToggle').setAttribute('aria-expanded',t.classList.contains('open'))};
/* a clean screen for showing the city: the title card bows out after a few seconds, and the settings stay folded until asked for */
setTimeout(()=>{const t=document.querySelector('.title');if(t){t.classList.add('gone');setTimeout(()=>{t.style.display='none'},900)}},7000);
cv.addEventListener('pointerdown',()=>{const t=$('tools');if(t.classList.contains('open')){t.classList.remove('open');$('toolsToggle').setAttribute('aria-expanded','false')}});
$('btnVoices').onclick=()=>{updateVoiceUI();$('voicePanel').hidden=false};
$('closePanel').onclick=()=>{$('voicePanel').hidden=true};
$('pickFiles').onclick=()=>$('voiceFiles').click();
$('voiceFiles').onchange=e=>{loadAudioFiles([...e.target.files]);e.target.value=''};
const drop=$('drop');
['dragenter','dragover'].forEach(ev=>addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over')}));
['dragleave','drop'].forEach(ev=>addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over')}));
addEventListener('drop',e=>{const f=[...(e.dataTransfer?.files||[])].filter(f=>/audio|\.(mp3|wav|ogg|m4a|webm|flac)$/i.test(f.type+f.name));if(f.length){$('voicePanel').hidden=false;loadAudioFiles(f)}});
function updateVoiceUI(){
  const n=ALL_IDS.filter(i=>A.clips.has(i)).length;$('btnVoices').textContent=`Voices ${n}/${ALL_IDS.length}`;$('vcount').textContent=`${n} of ${ALL_IDS.length} loaded`;
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  $('vtable').innerHTML=VOICE_LINES.map(l=>`<tr><td><span class="${A.clips.has(l[0])?'ok':'miss'}">${A.clips.has(l[0])?'✓':'·'}</span> ${l[0]}</td><td><span class="bnl">${esc(l[2])}</span><br>${esc(l[3])}</td></tr>`).join('')+SFX_LIST.map(s=>`<tr><td><span class="${A.clips.has(s[0])?'ok':'miss'}">${A.clips.has(s[0])?'✓':'·'}</span> ${s[0]}</td><td>${esc(s[1])}</td></tr>`).join('');
}
let toastT=0;function toast(msg){const t=$('toast');t.textContent=msg;t.hidden=false;toastT=4}
const BN_DIG='০১২৩৪৫৬৭৮৯',bnNum=n=>String(n).replace(/\d/g,d=>BN_DIG[d]);
function updateClock(){const h=Math.floor(HOUR),m=Math.floor((HOUR-h)*60);const h12=(h%12)||12,mm=String(m).padStart(2,'0');
  const part=h<4?'রাত':h<6?'ভোর':h<12?'সকাল':h<15?'দুপুর':h<17.5?'বিকাল':h<19?'সন্ধ্যা':'রাত';
  $('clockBn').textContent=`${part} ${bnNum(h12)}:${bnNum(mm)}`;$('clockEn').textContent=`${h12}:${mm} ${h<12?'AM':'PM'}`;
  $('weatherTxt').textContent=(flood>.25?'· waterlogged streets':rain>.3?'· monsoon rain':'')+(FRIDAY?' · weekend, quiet streets':'')+(RHY.night()?' · the city sleeps':RHY.lunch()?' · lunch rush':RHY.exodus()?' · office crowd heading home':'');if(document.activeElement!==slider)slider.value=HOUR.toFixed(2)}

