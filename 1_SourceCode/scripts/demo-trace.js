// demo-trace.js — Chạy một thuật toán trên một đồ thị và in toàn bộ trace ra console.
// Cách dùng:
//   node scripts/demo-trace.js                    (đồ thị mẫu 6 đỉnh, Dijkstra heap)
//   node scripts/demo-trace.js file.in            (đọc input từ file)
//   node scripts/demo-trace.js file.in --vo-huong
//   node scripts/demo-trace.js --thuat-toan=mang  (heap | mang | bf)
//   node scripts/demo-trace.js file.in --minh-hoa-am   (cho Dijkstra chạy dù có cạnh âm)

import { readFileSync } from 'node:fs';
import { parseInput, formatOutput, InputError } from '../src/core/parser.js';
import { createGraph, GraphError } from '../src/core/graph.js';
import { ALGORITHMS } from '../src/core/algorithms.js';
import { SAMPLES } from '../src/core/samples.js';

// Đồ thị mẫu 6 đỉnh (ví dụ thống nhất), dùng chung với giao diện web.
const SAMPLE = SAMPLES[0].text;

const ALIASES = { heap: 'dijkstra-heap', mang: 'dijkstra-array', bf: 'bellman-ford' };

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const directed = !args.includes('--vo-huong');
const allowNegative = args.includes('--minh-hoa-am');
const algoArg = (args.find((a) => a.startsWith('--thuat-toan=')) || '--thuat-toan=heap').split('=')[1];
const algo = ALGORITHMS[ALIASES[algoArg] || algoArg];

const fmt = (x) => (x === Infinity ? '∞' : String(x));

function printStep(step, k, n) {
  const dist = [];
  for (let i = 1; i <= n; i++) {
    const mark = step.finalized[i] ? '*' : '';
    const from = step.prev[i] === null ? '-' : step.prev[i];
    dist.push(`${i}:${fmt(step.dist[i])}${mark}(${from})`);
  }

  console.log(`#${String(k).padStart(2)} [${step.type}] dòng ${step.line}: ${algo.pseudo[step.line - 1].split('▷')[0].trim()}`);
  console.log(`     → ${step.message}`);
  console.log(`     dist: ${dist.join('  ')}`);
  if (algo.queue === 'heap') console.log(`     PQ  : ${step.pq.map((x) => `(${x.vertex},${x.key})`).join(' ') || '∅'}`);
  if (algo.queue === 'array') console.log(`     ứng viên: ${step.pq.map((x) => `${x.vertex}:${x.key}`).join(' ') || '∅'}`);
}

try {
  if (!algo) throw new InputError(`Không có thuật toán "${algoArg}". Chọn: heap, mang, bf`);

  const text = file ? readFileSync(file, 'utf8') : SAMPLE;
  const input = parseInput(text);
  const graph = createGraph(input.n, input.edges, { directed });

  console.log('=== Input ===');
  console.log(text.trim());
  console.log(`(${directed ? 'có hướng' : 'vô hướng'}) — ${algo.name}, ${algo.complexity}\n`);

  const { result, trace } = algo.run(graph, input.s, { t: input.t, allowNegative });

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
