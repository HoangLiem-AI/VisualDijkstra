// benchmark.js — Đo thời gian 3 thuật toán trên đồ thị thưa và đồ thị dày với n tăng dần.
// Cách dùng:  node scripts/benchmark.js
// Chỉ đo phần thuật toán (đồ thị dựng sẵn, recordTrace = false), lấy trung vị của nhiều lần chạy.
// Kết quả: in ra console, ghi 4_Report/so-lieu/benchmark.md và benchmark.csv.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpus } from 'node:os';
import { createGraph } from '../src/core/graph.js';
import { ALGORITHMS } from '../src/core/algorithms.js';
import { makeRandom } from './rng.js';
import { randomGraph, denseGraph } from './generators.js';

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../4_Report/so-lieu');
const SEED = 20261017;
const REPEAT = 5;          // số lần chạy mỗi ô, lấy trung vị
const SLOW_MS = 1500;      // một lần chạy quá lâu thì không lặp lại

// Hai họ đồ thị. limit: n tối đa cho từng thuật toán (vượt thì bỏ qua vì quá chậm)
const FAMILIES = [
  {
    id: 'thua',
    name: 'Đồ thị thưa (m = 4n)',
    sizes: [1000, 2000, 5000, 10000, 20000, 50000, 100000],
    build: (r, n) => randomGraph(r, n, 4 * n, 1, 1000000, { connected: true }),
    limit: { 'dijkstra-array': 20000 },
  },
  {
    id: 'day',
    name: 'Đồ thị dày (m ≈ n² / 2)',
    sizes: [100, 200, 400, 700, 1000],
    build: (r, n) => denseGraph(r, n, Math.floor((n * (n - 1)) / 2), 1, 1000000),
    limit: {},
  },
];

const ids = Object.keys(ALGORITHMS);
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

function measure(id, graph) {
  const times = [];
  let stats;
  for (let k = 0; k < REPEAT; k++) {
    const t0 = performance.now();
    const { result } = ALGORITHMS[id].run(graph, 1, { recordTrace: false });
    times.push(performance.now() - t0);
    stats = result.stats;
    if (times[0] > SLOW_MS) break;
  }
  return { ms: median(times), stats };
}

// Khởi động JIT để lần đo đầu không bị chậm bất thường
{
  const r = makeRandom(1);
  const g = createGraph(500, randomGraph(r, 500, 2000, 1, 100, { connected: true }));
  for (const id of ids) for (let k = 0; k < 20; k++) ALGORITHMS[id].run(g, 1, { recordTrace: false });
}

const results = [];
for (const fam of FAMILIES) {
  console.log(`\n=== ${fam.name} ===`);
  console.log('n'.padStart(7), 'm'.padStart(9), ...ids.map((id) => ALGORITHMS[id].name.padStart(30)));
  for (const n of fam.sizes) {
    const edges = fam.build(makeRandom(SEED + n), n);
    const graph = createGraph(n, edges);
    const row = { family: fam.id, n, m: edges.length };
    for (const id of ids) {
      if (fam.limit[id] && n > fam.limit[id]) {
        row[id] = null;
        continue;
      }
      row[id] = measure(id, graph);
    }
    results.push(row);
    const cell = (x) => (x ? `${x.ms.toFixed(1)} ms` : '—').padStart(30);
    console.log(String(n).padStart(7), String(row.m).padStart(9), ...ids.map((id) => cell(row[id])));
  }
}

/* ---------- Ghi kết quả ---------- */

mkdirSync(OUT_DIR, { recursive: true });

// CSV để vẽ biểu đồ
const csv = ['ho_do_thi,n,m,' + ids.join(',')];
for (const r of results) csv.push([r.family, r.n, r.m, ...ids.map((id) => (r[id] ? r[id].ms.toFixed(3) : ''))].join(','));
writeFileSync(resolve(OUT_DIR, 'benchmark.csv'), csv.join('\n') + '\n');

// Markdown cho report
const md = [
  '# Benchmark',
  '',
  `Chạy bằng \`node scripts/benchmark.js\` lúc ${new Date().toLocaleString('vi-VN')}.`,
  `Máy: ${cpus()[0]?.model ?? '?'}, Node.js ${process.version}. Seed ${SEED}.`,
  `Thời gian là trung vị của ${REPEAT} lần chạy (1 lần nếu chạy quá ${SLOW_MS} ms), chỉ tính phần thuật toán. "—": bỏ qua vì quá chậm.`,
  '',
];
for (const fam of FAMILIES) {
  md.push(`## ${fam.name}`, '');
  md.push(`| n | m | ${ids.map((id) => ALGORITHMS[id].name).join(' | ')} |`);
  md.push(`|---|---|${ids.map(() => '---').join('|')}|`);
  for (const r of results.filter((x) => x.family === fam.id)) {
    md.push(`| ${r.n} | ${r.m} | ${ids.map((id) => (r[id] ? `${r[id].ms.toFixed(1)} ms` : '—')).join(' | ')} |`);
  }
  md.push('');

  // Số phép toán: giải thích vì sao thời gian khác nhau
  md.push('Số phép toán:', '');
  md.push('| n | Heap: push / phần tử cũ | Mảng: phép so sánh | Bellman-Ford: số vòng / lần relax |');
  md.push('|---|---|---|---|');
  for (const r of results.filter((x) => x.family === fam.id)) {
    const h = r['dijkstra-heap']?.stats;
    const a = r['dijkstra-array']?.stats;
    const b = r['bellman-ford']?.stats;
    md.push(`| ${r.n} | ${h ? `${h.pushes} / ${h.staleSkips}` : '—'} | ${a ? a.comparisons : '—'} | ${b ? `${b.rounds} / ${b.relaxations}` : '—'} |`);
  }
  md.push('');
}
writeFileSync(resolve(OUT_DIR, 'benchmark.md'), md.join('\n'));
console.log(`\nĐã ghi ${resolve(OUT_DIR, 'benchmark.md')} và benchmark.csv`);
