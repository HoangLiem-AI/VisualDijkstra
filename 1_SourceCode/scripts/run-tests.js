// run-tests.js — Chạy cả 3 thuật toán trên toàn bộ 3_Testcase, in bảng đạt / không đạt và thời gian.
// Cách dùng:
//   node scripts/run-tests.js                 (tất cả nhóm)
//   node scripts/run-tests.js nho dac-biet    (chỉ các nhóm được nêu)
// Kết quả cũng được ghi vào 4_Report/so-lieu/ket-qua-kiem-thu.md để đưa vào report.
//
// Cách chấm:
//   - Dòng khoảng cách: khớp chính xác.
//   - Dòng đường đi: mọi đường hợp lệ s → t có độ dài đúng bằng dist[t] đều được chấp nhận.
//   - Test có cạnh âm: Dijkstra phải báo lỗi cạnh âm; Bellman-Ford phải ra đáp án.
//   - Input sai (.out bắt đầu bằng "Lỗi:") hoặc chu trình âm: output phải khớp chính xác.

import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseInput, NEGATIVE_CYCLE_OUTPUT } from '../src/core/parser.js';
import { NEGATIVE_EDGE_MESSAGE } from '../src/core/graph.js';
import { ALGORITHMS } from '../src/core/algorithms.js';
import { solve } from '../src/core/solve.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEST_ROOT = resolve(HERE, '../../3_Testcase');
const REPORT_FILE = resolve(HERE, '../../4_Report/so-lieu/ket-qua-kiem-thu.md');
const GROUPS = ['nho', 'bien', 'dac-biet', 'lon', 'khong-hop-le'];

// Dijkstra mảng O(V²): bỏ qua khi n quá lớn (10^5 đỉnh ≈ 10^10 phép so sánh)
const ARRAY_MAX_N = 20000;

/** Tách dòng, bỏ khoảng trắng cuối dòng và các dòng trống ở cuối. */
function lines(text) {
  const out = text.replace(/\r/g, '').split('\n').map((l) => l.trimEnd());
  while (out.length && out[out.length - 1] === '') out.pop();
  return out;
}

/**
 * So output với đáp án. Trả về null nếu đạt, hoặc chuỗi mô tả chỗ sai.
 * @param input input đã parse (null nếu input sai)
 */
function check(input, expected, actual) {
  const E = lines(expected);
  const A = lines(actual);

  // Thông báo lỗi hoặc chu trình âm: khớp chính xác
  if (E[0].startsWith('Lỗi:') || E[0] === NEGATIVE_CYCLE_OUTPUT) {
    return E.join('\n') === A.join('\n') ? null : `mong đợi "${E[0]}", nhận "${A[0] ?? ''}"`;
  }
  if (A.length !== E.length) return `số dòng: mong đợi ${E.length}, nhận ${A.length}${A[0]?.startsWith('Lỗi') ? ` (${A[0]})` : ''}`;

  const { n, s, t } = input;
  for (let i = 0; i < n; i++) {
    if (A[i] !== E[i]) return `dist[${i + 1}]: mong đợi ${E[i]}, nhận ${A[i]}`;
  }
  if (t === null) return null;

  // Dòng đường đi
  const want = E[n];
  const got = A[n];
  if (want === '-1') return got === '-1' ? null : `đường đi: mong đợi -1, nhận ${got}`;
  const path = got.split('->').map((x) => Number(x.trim()));
  if (path.some((x) => !Number.isInteger(x))) return `đường đi không đọc được: ${got}`;
  if (path[0] !== s || path[path.length - 1] !== t) return `đường đi phải bắt đầu ở ${s}, kết thúc ở ${t}`;

  // Trọng số nhỏ nhất của cạnh u → v (có thể có cạnh song song)
  const best = new Map();
  for (const e of input.edges) {
    const key = e.u * (n + 1) + e.v;
    if (!best.has(key) || e.w < best.get(key)) best.set(key, e.w);
  }
  let len = 0;
  for (let k = 0; k + 1 < path.length; k++) {
    const w = best.get(path[k] * (n + 1) + path[k + 1]);
    if (w === undefined) return `đường đi dùng cạnh không tồn tại ${path[k]}→${path[k + 1]}`;
    len += w;
  }
  return String(len) === E[t - 1] ? null : `đường đi dài ${len}, khác dist[t] = ${E[t - 1]}`;
}

/* ---------- Chạy ---------- */

const wanted = process.argv.slice(2);
const groups = wanted.length ? GROUPS.filter((g) => wanted.includes(g)) : GROUPS;
const algoIds = Object.keys(ALGORITHMS);
const short = { 'dijkstra-heap': 'Heap', 'dijkstra-array': 'Mảng', 'bellman-ford': 'BF' };

const rows = [];
const total = { pass: 0, fail: 0, skip: 0 };
const failures = [];

for (const g of groups) {
  const dir = join(TEST_ROOT, g);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.in')).sort()) {
    const name = f.slice(0, -3);
    const text = readFileSync(join(dir, f), 'utf8');
    const expected = readFileSync(join(dir, `${name}.out`), 'utf8');

    let input = null;
    try { input = parseInput(text); } catch { /* input sai: đáp án là thông báo lỗi */ }
    const hasNegative = input !== null && input.edges.some((e) => e.w < 0);

    const cells = [];
    for (const id of algoIds) {
      if (id === 'dijkstra-array' && input && input.n > ARRAY_MAX_N) {
        cells.push('— (n lớn)');
        total.skip++;
        continue;
      }
      // Dijkstra gặp cạnh âm: đáp án đúng là báo lỗi
      const want = hasNegative && !ALGORITHMS[id].acceptsNegative ? `Lỗi: ${NEGATIVE_EDGE_MESSAGE}\n` : expected;

      const t0 = performance.now();
      const actual = solve(text, id);
      const ms = performance.now() - t0;

      const err = check(input, want, actual);
      if (err) {
        total.fail++;
        failures.push(`${g}/${name} [${short[id]}]: ${err}`);
        cells.push(`✗ ${ms.toFixed(1)} ms`);
      } else {
        total.pass++;
        cells.push(`✓ ${ms.toFixed(1)} ms`);
      }
    }
    const nm = input ? `${input.n} / ${input.m}` : '—';
    rows.push({ g, name, nm, cells });
  }
}

/* ---------- In bảng ---------- */

const header = ['Nhóm', 'Test', 'n / m', ...algoIds.map((id) => short[id])];
const table = [header, ...rows.map((r) => [r.g, r.name, r.nm, ...r.cells])];
const widths = header.map((_, c) => Math.max(...table.map((row) => row[c].length)));
const fmtRow = (row) => row.map((x, c) => x.padEnd(widths[c])).join('  ');

console.log(fmtRow(header));
console.log(widths.map((w) => '-'.repeat(w)).join('  '));
for (const row of table.slice(1)) console.log(fmtRow(row));
console.log(`\nĐạt: ${total.pass}   Không đạt: ${total.fail}   Bỏ qua: ${total.skip}`);
if (failures.length) {
  console.log('\nChi tiết lỗi:');
  for (const f of failures) console.log('  ' + f);
}

// Ghi bảng Markdown cho report
mkdirSync(dirname(REPORT_FILE), { recursive: true });
const md = [
  '# Kết quả kiểm thử',
  '',
  `Chạy bằng \`node scripts/run-tests.js\` lúc ${new Date().toLocaleString('vi-VN')}, Node.js ${process.version}.`,
  'Thời gian gồm cả đọc input và ghi output (hàm `solve`). "— (n lớn)": Dijkstra mảng O(V²) không chạy với n > 20000.',
  '',
  `**Đạt: ${total.pass} — Không đạt: ${total.fail} — Bỏ qua: ${total.skip}**`,
  '',
  `| ${header.join(' | ')} |`,
  `|${header.map(() => '---').join('|')}|`,
  ...table.slice(1).map((row) => `| ${row.join(' | ')} |`),
  '',
  ...(failures.length ? ['## Lỗi', '', ...failures.map((f) => `- ${f}`), ''] : []),
].join('\n');
writeFileSync(REPORT_FILE, md);
console.log(`\nĐã ghi bảng vào ${REPORT_FILE}`);

process.exitCode = total.fail ? 1 : 0;
