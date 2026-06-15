// Gera um fundo "plexus" (rede de nos e linhas) em escala de cinzas claros,
// inspirado em fundo_web1.png: denso embaixo, dissolvendo para o topo.
const fs = require('fs');
const path = require('path');

const W = 1440, H = 1024;
const N = 170;          // numero de nos
const DIST = 132;       // distancia maxima para conectar dois nos
const rand = (a, b) => a + Math.random() * (b - a);

// distribui pontos com densidade crescente em direcao a base
const pts = [];
let guard = 0;
while (pts.length < N && guard < N * 40) {
  guard++;
  const x = rand(0, W);
  const y = rand(0, H);
  const prob = 0.05 + 0.95 * Math.pow(y / H, 2); // raro no topo, denso embaixo
  if (Math.random() < prob) {
    const red = Math.random() < 0.05;
    pts.push({ x, y, red });
  }
}

// linhas entre nos proximos (plexus); mais visiveis quanto mais embaixo
let lines = '';
for (let i = 0; i < pts.length; i++) {
  for (let j = i + 1; j < pts.length; j++) {
    const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
    const d = Math.hypot(dx, dy);
    if (d < DIST) {
      const yMid = (pts[i].y + pts[j].y) / 2;
      const base = 0.10 + 0.55 * (yMid / H);          // fade vertical
      const op = (base * (1 - d / DIST)).toFixed(3);   // some linhas mais fracas
      lines += `<line x1="${pts[i].x.toFixed(1)}" y1="${pts[i].y.toFixed(1)}" x2="${pts[j].x.toFixed(1)}" y2="${pts[j].y.toFixed(1)}" stroke="#9aa2ad" stroke-opacity="${op}"/>`;
    }
  }
}

// nos: dots cinza, alguns com halo; poucos com acento vermelho
let nodes = '';
pts.forEach((p) => {
  const fade = (0.25 + 0.65 * (p.y / H));
  const r = rand(1.3, 2.6);
  if (p.red) {
    nodes += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r + 4).toFixed(1)}" fill="#e63946" fill-opacity="${(0.10 * fade).toFixed(3)}"/>`;
    nodes += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r + 0.4).toFixed(1)}" fill="#e63946" fill-opacity="${(0.6 * fade).toFixed(3)}"/>`;
  } else {
    // halo suave + ponto
    nodes += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r + 3).toFixed(1)}" fill="#aeb6c0" fill-opacity="${(0.12 * fade).toFixed(3)}"/>`;
    nodes += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="#8b94a1" fill-opacity="${(0.7 * fade).toFixed(3)}"/>`;
  }
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">
<defs>
  <linearGradient id="bgv" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f8f9fb"/>
    <stop offset="55%" stop-color="#eef1f4"/>
    <stop offset="100%" stop-color="#e4e8ed"/>
  </linearGradient>
  <radialGradient id="glow" cx="50%" cy="12%" r="60%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#bgv)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<g stroke-width="1">${lines}</g>
<g>${nodes}</g>
</svg>`;

const out = path.join(__dirname, 'public', 'imagens', 'bg-plexus.svg');
fs.writeFileSync(out, svg);
console.log('Gerado:', out, '(' + (svg.length / 1024).toFixed(1) + ' KB)', '| nos:', pts.length);
