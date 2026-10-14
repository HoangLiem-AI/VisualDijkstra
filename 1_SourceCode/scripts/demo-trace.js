// demo-trace.js — Chạy Dijkstra (heap) trên một đồ thị và in toàn bộ trace ra console.
// Cách dùng:
//   node scripts/demo-trace.js              (dùng đồ thị mẫu 6 đỉnh bên dưới)
//   node scripts/demo-trace.js file.in      (đọc input từ file)
//   node scripts/demo-trace.js file.in --vo-huong

import { readFileSync } from 'node:fs';
import { parseInput, formatOutput, InputError } from '../src/core/parser.js';
import { createGraph, GraphError } from '../src/core/graph.js';
import { dijkstraHeap, PSEUDO_CODE } from '../src/core/dijkstra-heap.js';

// Đồ thị mẫu 6 đỉnh, có hướng, s = 1, t = 6.
// Được chọn để trace có đủ các loại bước: relax-ok, relax-fail (chưa chốt và đã chốt), skip-stale.
const SAMPLE = `6 11 1 6
1 2 4
1 3 1
3 2 2
2 4 5
3 4 8
3 5 10
2 5 9
4 5 2
4 6 6
5 6 3
6 4 1
`;

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const directed = !args.includes('--vo-huong');

const fmt = (x) => (x === Infinity ? '∞' : String(x));

function printStep(step, k, n) {
  const dist = [];
  for (let i = 1; i <= n; i++) {
    const mark = step.finalized[i] ? '*' : '';
    const from = step.prev[i] === null ? '-' : step.prev[i];
    dist.push(`${i}:${fmt(step.dist[i])}${mark}(${from})`);
  }
  const pq = step.pq.map((x) => `(${x.vertex},${x.key})`).join(' ') || '∅';

  console.log(`#${String(k).padStart(2)} [${step.type}] dòng ${step.line}: ${PSEUDO_CODE[step.line - 1].trim()}`);
  console.log(`     → ${step.message}`);
  console.log(`     dist: ${dist.join('  ')}`);
  console.log(`     PQ  : ${pq}`);
}

try {
  const text = file ? readFileSync(file, 'utf8') : SAMPLE;
  const input = parseInput(text);
  const graph = createGraph(input.n, input.edges, { directed });

  console.log('=== Input ===');
  console.log(text.trim());
  console.log(`(${directed ? 'có hướng' : 'vô hướng'})\n`);

  const { result, trace } = dijkstraHeap(graph, input.s, { t: input.t });

  console.log(`=== Trace (${trace.length} bước) — ký hiệu  đỉnh:dist(prev), * = đã chốt ===`);
  trace.forEach((step, k) => printStep(step, k, input.n));

  console.log('\n=== Thống kê ===');
  console.log(result.stats);

  console.log('\n=== Output ===');
  process.stdout.write(formatOutput(result, input.t));
} catch (err) {
  if (err instanceof InputError || err instanceof GraphError) {
    console.error(`Lỗi: ${err.message}`);
    process.exitCode = 1;
  } else {
    throw err;
  }
}
