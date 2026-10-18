// gen-tests.js — Sinh bộ testcase vào 3_Testcase/<nhóm>/NN-ten.in và .out, có seed nên chạy lại ra y hệt.
// Cách dùng:  node scripts/gen-tests.js
//
// Đáp án (.out) lấy từ thuật toán chuẩn độc lập, chọn theo kích thước và luôn đối chiếu chéo:
//   n ≤ 8   : vét cạn (brute-force.js), đối chiếu Floyd-Warshall và Bellman-Ford
//   n ≤ 300 : Floyd-Warshall, đối chiếu Bellman-Ford
//   lớn hơn : Bellman-Ford (quy hoạch động, độc lập với Dijkstra); run-tests.js sẽ đối chiếu với 2 bản Dijkstra
// Nhóm khong-hop-le: .out là thông báo lỗi do chương trình in ra (để kiểm tra không bị đổi ngoài ý muốn).

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseInput, formatOutput, NEGATIVE_CYCLE_OUTPUT } from '../src/core/parser.js';
import { createGraph } from '../src/core/graph.js';
import { bellmanFord } from '../src/core/bellman-ford.js';
import { solve } from '../src/core/solve.js';
import { SAMPLES } from '../src/core/samples.js';
import { makeRandom } from './rng.js';
import { bruteForce, floydWarshall, BRUTE_MAX_N } from './brute-force.js';
import { randomGraph, denseGraph, negativeAcyclicGraph, gridGraph, postalNetwork, toInput } from './generators.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../3_Testcase');
const BASE_SEED = 20261018; // seed của test thứ i là BASE_SEED + i
const FLOYD_MAX_N = 300;
const MAX_W = 1e9;

const sample = (id) => SAMPLES.find((x) => x.id === id).text;

/* ---------- Danh sách test ---------- */
// build(r) trả về chuỗi input; r là bộ sinh ngẫu nhiên riêng của test

const TESTS = [
  // ===== nho: đồ thị nhỏ, đáp án bằng vét cạn =====
  { group: 'nho', name: 'vi-du-6-dinh', desc: 'Ví dụ thống nhất dùng trong report và video', build: () => sample('vi-du-6-dinh') },
  ...Array.from({ length: 10 }, (_, k) => ({
    group: 'nho',
    name: `ngau-nhien-${k + 1}`,
    desc: 'Ngẫu nhiên n ≤ 8, trọng số 0..20',
    build: (r) => {
      const n = r.int(3, 8);
      const m = r.int(n, Math.min(n * (n - 1), 3 * n));
      const s = r.int(1, n);
      return toInput(n, randomGraph(r, n, m, 0, 20, { s }), s, r.int(1, n));
    },
  })),

  // ===== bien: giá trị biên =====
  { group: 'bien', name: 'mot-dinh', desc: 'n = 1, m = 0, s = t', build: () => '1 0 1 1\n' },
  { group: 'bien', name: 'khong-canh', desc: 'm = 0: chỉ tới được s', build: () => '5 0 3 5\n' },
  { group: 'bien', name: 's-bang-t', desc: 's = t, đường đi chỉ gồm s', build: (r) => toInput(6, randomGraph(r, 6, 12, 1, 9, { s: 2 }), 2, 2) },
  { group: 'bien', name: 'trong-so-0', desc: 'Mọi trọng số bằng 0', build: (r) => toInput(8, randomGraph(r, 8, 20, 0, 0, { connected: true }), 1, 8) },
  { group: 'bien', name: 'trong-so-max', desc: 'Mọi trọng số 10^9, chuỗi 1000 đỉnh (dist tới 9.99·10^11)', build: () => {
    const edges = [];
    for (let v = 1; v < 1000; v++) edges.push({ u: v, v: v + 1, w: MAX_W });
    return toInput(1000, edges, 1, 1000);
  } },
  { group: 'bien', name: 'khuyen-canh-song-song', desc: 'Có khuyên (u → u) và nhiều cạnh song song khác trọng số', build: () =>
    '4 9 1 4\n1 1 5\n1 2 7\n1 2 3\n1 2 9\n2 2 0\n2 3 4\n2 3 1\n3 4 2\n3 4 2\n' },
  { group: 'bien', name: 'khong-co-t', desc: 'Dòng đầu chỉ có n m s (không in đường đi)', build: (r) => toInput(7, randomGraph(r, 7, 14, 1, 10, { connected: true }), 1) },
  { group: 'bien', name: 't-khong-toi-duoc', desc: 't không tới được: dist = -1, đường đi -1', build: () => '5 4 1 5\n1 2 3\n2 3 4\n3 1 1\n5 4 2\n' },
  { group: 'bien', name: 'n-max-khong-canh', desc: 'n = 10^5, m = 0', build: () => '100000 0 1 100000\n' },

  // ===== dac-biet: tình huống đặc biệt =====
  { group: 'dac-biet', name: 'canh-am-dijkstra-sai', desc: 'Cạnh âm: Dijkstra phải báo lỗi; Bellman-Ford ra 0 1 5 4', build: () => sample('canh-am-dijkstra-sai') },
  { group: 'dac-biet', name: 'chu-trinh-am', desc: 'Chu trình âm 2 → 3 → 4 → 2 tới được từ s', build: () => sample('chu-trinh-am') },
  { group: 'dac-biet', name: 'chu-trinh-am-khong-toi-duoc', desc: 'Có chu trình âm nhưng s không tới được: vẫn có đáp án', build: () =>
    '6 6 1 3\n1 2 4\n2 3 1\n1 3 9\n4 5 -2\n5 6 -2\n6 4 1\n' },
  { group: 'dac-biet', name: 'canh-am-khong-chu-trinh', desc: 'n = 30, nhiều cạnh âm, không có chu trình âm', build: (r) =>
    toInput(30, negativeAcyclicGraph(r, 30, 90, -10, 30), 1, 30) },
  { group: 'dac-biet', name: 'chu-trinh-trong-so-0', desc: 'Chu trình tổng 0 (không âm) có cạnh âm', build: () =>
    '4 5 1 4\n1 2 2\n2 3 3\n3 2 -3\n3 4 1\n1 4 10\n' },
  { group: 'dac-biet', name: 'day-du', desc: 'Đồ thị đầy đủ có hướng n = 40 (1560 cạnh)', build: (r) =>
    toInput(40, denseGraph(r, 40, 40 * 39, 1, 1000), 1, 40) },
  { group: 'dac-biet', name: 'hinh-sao', desc: 'Hình sao: s nối tới 49 đỉnh, không có cạnh khác', build: (r) =>
    toInput(50, Array.from({ length: 49 }, (_, i) => ({ u: 1, v: i + 2, w: r.int(1, 100) })), 1, 50) },
  { group: 'dac-biet', name: 'nhieu-duong-bang-nhau', desc: 'Lưới 6×6 mọi trọng số 1: rất nhiều đường ngắn nhất bằng nhau', build: (r) =>
    toInput(36, gridGraph(r, 6, 6, 1, 1), 1, 36) },
  { group: 'dac-biet', name: 'nhieu-phan-tu-cu', desc: 'i → j (i < j) trọng số (j − i)²: dist bị cập nhật nhiều lần, nhiều phần tử cũ trong heap', build: () => {
    const n = 60;
    const edges = [];
    for (let i = 1; i <= n; i++) for (let j = i + 1; j <= n; j++) edges.push({ u: i, v: j, w: (j - i) ** 2 });
    return toInput(n, edges, 1, n);
  } },

  // ===== lon: đồ thị lớn, chỉ chạy bằng script =====
  { group: 'lon', name: 'thua-ngau-nhien', desc: 'n = 10^5, m = 2·10^5 ngẫu nhiên, w ≤ 10^9', build: (r) =>
    toInput(100000, randomGraph(r, 100000, 200000, 1, MAX_W, { connected: true }), 1, 100000) },
  { group: 'lon', name: 'chuoi-trong-so-max', desc: 'Chuỗi 10^5 đỉnh w = 10^9 (dist tới ≈ 10^14) + 10^5 cạnh ngược', build: () => {
    const edges = [];
    for (let v = 1; v < 100000; v++) edges.push({ u: v, v: v + 1, w: MAX_W });
    for (let v = 2; v <= 100000; v++) edges.push({ u: v, v: v - 1, w: MAX_W });
    return toInput(100000, edges, 1, 100000);
  } },
  { group: 'lon', name: 'day', desc: 'n = 450, m = 2·10^5 (gần đầy đủ)', build: (r) =>
    toInput(450, denseGraph(r, 450, 200000, 1, 1000000), 1, 450) },
  { group: 'lon', name: 'luoi', desc: 'Lưới 220×220 (48400 đỉnh, 192720 cạnh), w 1..100', build: (r) =>
    toInput(220 * 220, gridGraph(r, 220, 220, 1, 100), 1, 220 * 220) },

  // ===== khong-hop-le: input sai, phải báo lỗi rõ ràng =====
  { group: 'khong-hop-le', name: 'rong', desc: 'Input rỗng', invalid: true, build: () => '' },
  { group: 'khong-hop-le', name: 'dong-dau-thieu', desc: 'Dòng đầu thiếu s', invalid: true, build: () => '3 2\n1 2 1\n2 3 1\n' },
  { group: 'khong-hop-le', name: 'khong-phai-so', desc: 'Trọng số là chữ', invalid: true, build: () => '3 1 1\n1 2 a\n' },
  { group: 'khong-hop-le', name: 'so-thuc', desc: 'Trọng số là số thực', invalid: true, build: () => '3 1 1\n1 2 1.5\n' },
  { group: 'khong-hop-le', name: 'n-bang-0', desc: 'n = 0', invalid: true, build: () => '0 0 1\n' },
  { group: 'khong-hop-le', name: 's-ngoai-pham-vi', desc: 's > n', invalid: true, build: () => '3 1 5\n1 2 1\n' },
  { group: 'khong-hop-le', name: 'dinh-ngoai-pham-vi', desc: 'Cạnh tới đỉnh 4 khi n = 3', invalid: true, build: () => '3 1 1\n1 4 1\n' },
  { group: 'khong-hop-le', name: 'trong-so-qua-lon', desc: 'w = 10^9 + 1', invalid: true, build: () => '2 1 1\n1 2 1000000001\n' },
  { group: 'khong-hop-le', name: 'thieu-dong-canh', desc: 'Khai báo m = 3 nhưng có 2 dòng cạnh', invalid: true, build: () => '3 3 1\n1 2 1\n2 3 1\n' },
  { group: 'khong-hop-le', name: 'thua-dong-canh', desc: 'Khai báo m = 1 nhưng có 2 dòng cạnh', invalid: true, build: () => '2 1 1\n1 2 1\n2 1 1\n' },
  { group: 'khong-hop-le', name: 'm-qua-lon', desc: 'm = 200001 vượt giới hạn', invalid: true, build: () => '2 200001 1\n' },

  // Thêm sau cùng để seed của các test cũ không đổi (seed = BASE_SEED + vị trí trong danh sách)
  { group: 'dac-biet', name: 'mang-buu-chinh', desc: 'Mạng bưu chính 1250 điểm: 3 TTKT vùng (HN, ĐN, HCM) + 63 TTKT tỉnh nối dày; 1184 bưu cục chỉ nối TTKT, không nối nhau (thưa). w = phút di chuyển', build: (r) => {
    const { n, edges, s, t } = postalNetwork(r);
    return toInput(n, edges, s, t);
  } },
];

/* ---------- Tính đáp án chuẩn ---------- */

function sameDist(a, b, n) {
  for (let v = 1; v <= n; v++) if (a[v] !== b[v]) return v;
  return 0;
}

/** Trả về { out, ref } với ref là tên nguồn đáp án. Ném lỗi nếu các nguồn không khớp nhau. */
function referenceOutput(text, label) {
  const input = parseInput(text);
  const { n, edges, s, t } = input;
  const bf = bellmanFord(createGraph(n, edges), s, { t, recordTrace: false }).result;

  if (n <= FLOYD_MAX_N) {
    const fw = floydWarshall(n, edges, s);
    if (fw.negativeCycle !== bf.negativeCycle) throw new Error(`${label}: Floyd và Bellman-Ford khác nhau về chu trình âm`);
    if (fw.negativeCycle) return { out: NEGATIVE_CYCLE_OUTPUT + '\n', ref: 'Floyd-Warshall + Bellman-Ford' };
    const v = sameDist(fw.dist, bf.dist, n);
    if (v) throw new Error(`${label}: Floyd và Bellman-Ford khác nhau tại đỉnh ${v}`);

    if (n <= BRUTE_MAX_N) {
      const bt = bruteForce(n, edges, s, t);
      const v2 = sameDist(bt.dist, fw.dist, n);
      if (v2) throw new Error(`${label}: vét cạn khác Floyd tại đỉnh ${v2}`);
      return { out: formatOutput(bt, t), ref: 'vét cạn (+ Floyd, Bellman-Ford)' };
    }
    return { out: formatOutput(bf, t), ref: 'Floyd-Warshall (+ Bellman-Ford)' };
  }

  if (bf.negativeCycle) return { out: NEGATIVE_CYCLE_OUTPUT + '\n', ref: 'Bellman-Ford' };
  return { out: formatOutput(bf, t), ref: 'Bellman-Ford' };
}

/* ---------- Ghi file ---------- */

const groups = [...new Set(TESTS.map((x) => x.group))];
for (const g of groups) {
  const dir = join(ROOT, g);
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(dir)) if (/\.(in|out)$/.test(f)) rmSync(join(dir, f));
}

const rows = Object.fromEntries(groups.map((g) => [g, []])); // bảng README xếp theo nhóm
const counter = {};
TESTS.forEach((test, i) => {
  counter[test.group] = (counter[test.group] || 0) + 1;
  const file = `${String(counter[test.group]).padStart(2, '0')}-${test.name}`;
  const label = `${test.group}/${file}`;
  const seed = BASE_SEED + i;
  const text = test.build(makeRandom(seed));

  const started = performance.now();
  const { out, ref } = test.invalid
    ? { out: solve(text), ref: 'thông báo lỗi của parser' }
    : referenceOutput(text, label);
  if (test.invalid && !out.startsWith('Lỗi:')) throw new Error(`${label}: input sai nhưng không báo lỗi`);

  writeFileSync(join(ROOT, test.group, `${file}.in`), text);
  writeFileSync(join(ROOT, test.group, `${file}.out`), out);

  const head = text.split('\n')[0].split(/\s+/);
  const nm = test.invalid ? '—' : `${head[0]} / ${head[1]}`;
  rows[test.group].push(`| ${test.group} | ${file} | ${test.desc} | ${nm} | ${ref} | ${seed} |`);
  console.log(`${label.padEnd(42)} ${nm.padEnd(18)} ${ref}  (${(performance.now() - started).toFixed(0)} ms)`);
});

// Bảng mô tả bộ test, dùng cho report
const readme = `# Bộ testcase

Sinh bằng \`node scripts/gen-tests.js\` (trong \`1_SourceCode\`). Có seed nên chạy lại ra đúng các file này.
Kiểm tra bằng \`node scripts/run-tests.js\`.

Định dạng: xem README gốc. Đồ thị trong testcase đều **có hướng**.

**Cách chấm** (\`run-tests.js\`):
- Các dòng khoảng cách phải khớp chính xác.
- Dòng đường đi: chấp nhận mọi đường đi hợp lệ từ s tới t có độ dài đúng bằng dist[t] (có thể có nhiều đường ngắn nhất).
- Test có cạnh âm: Dijkstra (heap, mảng) phải báo lỗi cạnh âm; Bellman-Ford phải ra đáp án trong \`.out\`.
- Nhóm \`khong-hop-le\`: output phải đúng thông báo lỗi trong \`.out\`.

| Nhóm | Test | Mô tả | n / m | Nguồn đáp án | Seed |
|---|---|---|---|---|---|
${groups.flatMap((g) => rows[g]).join('\n')}
`;
writeFileSync(join(ROOT, 'README.md'), readme);
console.log(`\nĐã sinh ${TESTS.length} test vào ${ROOT}`);
