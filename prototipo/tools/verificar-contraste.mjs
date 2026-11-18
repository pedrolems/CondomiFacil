// Verifica o contraste WCAG 2.x dos pares de tokens de prototipo/css/tokens.css.
// Uso: node prototipo/tools/verificar-contraste.mjs   (exit 1 se algum par ficar abaixo do mínimo)
// Mínimos: 4,5:1 texto (1.4.3); 3:1 ícones, bordas e componentes (1.4.11).
// Linhas citadas: docs/02-design/01-design-system.md (DS). Não altera nenhum arquivo.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const T = 4.5, G = 3;

// --- cálculo ---
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const hex = (h) => { const m = /^#([0-9a-f]{6})$/i.exec(h); if (!m) throw new Error(`cor inválida: ${h}`); const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const lum = (h) => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// auto-verificação: preto sobre branco = 21:1
assert.equal(Math.round(razao('#000000', '#FFFFFF') * 100) / 100, 21);
assert.equal(Math.round(razao('#FFFFFF', '#000000') * 100) / 100, 21);

// --- leitura do CSS ---
const css = readFileSync(new URL('../css/tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const blocos = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, sel, corpo]) => ({
  sel: sel.trim(),
  vars: Object.fromEntries([...corpo.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()])),
}));
const doBloco = (f) => Object.assign({}, ...blocos.filter((b) => f(b.sel)).map((b) => b.vars));
const base = doBloco((s) => s === ':root');
const claroBloco = doBloco((s) => s.includes('[data-theme="light"]') && !s.includes(':not('));
// O bloco ':root, :root[data-theme="light"]' também casa em tema escuro: tokens não redefinidos (ex.: --fab) herdam dele.
const temas = {
  claro: { ...base, ...claroBloco },
  escuro: { ...base, ...claroBloco, ...doBloco((s) => s === ':root[data-theme="dark"]') },
};
const escuroMedia = { ...base, ...claroBloco, ...doBloco((s) => s.includes(':not([data-theme="light"])')) };

const resolve = (tema, nome, prof = 0) => {
  let v = temas[tema][nome];
  if (v === undefined || prof > 10) return undefined;
  const m = /^var\((--[\w-]+)\)$/.exec(v);
  return m ? resolve(tema, m[1], prof + 1) : v;
};

// --- pares: [fg, bg, mínimo, linha do DS, descrição, razão citada no DS {claro, escuro}] ---
// fg pode ser { claro, escuro } quando o DS usa tokens diferentes por tema.
const P = [
  ['--text-primary', '--bg', T, 'L96', 'Texto principal sobre fundo', { claro: 16.9, escuro: 16.3 }],
  ['--text-primary', '--surface', T, 'L84-96', 'Texto principal sobre superfície'],
  ['--text-secondary', '--bg', T, 'L97', 'Texto de apoio sobre fundo', { claro: 5.7, escuro: 9.4 }],
  ['--text-secondary', '--surface', T, 'L97', 'Texto de apoio sobre superfície', { claro: 5.2, escuro: 8.1 }],
  ['--text-onBrand', '--brand', T, 'L99', 'Texto sobre barra azul', { claro: 10.4, escuro: 10.4 }],
  ['--link', '--bg', T, 'L100', 'Link sobre fundo', { claro: 10.4, escuro: 7.0 }],
  ['--accent-fg', '--bg', T, 'L101/L133', 'Coral de destaque (texto) sobre fundo; coral.700 no claro', { claro: 5.3, escuro: 5.5 }],
  ['--accent-fg', '--surface', T, 'L101', 'Coral de destaque (texto) sobre superfície', { escuro: 4.8 }],
  ['--action-onPrimary', '--action-primary', T, 'L109', 'Texto do botão primário', { claro: 10.4, escuro: 5.5 }],
  ['--action-onDanger', '--action-danger', T, 'L112', 'Texto do botão destrutivo', { claro: 5.6, escuro: 7.2 }],
  ['--action-secondary', '--bg', T, 'L110', 'Texto do botão secundário sobre fundo'],
  ['--onFab', '--fab', G, 'L115/L134', 'Ícone do botão flutuante sobre coral', { claro: 5.5, escuro: 5.5 }],
  ['--border-control', '--bg', G, 'L121', 'Contorno de campo sobre fundo', { claro: 3.9, escuro: 4.4 }],
  ['--border-control', '--surface', G, 'L121', 'Contorno de campo sobre superfície', { escuro: 3.8 }],
  ['--focus', '--bg', G, 'L123', 'Anel de foco sobre fundo', { claro: 10.4, escuro: 7.0 }],
  ['--focus', '--surface', G, 'L123', 'Anel de foco sobre superfície'],
  ['--chart-1', '--bg', G, 'L124/L317', 'Série principal do gráfico sobre fundo'],
  [{ claro: '--coral-700', escuro: '--chart-2' }, '--bg', G, 'L125/L134/L317', 'Série de comparação (claro: contorno coral.700; escuro: chart-2)'],
  // Status (4.4, L145-150): onContainer sobre container (texto) e fg sobre fundo
  ['--neutral-on', '--neutral-container', T, 'L145', 'Neutral onContainer', { claro: 4.8, escuro: 6.0 }],
  ['--info-on', '--info-container', T, 'L146', 'Info onContainer', { claro: 8.8, escuro: 12.1 }],
  ['--success-on', '--success-container', T, 'L147', 'Success onContainer', { claro: 5.9, escuro: 5.5 }],
  ['--warning-on', '--warning-container', T, 'L148', 'Warning onContainer', { claro: 5.5, escuro: 8.0 }],
  ['--danger-on', '--danger-container', T, 'L149', 'Danger onContainer', { claro: 4.9, escuro: 7.0 }],
  ['--accent-on', '--accent-container', T, 'L150', 'Accent onContainer', { claro: 14.5, escuro: 5.4 }],
  ['--neutral-fg', '--bg', T, 'L145', 'Neutral fg sobre fundo'],
  ['--info-fg', '--bg', T, 'L146', 'Info fg sobre fundo'],
  ['--success-fg', '--bg', T, 'L147', 'Success fg sobre fundo'],
  ['--warning-fg', '--bg', T, 'L148', 'Warning fg sobre fundo'],
  ['--danger-fg', '--bg', T, 'L149', 'Danger fg sobre fundo'],
  // Calendário (4.6, L308-310)
  ['--success-on', '--success-container', T, 'L308', 'Calendário: "Livre" em success.onContainer', {}],
  ['--neutral-on', '--neutral-container', T, 'L309', 'Calendário: "Ocupado" em neutral.onContainer', {}],
  ['--text-secondary', '--bg', T, 'L310-311', 'Calendário: "Indisponível" em text.secondary (hachura transparente)', {}],
];
// Isenções documentadas, não verificadas: --text-disabled (L98, WCAG 1.4.3); --scrim e --elev-* (não são texto).
// Valores da paleta 4.1 (verde, âmbar, vermelho) que o DS lista mas tokens.css não declara como base:
const PALETA_DS = ['--green-800', '--green-700', '--green-400', '--green-100', '--green-950', '--amber-800', '--amber-300', '--amber-100',
  '--amber-950', '--red-700', '--red-300', '--red-100', '--red-950'];

let falhas = 0, ausentes = 0, diverge = 0;
const f = (n) => n.toFixed(2).replace('.', ',');
console.log(`Contraste WCAG dos tokens (tokens.css) — mínimos: texto 4,5:1, ícone/componente 3:1\n`);
for (const tema of ['claro', 'escuro']) {
  console.log(`== Tema ${tema} ==`);
  for (const [fgDef, bg, min, linha, desc, citado = {}] of P) {
    const fg = typeof fgDef === 'string' ? fgDef : fgDef[tema];
    const [cf, cb] = [resolve(tema, fg), resolve(tema, bg)];
    const rotulo = `${desc} [${fg} / ${bg}] (DS ${linha})`;
    if (!cf || !cb) { ausentes++; console.log(`AUSENTE  ${rotulo}: ${!cf ? fg : bg} não existe em tokens.css`); continue; }
    const r = razao(cf, cb), ok = r >= min;
    if (!ok) falhas++;
    let nota = '';
    if (citado[tema] !== undefined && Math.abs(citado[tema] - r) > 0.1) { diverge++; nota = ` | DS cita ${String(citado[tema]).replace('.', ',')}:1 (diverge)`; }
    console.log(`${ok ? 'OK     ' : 'FALHA  '} ${f(r)}:1 (mín ${String(min).replace('.', ',')}) ${cf} sobre ${cb} — ${rotulo}${nota}`);
  }
  console.log('');
}
for (const v of PALETA_DS) if (base[v] === undefined) { ausentes++; console.log(`AUSENTE  Paleta DS 4.1 (L73-75): ${v} não declarado em :root de tokens.css`); }

// Consistência: prefers-color-scheme (escuro) deve igualar [data-theme="dark"]
const ks = new Set([...Object.keys(escuroMedia), ...Object.keys(temas.escuro)]);
const difs = [...ks].filter((k) => escuroMedia[k] !== temas.escuro[k]);
if (difs.length) { falhas++; console.log(`FALHA  Bloco prefers-color-scheme difere de [data-theme="dark"] em: ${difs.join(', ')}`); }
else console.log('OK       Bloco prefers-color-scheme: dark idêntico a :root[data-theme="dark"]');

console.log(`\nResumo: ${P.length * 2} pares, ${falhas} falha(s), ${ausentes} ausente(s), ${diverge} divergência(s) com a razão citada no DS (informativo).`);
process.exit(falhas ? 1 : 0);
