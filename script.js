const W = 384;
const H = 216;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

function resize() {
  const s = Math.max(0.5, Math.min(window.innerWidth / W, window.innerHeight / H));
  canvas.style.width = Math.round(W * s) + 'px';
  canvas.style.height = Math.round(H * s) + 'px';
}
window.addEventListener('resize', resize);
resize();

function pCircle(cx, cy, r, color) {
  const x0 = Math.round(cx - r), x1 = Math.round(cx + r);
  const y0 = Math.round(cy - r), y1 = Math.round(cy + r);
  ctx.fillStyle = color;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1);
    }
  }
}

function pRing(cx, cy, r, th, color) {
  const x0 = Math.floor(cx - r - th), x1 = Math.ceil(cx + r + th);
  const y0 = Math.floor(cy - r - th), y1 = Math.ceil(cy + r + th);
  ctx.fillStyle = color;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d >= r - th / 2 && d <= r + th / 2) ctx.fillRect(x, y, 1, 1);
    }
  }
}

function pLine(x0, y0, x1, y1, w, color) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  const hw = Math.floor(w / 2);
  ctx.fillStyle = color;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t);
    ctx.fillRect(x - hw, y - hw, w, w);
  }
}

function drawSprite(rows, map, x, y, s) {
  const h = rows.length;
  const w = rows[0].length;
  const x0 = Math.round(x - (w * s) / 2);
  const y0 = y - h * s;
  for (let r = 0; r < h; r++) {
    const row = rows[r];
    for (let c = 0; c < w; c++) {
      const ch = row[c];
      if (ch === '.') continue;
      const col = map[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x0 + c * s, y0 + r * s, s, s);
    }
  }
}

const BACK = [
  '..G....',
  '.GGG...',
  '.GGG...',
  'GGGGG..',
  'gGGGGg.',
  '..B....',
  '..B....'
];
const BACK_MAP = { G: '#3f9f49', g: '#2f7f3a', B: '#7a4f2a' };

const MID = [
  '...G.....',
  '..GGG....',
  '.GGGGG...',
  'GGGGGGG..',
  'GGGGGGG..',
  'gGGGGGGg.',
  'gGGGGGGg.',
  '...BB....',
  '...BB....',
  '...BB....'
];
const MID_MAP = { G: '#47b14e', g: '#2f8f3e', B: '#8a5a2b' };

const FRONT = [
  '....G......',
  '...GGG.....',
  '..GGGGGY...',
  '.GGGGGGG...',
  'GGGGGGGGG..',
  'GRGGGGGGG..',
  'GGGGGGGGG..',
  'GGrGGGGGG..',
  '..GGGGG....',
  '...BBBB....',
  '...BBBB....',
  '....BB.....',
  '....BB.....'
];
const FRONT_MAP = {
  G: '#4fc757', g: '#35a044', Y: '#8ff27a',
  B: '#96622e', R: '#ff4655', r: '#ff4655'
};

const CLOUD = [
  '.....WW.....',
  '..WWWWWWW...',
  '.WWWWWWWWW..',
  'WWWWWWWWWWW.',
  'WWWWWWWWWWW.',
  '.sssssssss..'
];
const CLOUD_MAP = { W: '#ffffff', s: '#a8d8f0' };

const BACK_MAP_N = { G: '#1c4826', g: '#143624', B: '#3a2513' };
const MID_MAP_N = { G: '#1f5328', g: '#143624', B: '#3a2513' };
const FRONT_MAP_N = { G: '#245c2c', g: '#1a4526', Y: '#3f6a46', B: '#3a2513', R: '#7a2430', r: '#7a2430' };
const CLOUD_MAP_N = { W: '#3a4260', s: '#2a3048' };

const stars = [];
for (let i = 0; i < 18; i++) {
  stars.push({ x: Math.floor(Math.random() * W), y: Math.floor(Math.random() * 115), p: Math.random() * 6.28 });
}

function drawCone(x0, y0, x1, yTop, yBot, alpha) {
  ctx.fillStyle = 'rgba(255,246,190,' + alpha + ')';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, yTop);
  ctx.lineTo(x1, yBot);
  ctx.closePath();
  ctx.fill();
}

function makeLayer(speed, scale, baseY, rows, map, gapMin, gapMax) {
  const trees = [];
  let x = -60 + Math.random() * 80;
  while (x < W + 120) {
    trees.push({ x, v: 0.85 + Math.random() * 0.4 });
    x += gapMin + Math.random() * (gapMax - gapMin);
  }
  return { speed, scale, baseY, rows, map, gapMin, gapMax, trees };
}

function updateTrees(layer, dt) {
  const step = layer.speed * dt;
  for (const t of layer.trees) t.x -= step;
  while (layer.trees.length && layer.trees[0].x < -120) layer.trees.shift();
  let last = layer.trees[layer.trees.length - 1];
  while (last.x < W + 120) {
    const nx = last.x + layer.gapMin + Math.random() * (layer.gapMax - layer.gapMin);
    layer.trees.push({ x: nx, v: 0.85 + Math.random() * 0.4 });
    last = layer.trees[layer.trees.length - 1];
  }
}

const back = makeLayer(16, 2, 152, BACK, BACK_MAP, 36, 80);
const mid = makeLayer(36, 3, 176, MID, MID_MAP, 60, 120);
const front = makeLayer(80, 4, 210, FRONT, FRONT_MAP, 90, 170);

const speckles = [];
for (let i = 0; i < 46; i++) {
  speckles.push({
    x: Math.random() * (W + 40),
    y: 152 + Math.floor((i * 13) % 24),
    s: (i % 3) + 1,
    c: i % 2 ? '#2f8f3e' : '#7bd86b',
    n: i % 2 ? '#0f3a1a' : '#2a5c38'
  });
}

const clouds = [];
{
  let x = 20;
  while (x < W + 80) {
    clouds.push({ x, y: 26 + Math.floor(Math.random() * 44), s: 2 });
    x += 90 + Math.random() * 90;
  }
}

const dust = [];

const BX = 158, BY = 195, R = 9, CY = 190, FY = 195;
const SY = 168, HY = 171, GY = 164, PY = 170, QY = 158, HDY = 146;

const boyOpts = {
  frame: '#1d6b3a', hub: '#1d6b3a', jersey: '#ff4136',
  legFar: '#2b3d8f', legNear: '#3b5bbf', skin: '#ffd9a0',
  saddle: '#3a3d42', grip: '#1d6b3a', hair: '#6b4a2f',
  glasses: false, hairFlow: false, hairFlutter: 0,
  shadowFade: () => Math.max(0, 1 - jumpH / 150),
  shadowW: () => Math.max(6, 18 * (1 - jumpH / 160))
};

const girlOpts = {
  frame: '#e8edf2', hub: '#e8edf2', jersey: '#ff6bb5',
  legFar: '#d94a9a', legNear: '#ff6bb5', skin: '#ffe2d0',
  saddle: '#ff8ac4', grip: '#e8edf2', hair: '#ffd65e',
  glasses: true, hairFlow: true, hairFlutter: 0,
  shadowFade: () => Math.max(0, 1 - girlJumpH / 150),
  shadowW: () => Math.max(6, 18 * (1 - girlJumpH / 160))
};

function drawWheel(x, y, angle, hubColor) {
  pCircle(x, y, R, '#2b2f33');
  pRing(x, y, R - 1.6, 1.6, '#464b52');
  for (let k = 0; k < 3; k++) {
    const a = angle + k * 2.0944;
    pLine(x, y, x + Math.cos(a) * 6.5, y + Math.sin(a) * 6.5, 1, '#dff3ff');
  }
  ctx.fillStyle = hubColor;
  ctx.fillRect(x - 1, y - 1, 3, 3);
}

function drawCyclist(x, angle, yb, o) {
  const bx = x, by = BY + yb;
  const fx = x + 50, fy = FY + yb;
  const cx = x + 24, cy = CY + yb;
  const sx = x + 12, sy = SY + yb;
  const hx = x + 40, hy = HY + yb;
  const gx = x + 46, gy = GY + yb;
  const px = x + 19, py = PY + yb;
  const qx = x + 29, qy = QY + yb;
  const hdx = x + 26, hdy = HDY + yb;

  const shW = o.shadowW();
  ctx.fillStyle = 'rgba(20,20,30,' + (0.25 * o.shadowFade()).toFixed(3) + ')';
  ctx.fillRect(x - shW / 2, 203, shW, 3);
  ctx.fillRect(fx - shW / 2, 203, shW, 3);

  drawWheel(bx, by, angle, o.hub);
  drawWheel(fx, fy, angle, o.hub);

  pLine(cx, cy, bx, by, 2, o.frame);
  pLine(cx, cy, sx, sy, 2, o.frame);
  pLine(sx, sy, hx, hy, 2, o.frame);
  pLine(cx, cy, fx, fy, 2, o.frame);
  pLine(hx, hy, fx, fy, 2, o.frame);
  pLine(bx, by, sx, sy, 2, o.frame);

  pCircle(cx, cy, 4, '#e6ecf5');
  pCircle(cx, cy, 2, '#b9c4d4');

  pLine(sx, sy + 2, sx, sy - 4, 2, '#c8ccd2');
  ctx.fillStyle = o.saddle;
  ctx.fillRect(sx - 4, sy - 6, 9, 3);

  pLine(hx, hy, gx, gy, 2, o.frame);
  ctx.fillStyle = o.grip;
  ctx.fillRect(gx - 1, gy - 2, 4, 4);

  const f1x = cx + Math.cos(angle) * 5;
  const f1y = cy + Math.sin(angle) * 5;
  const f2x = cx - Math.cos(angle) * 5;
  const f2y = cy - Math.sin(angle) * 5;

  const k1x = (px + f1x) / 2 + 1.5;
  const k1y = (py + f1y) / 2 - 3;
  const k2x = (px + f2x) / 2 + 1.5;
  const k2y = (py + f2y) / 2 - 3;

  pLine(px, py, k2x, k2y, 3, o.legFar);
  pLine(k2x, k2y, f2x, f2y, 3, o.legFar);
  pLine(px, py, k1x, k1y, 3, o.legNear);
  pLine(k1x, k1y, f1x, f1y, 3, o.legNear);

  ctx.fillStyle = '#111';
  ctx.fillRect(Math.round(f2x) - 2, Math.round(f2y) - 1, 5, 2);
  ctx.fillRect(Math.round(f1x) - 2, Math.round(f1y) - 1, 5, 2);

  pLine(px, py, qx, qy, 5, o.jersey);
  pLine(qx, qy, gx, gy, 3, o.skin);

  if (o.hair) {
    const flut = o.hairFlutter;
    pCircle(hdx, hdy, 6, o.hair);
    pCircle(hdx + 2, hdy + 1, 4, o.skin);
    if (o.hairFlow) {
      for (let k = 0; k < 4; k++) {
        const ph = k * 0.8;
        const w = Math.sin(flut * 1.2 + ph);
        const x0 = hdx - 5, y0 = hdy - 2 + k * 2.6;
        const L = 10 + (k % 2);
        const x1 = x0 - L - w * 2;
        const y1 = y0 + 2 + k * 1.5 + w;
        const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        const bend = 2 + k * 0.4 + w * 1.2;
        pLine(x0, y0, mx, my + bend, 2, o.hair);
        pLine(mx, my + bend, x1, y1, 2, o.hair);
      }
    } else {
      pLine(hdx - 5, hdy - 1, hdx - 6.5, hdy - 1, 2, o.hair);
      pLine(hdx - 6, hdy + 2, hdx - 7.5, hdy + 2, 2, o.hair);
    }
  } else {
    pCircle(hdx, hdy, 6, o.helmet);
    pCircle(hdx + 1.5, hdy + 2, 3, o.skin);
  }

  if (o.glasses) {
    ctx.fillStyle = '#8a5a24';
    ctx.fillRect(hdx, hdy - 1, 2, 3);
    ctx.fillRect(hdx + 3, hdy - 1, 2, 3);
    ctx.fillRect(hdx + 2, hdy, 1, 1);
    ctx.fillStyle = '#c98a4a';
    ctx.fillRect(hdx + 1, hdy, 1, 1);
    ctx.fillRect(hdx + 4, hdy, 1, 1);
  } else {
    ctx.fillStyle = '#222';
    ctx.fillRect(hdx + 3, hdy + 1, 1, 1);
  }

  if (lights) {
    const lx = hx + 2, ly = hy + 2;
    pCircle(lx, ly, 3, 'rgba(255,247,192,0.35)');
    ctx.fillStyle = '#fff7c0';
    ctx.fillRect(lx - 1, ly - 1, 3, 2);
  }
}

function drawScene() {
  if (night) {
    ctx.fillStyle = '#0d1636';
    ctx.fillRect(0, 0, W, 56);
    ctx.fillStyle = '#111c44';
    ctx.fillRect(0, 56, W, 44);
    ctx.fillStyle = '#162252';
    ctx.fillRect(0, 100, W, 52);
    for (const st of stars) {
      const a = 0.3 + 0.4 * Math.abs(Math.sin(twinkleT * 2 + st.p));
      ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')';
      ctx.fillRect(st.x, st.y, 1, 1);
    }
    pCircle(336, 38, 11, 'rgba(242,236,216,0.15)');
    pCircle(336, 38, 7, '#f2ecd8');
    pCircle(334, 36, 2, '#d8d2b8');
    pCircle(339, 40, 2, '#d8d2b8');
  } else {
    ctx.fillStyle = '#59c4ff';
    ctx.fillRect(0, 0, W, 56);
    ctx.fillStyle = '#79d4ff';
    ctx.fillRect(0, 56, W, 44);
    ctx.fillStyle = '#a3e3ff';
    ctx.fillRect(0, 100, W, 52);
    pCircle(40, 38, 12, 'rgba(255,223,77,0.3)');
    pCircle(40, 38, 8, '#ffdf3d');
    pCircle(40, 38, 4, '#fff7ae');
  }

  for (const c of clouds) drawSprite(CLOUD, night ? CLOUD_MAP_N : CLOUD_MAP, c.x, c.y, c.s);

  const hillFar = night ? '#1c3a26' : '#4faf55';
  const hillNear = night ? '#152e1e' : '#3f9f49';
  pCircle(40, 150, 66, hillFar);
  pCircle(190, 150, 80, hillFar);
  pCircle(320, 152, 60, hillFar);
  pCircle(120, 158, 54, hillNear);
  pCircle(260, 156, 60, hillNear);

  const bMap = night ? BACK_MAP_N : back.map;
  for (const t of back.trees) drawSprite(back.rows, bMap, t.x, back.baseY, back.scale * t.v);

  ctx.fillStyle = night ? '#1d4a26' : '#3fae49';
  ctx.fillRect(0, 152, W, 26);
  for (const s of speckles) {
    ctx.fillStyle = night ? s.n : s.c;
    ctx.fillRect(Math.round(s.x), Math.round(s.y), s.s, s.s);
  }

  const mMid = night ? MID_MAP_N : mid.map;
  for (const t of mid.trees) drawSprite(mid.rows, mMid, t.x, mid.baseY, mid.scale * t.v);

  ctx.fillStyle = night ? '#23262c' : '#575b63';
  ctx.fillRect(0, 178, W, 30);
  ctx.fillStyle = night ? '#2e3138' : '#6d737c';
  ctx.fillRect(0, 178, W, 2);

  const o = scroll % 28;
  ctx.fillStyle = night ? '#8a8d66' : '#ffe14d';
  for (let x = -o; x < W; x += 28) ctx.fillRect(Math.round(x), 193, 10, 3);

  ctx.fillStyle = night ? '#0e3318' : '#2f8f3e';
  ctx.fillRect(0, 208, W, 8);

  const boyYb = Math.sin(wheelA * 2) - jumpH;
  const girlYb = Math.sin(girlWheelA * 2) - girlJumpH;
  drawCyclist(BX, wheelA, boyYb, boyOpts);
  girlOpts.hairFlutter = Math.sin(girlT * 6);
  drawCyclist(BX - girlOff, girlWheelA, girlYb, girlOpts);

  if (lights) {
    const beam = (x, yb) => {
      const lx = x + 42, ly = HY + 2 + yb;
      const k = Math.min(2.2, Math.max(0.3, (204 - ly) / 31));
      drawCone(lx, ly, lx + 80 * k, 204 - 12 * k, 204 + 12 * k, 0.1);
      drawCone(lx, ly, lx + 55 * k, 204 - 7 * k, 204 + 7 * k, 0.16);
    };
    beam(BX, boyYb);
    beam(BX - girlOff, girlYb);
  }

  ctx.fillStyle = 'rgba(130,130,140,0.55)';
  for (const d of dust) ctx.fillRect(Math.round(d.x), Math.round(d.y), 2, 2);

  const fMap = night ? FRONT_MAP_N : front.map;
  for (const t of front.trees) drawSprite(front.rows, fMap, t.x, front.baseY, front.scale * t.v);
}

let last = performance.now();
let scroll = 0;
let wheelA = 0;
let dustT = 0;
let jumpH = 0;
let vy = 0;
let grounded = true;
let girlT = 0;
let girlOff = 105;
let girlWheelA = 0;
let girlDustT = 0;
let girlJumpH = 0;
let girlVy = 0;
let girlGrounded = true;
let girlJumpPending = false;
let girlJumpAt = 0;
let night = false;
let lights = false;
let twinkleT = 0;

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyN') night = !night;
  if (e.code === 'KeyL') lights = !lights;
  if (e.code === 'Space') {
    e.preventDefault();
    if (grounded) {
      grounded = false;
      vy = -360;
      if (girlGrounded && !girlJumpPending) {
        girlJumpPending = true;
        girlJumpAt = girlT + 0.15;
      }
    }
  }
});

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  twinkleT += dt;

  scroll += 80 * dt;
  wheelA += 80 * dt / R;

  girlT += dt;
  girlOff = 105 + 30 * Math.sin(girlT * 0.5);
  girlWheelA += (80 - 15 * Math.cos(girlT * 0.5)) / R * dt;

  girlDustT += dt;
  if (girlDustT > 0.15) {
    girlDustT = 0;
    dust.push({
      x: BX - girlOff - 8 + Math.random() * 6,
      y: 196,
      vx: -15 - Math.random() * 20,
      vy: -10 - Math.random() * 15,
      life: 0.4
    });
  }

  if (girlJumpPending && girlT >= girlJumpAt) {
    girlJumpPending = false;
    girlGrounded = false;
    girlVy = -300;
  }

  if (!girlGrounded) {
    girlJumpH -= girlVy * dt;
    girlVy += 900 * dt;
    if (girlJumpH <= 0 && girlVy > 0) {
      girlJumpH = 0;
      girlVy = 0;
      girlGrounded = true;
      for (let i = 0; i < 4; i++) {
        dust.push({
          x: BX - girlOff + Math.random() * 40 - 10,
          y: 198,
          vx: -10 - Math.random() * 20,
          vy: -30 - Math.random() * 25,
          life: 0.4
        });
      }
    }
  }

  if (!grounded) {
    jumpH -= vy * dt;
    vy += 900 * dt;
    if (jumpH <= 0 && vy > 0) {
      jumpH = 0;
      vy = 0;
      grounded = true;
      for (let i = 0; i < 5; i++) {
        dust.push({
          x: BX + Math.random() * 40 - 10,
          y: 198,
          vx: -10 - Math.random() * 20,
          vy: -30 - Math.random() * 25,
          life: 0.4
        });
      }
    }
  }

  for (const c of clouds) c.x -= 8 * dt;
  while (clouds.length && clouds[0].x < -70) clouds.shift();
  let lastC = clouds[clouds.length - 1];
  while (lastC.x < W + 60) {
    const nx = lastC.x + 90 + Math.random() * 90;
    clouds.push({ x: nx, y: 26 + Math.floor(Math.random() * 44), s: 2 });
    lastC = clouds[clouds.length - 1];
  }

  for (const s of speckles) {
    s.x -= 80 * dt;
    if (s.x < -20) s.x += W + 40;
  }

  updateTrees(back, dt);
  updateTrees(mid, dt);
  updateTrees(front, dt);

  dustT += dt;
  if (dustT > 0.09) {
    dustT = 0;
    dust.push({
      x: BX - 10 + Math.random() * 6,
      y: 196,
      vx: -20 - Math.random() * 30,
      vy: -15 - Math.random() * 20,
      life: 0.5
    });
  }
  for (let i = dust.length - 1; i >= 0; i--) {
    const d = dust[i];
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    d.life -= dt;
    if (d.life <= 0) dust.splice(i, 1);
  }

  drawScene();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
