// Gera um fundo low-poly (malha triangulada com nos) em cinza claro
const fs = require('fs');
const path = require('path');

const W = 1440, H = 1024;
const cols = 14, rows = 10;
const cw = W / cols, ch = H / rows;

// pontos numa grade com jitter (bordas sem jitter para cobrir tudo)
const pts = [];
for (let r = 0; r <= rows; r++) {
  for (let c = 0; c <= cols; c++) {
    let x = c * cw, y = r * ch;
    const edge = (c === 0 || c === cols || r === 0 || r === rows);
    if (!edge) {
      x += (Math.random() - 0.5) * cw * 0.7;
      y += (Math.random() - 0.5) * ch * 0.7;
    }
    pts.push({ x, y });
  }
}
const idx = (r, c) => r * (cols + 1) + c;

// tons de cinza claro para as faces dos triangulos
const fills = ['#ffffff', '#fafbfc', '#f5f7f9', '#eef1f4', '#f8f9fb', '#f2f4f7'];
const pick = () => fills[Math.floor(Math.random() * fills.length)];

let tris = '';
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const a = pts[idx(r, c)], b = pts[idx(r, c + 1)];
    const d = pts[idx(r + 1, c)], e = pts[idx(r + 1, c + 1)];
    // dois triangulos por celula, diagonal alternada
    if ((r + c) % 2 === 0) {
      tris += `<polygon points="${a.x.toFixed(1)},${a.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)} ${e.x.toFixed(1)},${e.y.toFixed(1)}" fill="${pick()}"/>`;
      tris += `<polygon points="${a.x.toFixed(1)},${a.y.toFixed(1)} ${e.x.toFixed(1)},${e.y.toFixed(1)} ${d.x.toFixed(1)},${d.y.toFixed(1)}" fill="${pick()}"/>`;
    } else {
      tris += `<polygon points="${a.x.toFixed(1)},${a.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)} ${d.x.toFixed(1)},${d.y.toFixed(1)}" fill="${pick()}"/>`;
      tris += `<polygon points="${b.x.toFixed(1)},${b.y.toFixed(1)} ${e.x.toFixed(1)},${e.y.toFixed(1)} ${d.x.toFixed(1)},${d.y.toFixed(1)}" fill="${pick()}"/>`;
    }
  }
}

// linhas das arestas da grade (conexoes)
let lines = '';
for (let r = 0; r <= rows; r++) {
  for (let c = 0; c <= cols; c++) {
    const p = pts[idx(r, c)];
    if (c < cols) { const q = pts[idx(r, c + 1)]; lines += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}"/>`; }
    if (r < rows) { const q = pts[idx(r + 1, c)]; lines += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}"/>`; }
    if (r < rows && c < cols) { const q = pts[idx(r + 1, c + 1)]; lines += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke-opacity="0.5"/>`; }
  }
}

// nos (pontos) nos vertices; alguns com acento vermelho
let nodes = '';
pts.forEach((p) => {
  const red = Math.random() < 0.06;
  if (red) {
    nodes += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.6" fill="#e63946" fill-opacity="0.55"/>`;
    nodes += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="none" stroke="#e63946" stroke-opacity="0.18" stroke-width="0.8"/>`;
  } else {
    nodes += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="1.8" fill="#c3c9d1"/>`;
  }
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<rect width="${W}" height="${H}" fill="#ffffff"/>
<g>${tris}</g>
<g stroke="#dfe3e9" stroke-width="0.8">${lines}</g>
<g>${nodes}</g>
</svg>`;

const out = path.join(__dirname, 'public', 'imagens', 'bg-lowpoly.svg');
fs.writeFileSync(out, svg);
console.log('Gerado:', out, '(' + (svg.length / 1024).toFixed(1) + ' KB)');
