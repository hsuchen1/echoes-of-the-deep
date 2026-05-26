/* ═══ 深海迴聲 Echoes of the Deep — main.js ═══ */
// porthole.png handles the frame — no JS rivets needed

// ── STATE ─────────────────────────────────
const state = {
  started: false, score: 0,
  answered: {1:false,2:false,3:false},
  submitted: false, depthHistory: [], currentScene: 0, persona: {}
};

// ── DOM REFS ──────────────────────────────
const $ = id => document.getElementById(id);
const el = {
  depthBig: $('depth-big'),
  depthBar: $('depth-bar-fill'),
  envPressure: $('env-pressure'),
  envTemp: $('env-temp'),
  envO2: $('env-o2'),
  audioModeLabel: $('audio-mode-label'),
  volMaster: $('vol-master'), volMusic: $('vol-music'), volSfx: $('vol-sfx'),
  audioAmbient: $('audio-ambient'), audioMusic: $('audio-music'),
  audioDolphin: $('audio-dolphin'), audioWhale: $('audio-whale'), audioClick: $('audio-click'),
  prBig: $('pr-big'), prBar: $('pr-bar'),
  statWhale: $('stat-whale'), statTotal: $('stat-total'), statDives: $('stat-dives'),
  scoreNum: $('score-num'), scorePct: $('score-pct'),
  scoreArc: $('score-arc'), scoreComment: $('score-comment'),
  personaIcon: $('persona-icon'), personaName: $('persona-name'), personaDesc: $('persona-desc')
};

// ── AUDIO ─────────────────────────────────
let depthFactor = 0; // 0.0 (surface) to 1.0 (deepest)

const audio = {
  masterVol: 0.7, musicVol: 0.6, sfxVol: 0.8,
  ambient: $('audio-ambient'), music: $('audio-music'),
  dolphin: $('audio-dolphin'), whale: $('audio-whale'), click: $('audio-click'),
  seagull: $('audio-seagull')
};

function setVolumes() {
  // Ambient gets louder deeper (0.3x at top -> 0.55x at bottom, not too overwhelming)
  const ambMulti = 0.3 + (0.25 * depthFactor);
  if(audio.ambient) audio.ambient.volume = audio.sfxVol * audio.masterVol * ambMulti;
  
  // Music gets quieter deeper (0.5x at top -> 0.3x at bottom)
  const musicMulti = 0.5 - (0.2 * depthFactor);
  if(audio.music) audio.music.volume = audio.musicVol * audio.masterVol * musicMulti;
  
  if(audio.dolphin) audio.dolphin.volume = audio.sfxVol * audio.masterVol * 0.1; // 調降海豚音量至 10% 以減少刺耳感
  if(audio.whale)   audio.whale.volume   = audio.sfxVol * audio.masterVol;
  if(audio.seagull) audio.seagull.volume = audio.sfxVol * audio.masterVol;
  if(audio.click)   audio.click.volume   = audio.sfxVol * audio.masterVol;
}

function playSfx(audioEl) {
  if (audioEl) {
    audioEl.currentTime = 0;
    audioEl.play().catch(()=>{});
  }
}
$('vol-master').addEventListener('input', e => { audio.masterVol = e.target.value/100; setVolumes(); });
$('vol-music').addEventListener('input',  e => { audio.musicVol  = e.target.value/100; setVolumes(); });
$('vol-sfx').addEventListener('input',    e => { audio.sfxVol    = e.target.value/100; setVolumes(); });
setVolumes();

// ── SURFACE CANVAS (Scene 0) ──────────────
const surfaceCanvas = $('surface-canvas');
// Surface Canvas logic removed because we use background image for Scene 0
function drawSurface() {}// ── CORAL CANVAS (Scene 1) ────────────────
const coralCanvas = $('coral-canvas');
const cCtx = coralCanvas.getContext('2d');
let coralTime = 0;
function resizeCoral() { coralCanvas.width=coralCanvas.offsetWidth; coralCanvas.height=coralCanvas.offsetHeight; }
resizeCoral(); window.addEventListener('resize', resizeCoral);
function drawCoral() {
  const W=coralCanvas.width,H=coralCanvas.height;
  coralTime+=0.01; cCtx.clearRect(0,0,W,H);
  for(let i=0;i<6;i++){
    const x=W*(0.12+i*0.15),wb=Math.sin(coralTime+i*1.2)*22;
    const rg=cCtx.createLinearGradient(x,0,x+wb,H*0.55);
    rg.addColorStop(0,'rgba(100,200,255,0.06)'); rg.addColorStop(1,'rgba(100,200,255,0)');
    cCtx.fillStyle=rg; cCtx.beginPath(); cCtx.moveTo(x-18+wb,0); cCtx.lineTo(x+18+wb,0); cCtx.lineTo(x+12,H*0.55); cCtx.lineTo(x-12,H*0.55); cCtx.fill();
  }
  requestAnimationFrame(drawCoral);
}
drawCoral();

// ── PLASTIC CANVAS (Scene 2) ──────────────
const plasticCanvas = $('plastic-canvas');
const pCtx = plasticCanvas.getContext('2d');
function resizePlastic() { plasticCanvas.width=plasticCanvas.offsetWidth; plasticCanvas.height=plasticCanvas.offsetHeight; }
resizePlastic(); window.addEventListener('resize', resizePlastic);
if(!plasticCanvas._p) plasticCanvas._p = Array.from({length:70},()=>({x:Math.random(),y:Math.random(),r:Math.random()*2.5+0.5,vx:(Math.random()-0.5)*0.0006,vy:-(Math.random()*0.0009+0.0003),a:Math.random()*0.45+0.1,hue:Math.random()>0.5?200:30+Math.random()*35,sh:Math.random()>0.6}));
function drawPlastic() {
  const W=plasticCanvas.width,H=plasticCanvas.height;
  pCtx.clearRect(0,0,W,H);
  plasticCanvas._p.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; if(p.y<-0.05){p.y=1.05;p.x=Math.random();} if(p.x<0)p.x=1; if(p.x>1)p.x=0; pCtx.globalAlpha=p.a; pCtx.fillStyle=`hsla(${p.hue},70%,70%,1)`; const px=p.x*W,py=p.y*H; if(p.sh){pCtx.fillRect(px-p.r,py-p.r*0.5,p.r*2,p.r);}else{pCtx.beginPath();pCtx.arc(px,py,p.r,0,Math.PI*2);pCtx.fill();} }); pCtx.globalAlpha=1;
  requestAnimationFrame(drawPlastic);
}
drawPlastic();

// ── BIOLUM CANVAS (Scene 3) ───────────────
const biolumCanvas = $('biolum-canvas');
const bCtx = biolumCanvas.getContext('2d');
let biolumTime = 0;

// PRE-RENDER GLOW TO OFFSCREEN CANVASES (Massive performance boost)
const glowCaches = {};
function createGlowCache(hue) {
  const canvas = document.createElement('canvas');
  canvas.width = 100; canvas.height = 100;
  const ctx = canvas.getContext('2d');
  const baseGlow = ctx.createRadialGradient(50,50,0, 50,50,50);
  baseGlow.addColorStop(0, `hsla(${hue}, 80%, 80%, 1)`);
  baseGlow.addColorStop(0.2, `hsla(${hue}, 100%, 60%, 0.8)`);
  baseGlow.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
  ctx.fillStyle = baseGlow;
  ctx.beginPath(); ctx.arc(50,50,50,0,Math.PI*2); ctx.fill();
  return canvas;
}
const hues = [150, 185, 200, 215, 220];
hues.forEach(h => glowCaches[h] = createGlowCache(h));

function resizeBiolum() { biolumCanvas.width=biolumCanvas.offsetWidth; biolumCanvas.height=biolumCanvas.offsetHeight; }
resizeBiolum(); window.addEventListener('resize', resizeBiolum);
if(!biolumCanvas._o) biolumCanvas._o = Array.from({length:35},()=>({
  x:Math.random(),y:Math.random(),r:Math.random()*3.5+1,phase:Math.random()*Math.PI*2,sp:Math.random()*0.5+0.2,vx:(Math.random()-0.5)*0.0003,vy:(Math.random()-0.5)*0.0002,
  hue: hues[Math.floor(Math.random()*hues.length)]
}));

function drawBiolum() {
  const W=biolumCanvas.width,H=biolumCanvas.height;
  biolumTime+=0.015; bCtx.clearRect(0,0,W,H);
  
  // Batch composite operations
  bCtx.globalCompositeOperation = 'screen';
  
  biolumCanvas._o.forEach(o=>{ 
    o.x+=o.vx; o.y+=o.vy; 
    if(o.x<0)o.x=1; if(o.x>1)o.x=0; 
    if(o.y<0)o.y=1; if(o.y>1)o.y=0; 
    
    const br=(Math.sin(biolumTime*o.sp+o.phase)+1)/2; 
    if(br < 0.05) return; // Skip drawing if almost invisible
    
    const px=o.x*W,py=o.y*H; 
    const size = o.r * 18; // 9 * 2
    
    bCtx.globalAlpha = br * 0.8;
    bCtx.drawImage(glowCaches[o.hue], px - size/2, py - size/2, size, size);
  });
  
  bCtx.globalCompositeOperation = 'source-over';
  bCtx.globalAlpha = 1;
  
  requestAnimationFrame(drawBiolum);
}
drawBiolum();

// ── DEPTH CHART CANVAS ────────────────────
const dcCanvas = $('depth-chart');
const dcCtx = dcCanvas.getContext('2d');
function drawDepthChart() {
  const W=dcCanvas.width,H=dcCanvas.height;
  dcCtx.clearRect(0,0,W,H);
  dcCtx.fillStyle='rgba(0,5,12,0.5)'; dcCtx.fillRect(0,0,W,H);
  // grid lines
  [0,0.5,1].forEach(f=>{ dcCtx.beginPath(); dcCtx.moveTo(0,f*H); dcCtx.lineTo(W,f*H); dcCtx.strokeStyle='rgba(0,229,255,0.07)'; dcCtx.lineWidth=1; dcCtx.stroke(); });
  if(state.depthHistory.length>1){
    dcCtx.beginPath();
    state.depthHistory.forEach((d,i)=>{ const x=(i/(state.depthHistory.length-1))*W; const y=d*H; i===0?dcCtx.moveTo(x,y):dcCtx.lineTo(x,y); });
    dcCtx.strokeStyle='rgba(0,229,255,0.85)'; dcCtx.lineWidth=1.5; dcCtx.stroke();
  }
}

// ── AUDIO WAVE CANVAS ─────────────────────
const awCanvas = $('audio-wave');
const awCtx = awCanvas.getContext('2d');
let awTime = 0;
function drawAudioWave() {
  const W=awCanvas.width,H=awCanvas.height;
  awTime+=0.12; awCtx.clearRect(0,0,W,H);
  const amp = state.started ? (2.5+Math.sin(awTime*0.4)*1.5) : 0.8;
  awCtx.beginPath();
  for(let x=0;x<=W;x+=2){
    const y=H/2+Math.sin(x*0.18+awTime)*amp+Math.sin(x*0.09-awTime*0.7)*amp*0.5;
    x===0?awCtx.moveTo(x,y):awCtx.lineTo(x,y);
  }
  awCtx.strokeStyle=state.started?'rgba(0,229,255,0.85)':'rgba(0,229,255,0.2)';
  awCtx.lineWidth=1.5; awCtx.stroke();
  requestAnimationFrame(drawAudioWave);
}
drawAudioWave();

// ── SCROLL ────────────────────────────────
const scenes = ['scene-0','scene-1','scene-2','scene-3','scene-4'].map(id=>$(id));

function getScrollPct() {
  const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
  return h > 0 ? Math.min(window.scrollY / h, 1) : 0;
}
function getCurrentScene() {
  for(let i=scenes.length-1;i>=0;i--){ if(scenes[i].getBoundingClientRect().top<=window.innerHeight*0.5) return i; } return 0;
}
function updateNav(sceneIdx) {
  document.querySelectorAll('.nav-step').forEach((st, idx) => {
    st.classList.remove('active', 'past');
    if (idx === sceneIdx) st.classList.add('active');
    else if (idx < sceneIdx) st.classList.add('past');
  });
}

let updateTimers = {};
function updateNumberWithBounce(el, val, formatFn) {
  const newVal = formatFn(val);
  if (el.textContent === newVal) return; // No change
  
  el.textContent = newVal;
  
  // Add CSS bounce class
  el.classList.add('updating');
  
  // Clear previous timer to prevent flickering
  if (updateTimers[el.id]) clearTimeout(updateTimers[el.id]);
  
  // Remove class after 150ms to allow CSS transition to return to normal
  updateTimers[el.id] = setTimeout(() => {
    el.classList.remove('updating');
  }, 150);
}

let scrollRafPending = false;
let lastScrollUpdateTime = 0;
window.addEventListener('scroll',()=>{
  if (scrollRafPending) return;
  scrollRafPending = true;
  requestAnimationFrame(() => {
    scrollRafPending = false;
    const pct=getScrollPct();
    
    // ── Deep Sea Audio Engine ──
    if (Math.abs(depthFactor - pct) > 0.01) {
      depthFactor = pct;
      setVolumes(); // Update crossfade volumes
      
      // Playback speed drop & Pitch shift
      if (audio.music) {
        let speedDrop = 0;
        // Keep normal pitch in Sunlight Zone (top 25% of scroll)
        if (pct > 0.25) {
          const effectivePct = (pct - 0.25) / 0.75;
          speedDrop = 0.25 * effectivePct; 
        }
        audio.music.playbackRate = 1.0 - speedDrop;
        audio.music.preservesPitch = false;
      }
      if (audio.ambient) {
        let speedDrop = 0;
        if (pct > 0.25) {
          const effectivePct = (pct - 0.25) / 0.75;
          speedDrop = 0.15 * effectivePct; 
        }
        audio.ambient.playbackRate = 1.0 - speedDrop;
      }
    }
    
    // Fast updates (no heavy DOM rendering)
    const scene=getCurrentScene();
    if(scene!==state.currentScene){ state.currentScene=scene; updateNav(scene); }
    if(scene===4&&!state.submitted) submitResults();
    
    // Throttled updates for heavy HUD text rendering (~12 FPS)
    const now = Date.now();
    if (now - lastScrollUpdateTime > 80) {
      lastScrollUpdateTime = now;
      const depth=Math.round(pct*1000);
      
      updateNumberWithBounce(el.depthBig, depth, Math.round);
      
      const pressure = 1 + depth * 0.1;
      updateNumberWithBounce(el.envPressure, pressure, v => v.toFixed(1));
      
      const temp = 25 - 21 * Math.pow(pct, 0.5);
      updateNumberWithBounce(el.envTemp, temp, v => v.toFixed(1));
      
      let o2;
      if (pct < 0.6) {
        o2 = 15 + 83 * Math.pow((0.6 - pct) / 0.6, 2);
      } else {
        o2 = 15 + 35 * Math.pow((pct - 0.6) / 0.4, 2);
      }
      updateNumberWithBounce(el.envO2, o2, Math.round);
      
      state.depthHistory.push(pct);
      if(state.depthHistory.length>60) state.depthHistory.shift();
      drawDepthChart();
    }
  });
},{passive:true});

// ── START BUTTON ──────────────────────────
$('btn-start').addEventListener('click',()=>{
  state.started=true;
  el.audioModeLabel.textContent='ON';
  
  if(audio.ambient) try{audio.ambient.play().catch(()=>{});}catch(e){}
  if(audio.music) try{audio.music.play().catch(()=>{});}catch(e){}
  scenes[1].scrollIntoView({behavior:'smooth'});
});

// ── CREATURE SOUNDS ───────────────────────
// Setup global UI click sound
document.querySelectorAll('.opt-btn, .btn-start, .action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playSfx(audio.click);
  });
});

// ── CREATURE ENCYCLOPEDIA ─────────────────
const creatureData = {
  "seagull": { name: "海鷗", sciname: "Laridae", depth: "海面上", desc: "海鷗是常見的海鳥，常在海岸線附近盤旋，尋找魚類與人類丟棄的食物。牠們能適應不同的環境，在海洋生態系中扮演重要的角色。" },
  "dolphin": { name: "海豚", sciname: "Delphinidae", depth: "0-200m (透光層)", desc: "海豚是高度聰明的海洋哺乳動物，依靠回聲定位在淺海中捕食與溝通。牠們生性群居，常伴隨船隻航行。" },
  "cf-r": { name: "小丑魚", sciname: "Amphiprioninae", depth: "0-50m (透光層)", desc: "小丑魚主要棲息在熱帶海域的珊瑚礁中。牠們與海葵形成互利共生的關係，能分泌特殊黏液保護自己免受海葵毒刺的傷害。" },
  "cf-l": { name: "小丑魚", sciname: "Amphiprioninae", depth: "0-50m (透光層)", desc: "小丑魚主要棲息在熱帶海域的珊瑚礁中。牠們與海葵形成互利共生的關係，能分泌特殊黏液保護自己免受海葵毒刺的傷害。" },
  "bt-r": { name: "藍倒吊", sciname: "Paracanthurus hepatus", depth: "0-40m (透光層)", desc: "俗稱「擬刺尾鯛」，鮮豔的寶藍色身體與黃色的尾巴是牠們的特徵。喜歡在珊瑚礁區群游，主要以海藻為食。" },
  "bt-l": { name: "藍倒吊", sciname: "Paracanthurus hepatus", depth: "0-40m (透光層)", desc: "俗稱「擬刺尾鯛」，鮮豔的寶藍色身體與黃色的尾巴是牠們的特徵。喜歡在珊瑚礁區群游，主要以海藻為食。" },
  "turtle": { name: "綠蠵龜", sciname: "Chelonia mydas", depth: "0-150m (透光層)", desc: "綠蠵龜是大型的海龜，成年後主要以海草為食，這也使得牠們的體脂肪呈現淡綠色。目前因棲地破壞與海洋塑膠污染面臨極大的生存威脅。" },
  "seahorse": { name: "海馬", sciname: "Hippocampus", depth: "0-30m (透光層)", desc: "海馬擁有獨特的外型，游泳速度緩慢，通常會用尾巴纏繞在海草或珊瑚上。牠們是海洋中少數由雄性負責孵化卵的生物。" },
  "whale": { name: "抹香鯨", sciname: "Physeter macrocephalus", depth: "200-1000m (弱光層)", desc: "抹香鯨是體型最大的齒鯨，可以潛入深海數千公尺尋找大王烏賊。牠們在深海中能發出強大的喀答聲進行溝通與定位。" },
  "anglerfish": { name: "鮟鱇魚", sciname: "Lophiiformes", depth: "1000m+ (無光層)", desc: "生活在黑暗的深海中，鮟鱇魚利用頭部由背鰭演化而成的發光釣竿（誘餌）來吸引獵物。牠們擁有極具擴張性的大嘴與利齒。" },
  "deep-jelly": { name: "深海發光水母", sciname: "Bioluminescent Jellyfish", depth: "1000m+ (無光層)", desc: "在無光層中，許多水母演化出了生物螢光（Bioluminescence）的能力。當受到干擾時，牠們會發出藍綠色的冷光，藉此嚇退掠食者或吸引獵物的注意。" },
  "plastic-bag": { name: "塑膠垃圾", sciname: "Microplastics & Debris", depth: "全水層分佈", desc: "人類每年將數百萬噸的塑膠廢棄物排入海洋。這些垃圾難以分解，會被海龜與魚類誤食，最終甚至可能進入人類的食物鏈。" }
};

const creatureModal = $('creature-modal');
const modalCloseBtn = $('modal-close');
const mTitle = $('modal-title');
const mSci = $('modal-sciname');
const mDepth = $('modal-depth');
const mDesc = $('modal-desc');

document.querySelectorAll('.creature').forEach(el => {
  el.addEventListener('click', (e) => {
    const classes = e.target.className.split(' ');
    let creatureKey = null;
    
    // Find the creature key from classes
    for (let c of classes) {
      if (creatureData[c]) {
        creatureKey = c;
        break;
      }
    }
    
    if (creatureKey) {
      const data = creatureData[creatureKey];
      mTitle.innerText = data.name;
      mSci.innerText = data.sciname;
      mDepth.innerText = data.depth;
      mDesc.innerText = data.desc;
      
      // Position calculation
      const rect = e.target.getBoundingClientRect();
      const mContent = creatureModal.querySelector('.modal-content');
      let left = rect.right + 15;
      let top = rect.top;
      
      // Prevent overflow
      const modalW = 320;
      const modalH = 220;
      if (left + modalW > window.innerWidth) {
        left = rect.left - modalW - 15;
        if (left < 10) left = 10;
      }
      if (top + modalH > window.innerHeight) {
        top = window.innerHeight - modalH - 20;
      }
      if (top < 10) top = 10;
      
      mContent.style.left = `${left}px`;
      mContent.style.top = `${top}px`;
      
      creatureModal.classList.add('active');
    }
    
    // Play sound if applicable
    if (classes.includes('dolphin')) playSfx(audio.dolphin);
    if (classes.includes('whale')) playSfx(audio.whale);
    if (classes.includes('seagull')) playSfx(audio.seagull);
    
    e.stopPropagation();
  });
});

if(modalCloseBtn) modalCloseBtn.addEventListener('click', () => creatureModal.classList.remove('active'));
if($('modal-overlay')) $('modal-overlay').addEventListener('click', () => creatureModal.classList.remove('active'));
window.addEventListener('keydown', (e) => { 
  if (e.key === 'Escape' && creatureModal.classList.contains('active')) {
    creatureModal.classList.remove('active'); 
  }
});

// ── INTERSECTION OBSERVER ─────────────────
const io=new IntersectionObserver(entries=>{ entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}); },{threshold:0.14});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// ── QUIZ ──────────────────────────────────
const personas=[
  {name:'被困住的寄居蟹',icon:'🦀',desc:'探索旅程才剛開始！海洋還有許多等你發現的秘密，別放棄！'},
  {name:'迷航的海獅',icon:'🦭',desc:'你已踏出守護海洋的第一步，繼續學習，海洋需要你！'},
  {name:'堅韌的海龜',icon:'🐢',desc:'你對海洋議題有相當了解，如同海龜般堅韌地守護著大海！'},
  {name:'睿智的藍鯨',icon:'🐋',desc:'你擁有廣闊的海洋知識，如同藍鯨般睿智與深邃，是海洋最堅實的守護者！'}
];

document.querySelectorAll('.opt-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const q=parseInt(btn.dataset.q);
    if(state.answered[q])return;
    state.answered[q]=true;
    const ok=btn.dataset.ok==='true';
    if(ok)state.score++;
    document.querySelectorAll(`.opt-btn[data-q="${q}"]`).forEach(b=>{ b.disabled=true; if(b.dataset.ok==='true')b.classList.add('correct'); else if(b===btn&&!ok)b.classList.add('wrong'); });
    const fb=$(  `fb-${q}`);
    fb.textContent=ok?'✦ 正確！深海面臨的威脅遠超出我們的想像。':'✕ 再想想⋯ 正確答案已標示。';
    fb.style.color=ok?'rgba(0,255,157,0.85)':'rgba(255,100,100,0.85)';
  });
});

// ── RESULTS ───────────────────────────────
function animateNum(el,target,dur=1400){
  const start=Date.now(),from=parseInt(el.textContent.replace(/[^0-9]/g,''))||0;
  const tick=()=>{ const p=Math.min((Date.now()-start)/dur,1),e=1-Math.pow(1-p,3); el.textContent=Math.round(from+(target-from)*e).toLocaleString(); if(p<1)requestAnimationFrame(tick); };
  tick();
}

function showResults(stats){
  const p=personas[Math.min(state.score,3)];
  el.personaIcon.textContent=p.icon;
  el.personaName.textContent=p.name;
  el.personaDesc.textContent=p.desc;
  el.scoreNum.textContent=`${state.score}/3`;
  el.scorePct.textContent=`正確率 ${Math.round(state.score/3*100)}%`;
  const arc=2*Math.PI*42;
  setTimeout(()=>{ el.scoreArc.style.strokeDashoffset=arc-(state.score/3)*arc; },400);
  const cmts=['繼續加油，海洋等你守護！','不錯喔，你有守護海洋的潛力！','表現優秀！海洋因你更安全！','答對所有問題！太棒了！'];
  el.scoreComment.textContent=cmts[state.score];
  const pr=stats.pr||85;
  el.prBig.textContent=pr+'%';
  setTimeout(()=>{ el.prBar.style.width=pr+'%'; },600);
  animateNum(el.statWhale,stats.whale||0);
  animateNum(el.statTotal,stats.total||1);
  animateNum(el.statDives,(stats.total||1)*52+23789,2000);
  $('scene-4').classList.add('shaking');
  setTimeout(()=>$('scene-4').classList.remove('shaking'),550);
}

async function submitResults(){
  if(state.submitted)return;
  state.submitted=true;
  const p=personas[Math.min(state.score,3)];
  try{
    await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({score:state.score,persona:p.name})});
    const r=await fetch(`/api/stats?score=${state.score}`);
    showResults(await r.json());
  }catch(e){ showResults({pr:85,whale:120,total:456}); }
}

// ── RESTART ───────────────────────────────
$('btn-restart').addEventListener('click',()=>{
  state.score=0; state.answered={1:false,2:false,3:false}; state.submitted=false; state.depthHistory=[];
  document.querySelectorAll('.opt-btn').forEach(b=>{b.disabled=false;b.classList.remove('correct','wrong');});
  document.querySelectorAll('.quiz-fb').forEach(f=>f.textContent='');
  el.scoreArc.style.strokeDashoffset='264'; el.prBar.style.width='0%';
  el.prBig.textContent='—%'; el.scoreNum.textContent='0/3'; el.scorePct.textContent='正確率 0%';
  window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(()=>{ 
    state.started=false; el.audioModeLabel.textContent='OFF'; 
    if(audio.ambient)audio.ambient.pause(); 
    if(audio.music)audio.music.pause(); 
  },800);
});

// ── SHARE ─────────────────────────────────
$('btn-share').addEventListener('click',()=>{
  const p=personas[Math.min(state.score,3)];
  const text=`我在「深海迴聲 Echoes of the Deep」探索中獲得了【${p.name}】的稱號！答對 ${state.score}/3 題，為 SDG14 海洋保育盡一份心力 🌊`;
  if(navigator.share){navigator.share({title:'深海迴聲',text});}
  else{navigator.clipboard.writeText(text).then(()=>alert('已複製到剪貼板！'));}
});

// ── LENIS + GSAP 官方整合 ──────────────────
// 1. 建立 Lenis 實例
const lenis = new Lenis({
  duration: 1.2,          // 滾動慣性持續時間（秒）
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
  touchMultiplier: 1.5,   // 觸控靈敏度
  wheelMultiplier: 1,
  infinite: false,
});

// 2. 將 Lenis 掛上 GSAP Ticker（共用同一個 rAF 迴圈，零浪費）
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // GSAP ticker 是秒，Lenis 要毫秒
});
gsap.ticker.lagSmoothing(0); // 防止 GSAP 跳幀補償干擾 Lenis
// ── GLOBAL PARTICLE ENGINE (bubbles + marine snow) ──
(function initParticles() {
  const cvs = document.getElementById('particle-canvas');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  let W, H;

  function resize() {
    W = cvs.width  = window.innerWidth;
    H = cvs.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Track scroll speed for parallax intensity
  let lastScrollY = window.scrollY;
  let scrollSpeed = 0;
  window.addEventListener('scroll', () => {
    scrollSpeed = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
  }, { passive: true });

  // Scroll depth (0-1) for color shifting
  function scrollPct() {
    const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
    return h > 0 ? Math.min(window.scrollY / h, 1) : 0;
  }

  // ── Bubble class ──
  class Bubble {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : H + Math.random() * 60;
      this.r  = Math.random() * 4 + 1.5;        // radius 1.5–5.5
      this.baseVy = -(Math.random() * 0.8 + 0.3); // base rise speed
      this.wobbleAmp = Math.random() * 1.2 + 0.3;
      this.wobbleFreq = Math.random() * 0.02 + 0.008;
      this.phase = Math.random() * Math.PI * 2;
      this.opacity = Math.random() * 0.35 + 0.1;
      this.depth = Math.random();  // 0 = near, 1 = far (parallax factor)
    }
    update(dt, speed) {
      // Parallax: near bubbles move faster with scroll
      const parallax = 1 + (1 - this.depth) * 0.8;
      this.y += (this.baseVy - Math.abs(speed) * 0.15 * parallax) * dt;
      this.x += Math.sin(this.phase) * this.wobbleAmp * dt * 0.5;
      this.phase += this.wobbleFreq * dt;
      if (this.y < -20) this.reset(false);
      if (this.y > H + 20) { this.y = -20; this.x = Math.random() * W; }
    }
    draw(ctx, pct) {
      // Deeper = cooler/dimmer bubbles
      const alpha = this.opacity * (1 - pct * 0.5);
      if (alpha < 0.01) return;
      const hue = 190 + pct * 30; // 190 (cyan) → 220 (blue)
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 80%, 75%, ${alpha})`;
      ctx.fill();
      // Highlight
      ctx.beginPath();
      ctx.arc(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.6})`;
      ctx.fill();
    }
  }

  // ── Marine Snow class ──
  class MarineSnow {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : -Math.random() * 40;
      this.r  = Math.random() * 1.5 + 0.3;       // tiny 0.3–1.8
      this.baseVy = Math.random() * 0.3 + 0.1;    // slow fall
      this.vx = (Math.random() - 0.5) * 0.15;     // gentle drift
      this.opacity = Math.random() * 0.25 + 0.05;
      this.depth = Math.random();
    }
    update(dt, speed) {
      // Marine snow drifts down, but scroll pushes them up (sub is diving = stuff rushes up)
      const parallax = 0.5 + (1 - this.depth) * 1.5;
      this.y += (this.baseVy - speed * 0.08 * parallax) * dt;
      this.x += this.vx * dt;
      if (this.y > H + 20) this.reset(false);
      if (this.y < -20) { this.y = H + 20; this.x = Math.random() * W; }
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
    }
    draw(ctx, pct) {
      // Marine snow only visible in deeper water (pct > 0.15)
      const visibility = Math.max(0, (pct - 0.15) / 0.85);
      const alpha = this.opacity * visibility;
      if (alpha < 0.01) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,210,230,${alpha})`;
      ctx.fill();
    }
  }

  // Create particles (tuned for performance)
  const bubbles = Array.from({ length: 25 }, () => new Bubble());
  const snow    = Array.from({ length: 50 }, () => new MarineSnow());

  let lastTime = 0;
  function animate(now) {
    const dt = Math.min((now - (lastTime || now)) / 16.67, 3); // normalize to ~60fps
    lastTime = now;

    ctx.clearRect(0, 0, W, H);

    // Smoothly decay scroll speed
    const speed = scrollSpeed;
    scrollSpeed *= 0.92;

    const pct = scrollPct();

    // Draw marine snow first (behind bubbles)
    for (const s of snow)  { s.update(dt, speed); s.draw(ctx, pct); }
    // Draw bubbles on top
    for (const b of bubbles) { b.update(dt, speed); b.draw(ctx, pct); }

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
// ── VISIBILITY-GATED CANVAS RENDERING ─────
// Only draw canvas when its section is on screen
const canvasVisibility = { coral: false, plastic: false, biolum: false };

const canvasObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.target.id === 'scene-1') canvasVisibility.coral = e.isIntersecting;
    if (e.target.id === 'scene-2') canvasVisibility.plastic = e.isIntersecting;
    if (e.target.id === 'scene-3') canvasVisibility.biolum = e.isIntersecting;
  });
}, { threshold: 0 });

['scene-1','scene-2','scene-3'].forEach(id => {
  const el = document.getElementById(id);
  if (el) canvasObserver.observe(el);
});

// Patch canvas draw loops to skip when off-screen
const _drawCoral = drawCoral;
drawCoral = function gatedCoral() {
  if (canvasVisibility.coral) { _drawCoral(); } 
  else { requestAnimationFrame(gatedCoral); }
};

const _drawPlastic = drawPlastic;
drawPlastic = function gatedPlastic() {
  if (canvasVisibility.plastic) { _drawPlastic(); }
  else { requestAnimationFrame(gatedPlastic); }
};

const _drawBiolum = drawBiolum;
drawBiolum = function gatedBiolum() {
  if (canvasVisibility.biolum) { _drawBiolum(); }
  else { requestAnimationFrame(gatedBiolum); }
};

// --- Global Background Parallax ---
gsap.to('#bg-container', { 
  y: "-30vh", 
  ease: "none", 
  scrollTrigger: { 
    trigger: "#scroll-world", 
    start: "top top", 
    end: "bottom bottom", 
    scrub: true 
  }
});

// --- Background Crossfades ---
gsap.to('#bg-layer-1', { opacity: 1, ease: "none", scrollTrigger: { trigger: "#scene-1", start: "top 65%", end: "top 15%", scrub: true }});
gsap.to('#bg-layer-2', { opacity: 1, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top 65%", end: "top 15%", scrub: true }});
gsap.to('#bg-layer-3', { opacity: 1, ease: "none", scrollTrigger: { trigger: "#scene-3", start: "top 65%", end: "top 15%", scrub: true }});

// Scene 0: Seagulls scatter in different directions
gsap.to('.seagull-1', { x: "-40vw", y: "-70vh", ease: "none", scrollTrigger: { trigger: "#scene-0", start: "top top", end: "bottom top", scrub: 0.2 }});
gsap.to('.seagull-2', { x: "35vw", y: "-40vh", ease: "none", scrollTrigger: { trigger: "#scene-0", start: "top top", end: "bottom top", scrub: 0.5 }});
gsap.to('.seagull-3', { x: "-10vw", y: "-25vh", ease: "none", scrollTrigger: { trigger: "#scene-0", start: "top top", end: "bottom top", scrub: 0.8 }});
gsap.to('.seagull-4', { x: "55vw", y: "-65vh", ease: "none", scrollTrigger: { trigger: "#scene-0", start: "top top", end: "bottom top", scrub: 0.3 }});

// Scene 1: Dolphins swim at different speeds
gsap.to('.dolphin:not(.dolphin-2):not(.dolphin-3)', { x: "70vw", ease: "none", scrollTrigger: { trigger: "#scene-1", start: "top bottom", end: "bottom top", scrub: 0.3 }});
gsap.to('.dolphin-2', { x: "-25vw", y: "8vh", ease: "none", scrollTrigger: { trigger: "#scene-1", start: "top bottom", end: "bottom top", scrub: 0.8 }});
gsap.to('.dolphin-3', { x: "45vw", y: "-12vh", ease: "none", scrollTrigger: { trigger: "#scene-1", start: "top bottom", end: "bottom top", scrub: 0.6 }});
gsap.to('.greenturtle', { x: "55vw", y: "-25vh", ease: "none", scrollTrigger: { trigger: "#scene-1", start: "top bottom", end: "bottom top", scrub: 0.7 }});

// Scene 2: Whales & Plastic at varied parallax speeds
gsap.to('.whale:not(.whale-2):not(.whale-3)', { x: "220vw", y: "10vh", ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.4 }});
gsap.to('.whale-2', { x: "-100vw", y: "-5vh", ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.5 }});
gsap.to('.whale-3', { x: "-8vw", y: "5vh", ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 1.2 }});

gsap.to('.pb-1', { x: "70vw", y: "-40vh", rotation: 90, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.2 }});
gsap.to('.pb-2', { x: "50vw", y: "-25vh", rotation: -45, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.5 }});
gsap.to('.pb-3', { x: "35vw", y: "-15vh", rotation: 60, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.7 }});
gsap.to('.pb-4', { x: "15vw", y: "-5vh", rotation: 120, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 1.0 }});
gsap.to('.pb-5', { x: "-45vw", y: "-35vh", rotation: -90, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.35 }});
gsap.to('.pb-6', { x: "-20vw", y: "15vh", rotation: 180, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.6 }});
gsap.to('.pb-7', { x: "25vw", y: "30vh", rotation: -60, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.85 }});
gsap.to('.pb-8', { x: "-30vw", y: "20vh", rotation: 270, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.4 }});
gsap.to('.pb-9', { x: "40vw", y: "-10vh", rotation: -120, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.7 }});
gsap.to('.pb-10', { x: "-50vw", y: "-20vh", rotation: 45, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.3 }});
gsap.to('.pb-11', { x: "60vw", y: "15vh", rotation: 300, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 1.1 }});
gsap.to('.pb-12', { x: "-10vw", y: "-30vh", rotation: -180, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.6 }});
gsap.to('.pb-13', { x: "20vw", y: "-25vh", rotation: 90, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.9 }});
gsap.to('.pb-14', { x: "-40vw", y: "10vh", rotation: -75, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.5 }});
gsap.to('.pb-15', { x: "30vw", y: "25vh", rotation: 210, ease: "none", scrollTrigger: { trigger: "#scene-2", start: "top bottom", end: "bottom top", scrub: 0.8 }});

// Scene 3: Deep sea creatures
gsap.to('.angler-1', { x: "65vw", y: "5vh", ease: "none", scrollTrigger: { trigger: "#scene-3", start: "top bottom", end: "bottom top", scrub: 0.4 }});
gsap.to('.angler-2', { x: "40vw", y: "-10vh", ease: "none", scrollTrigger: { trigger: "#scene-3", start: "top bottom", end: "bottom top", scrub: 0.6 }});
gsap.to('.angler-3', { x: "-15vw", y: "2vh", ease: "none", scrollTrigger: { trigger: "#scene-3", start: "top bottom", end: "bottom top", scrub: 1.1 }});

gsap.to('.jelly-1', { x: "-55vw", y: "15vh", ease: "none", scrollTrigger: { trigger: "#scene-3", start: "top bottom", end: "bottom top", scrub: 0.3 }});
gsap.to('.jelly-2', { x: "45vw", y: "-20vh", ease: "none", scrollTrigger: { trigger: "#scene-3", start: "top bottom", end: "bottom top", scrub: 0.5 }});
gsap.to('.jelly-3', { x: "-35vw", y: "5vh", ease: "none", scrollTrigger: { trigger: "#scene-3", start: "top bottom", end: "bottom top", scrub: 0.7 }});
gsap.to('.jelly-4', { x: "-10vw", y: "-5vh", ease: "none", scrollTrigger: { trigger: "#scene-3", start: "top bottom", end: "bottom top", scrub: 1.3 }});
gsap.to('.jelly-5', { x: "25vw", y: "10vh", ease: "none", scrollTrigger: { trigger: "#scene-3", start: "top bottom", end: "bottom top", scrub: 0.8 }});
