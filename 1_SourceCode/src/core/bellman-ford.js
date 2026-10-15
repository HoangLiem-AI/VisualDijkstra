// bellman-ford.js — Bellman-Ford (quy hoạch động). Độ phức tạp O(V·E).
//
// Công thức truy hồi: d_k(v) = min( d_{k−1}(v), min_{(u,v)∈E} [ d_{k−1}(u) + w(u,v) ] )
// với d_k(v) là độ dài đường đi ngắn nhất s → v dùng tối đa k cạnh.
// Sau n − 1 vòng mọi đường đi đơn đều đã xét; nếu vẫn relax được thì có chu trình âm.
// Cho phép cạnh âm. Trả về { result, trace } cùng cấu trúc với các bản Dijkstra,
// thêm loại bước `round` (bắt đầu một vòng) và `negative-cycle`.

import { buildPath, defaultRelax, fmtDist as fmt, pathMessage } from './graph.js';

export const PSEUDO_CODE = [
  'for mỗi đỉnh v: dist[v] ← ∞; prev[v] ← null',
  'dist[s] ← 0',
  'for i ← 1 to n − 1:                  ▷ vòng i: đường đi dùng ≤ i cạnh',
  '    for mỗi cạnh (u, v, w):',
  '        if dist[u] = ∞: continue',
  '        nd ← relax((u, v, w), dist[u])   ▷ mặc định dist[u] + w',
  '        if nd < dist[v]:',
  '            dist[v] ← nd; prev[v] ← u',
  '    if vòng i không cập nhật gì: break  ▷ dừng sớm',
  'for mỗi cạnh (u, v, w):              ▷ kiểm tra chu trình âm',
  '    if relax((u, v, w), dist[u]) < dist[v]: báo chu trình âm',
  'return dist, prev',
];

/**
 * Tìm các đỉnh trên chu trình âm, bắt đầu từ cạnh (u, v) vẫn còn relax được.
 * Lùi theo prev n bước để chắc chắn đã rơi vào chu trình, rồi đi vòng một lượt.
 */
function findCycle(prev, u, v, n) {
  const p = prev.slice();
  p[v] = u;
  let x = v;
  for (let i = 0; i < n && x !== null; i++) x = p[x];
  if (x === null) return []; // phòng hờ, không xảy ra nếu prev đúng
  const cycle = [x];
  for (let y = p[x]; y !== x && y !== null; y = p[y]) cycle.push(y);
  return cycle.reverse(); // theo chiều cạnh: cycle[0] → cycle[1] → … → cycle[0]
}

/**
 * Chạy Bellman-Ford từ đỉnh s.
 * @param {object} graph đồ thị từ createGraph()
 * @param {number} s đỉnh nguồn
 * @param {object} [options] { t, relax, recordTrace } như dijkstraHeap
 * @returns {{ result: object, trace: object[] }}
 *   result.negativeCycle = true và result.cycle = [...] nếu có chu trình âm tới được từ s
 */
export function bellmanFord(graph, s, options = {}) {
  const { t = null, relax = defaultRelax, recordTrace = true } = options;
  const n = graph.n;

  // Danh sách cung theo thứ tự input; vô hướng thì mỗi cạnh cho hai cung
  const arcs = [];
  for (const e of graph.edges) {
    arcs.push(e);
    if (!graph.directed) arcs.push({ id: e.id, u: e.v, v: e.u, w: e.w });
  }

  const dist = new Array(n + 1).fill(Infinity);
  const prev = new Array(n + 1).fill(null);
  const finalized = new Array(n + 1).fill(false); // Bellman-Ford chỉ "chốt" khi kết thúc
  const stats = { rounds: 0, relaxations: 0, improvements: 0 };
  const trace = [];
  const maxRound = Math.max(0, n - 1);
  let round = 0;

  const record = (type, line, current, edge, message, extra = {}) => {
    if (!recordTrace) return;
    trace.push({
      type,
      line,
      current,
      edge: edge ? { id: edge.id, u: edge.u, v: edge.v, w: edge.w } : null,
      dist: dist.slice(),
      prev: prev.slice(),
      finalized: finalized.slice(),
      pq: [], // không dùng hàng đợi
      round,
      maxRound,
      message,
      ...extra,
    });
  };

  // Dòng 1–2: khởi tạo
  dist[s] = 0;
  record('init', 2, s, null, `Khởi tạo: dist[${s}] = 0, các đỉnh khác = ∞`);

  // Dòng 3: tối đa n − 1 vòng
  for (round = 1; round <= maxRound; round++) {
    stats.rounds++;
    record('round', 3, null, null, `Vòng ${round}/${maxRound}: duyệt lần lượt ${arcs.length} cạnh`);
    let changed = false;

    // Dòng 4: duyệt mọi cạnh
    for (const edge of arcs) {
      const { u, v } = edge;

      // Dòng 5: chưa tới được u thì chưa relax được
      if (dist[u] === Infinity) {
        record('relax-fail', 5, u, edge, `Bỏ qua ${u}→${v}: dist[${u}] = ∞`);
        continue;
      }

      // Dòng 6–8: relax qua hàm relax(edge, t)
      const nd = relax(edge, dist[u]);
      stats.relaxations++;
      if (nd < dist[v]) {
        const old = dist[v];
        dist[v] = nd;
        prev[v] = u;
        changed = true;
        stats.improvements++;
        record('relax-ok', 8, u, edge, `Relax ${u}→${v}: ${fmt(old)} → ${nd}`);
      } else {
        record('relax-fail', 7, u, edge,
          `Relax ${u}→${v}: ${dist[u]} + ${edge.w} = ${nd} ≥ ${fmt(dist[v])}, giữ nguyên`);
      }
    }

    // Dòng 9: một vòng không đổi gì thì các vòng sau cũng không đổi
    if (!changed) {
      record('round', 9, null, null, `Vòng ${round} không cập nhật gì → dừng sớm`);
      break;
    }
  }
  round = Math.min(round, maxRound);

  // Dòng 10–11: thêm một lượt; nếu vẫn relax được thì có chu trình âm
  let bad = null;
  for (const edge of arcs) {
    if (dist[edge.u] !== Infinity && relax(edge, dist[edge.u]) < dist[edge.v]) {
      bad = edge;
      break;
    }
  }

  if (bad) {
    const cycle = findCycle(prev, bad.u, bad.v, n);
    record('negative-cycle', 11, bad.u, bad,
      `Sau ${maxRound} vòng cạnh ${bad.u}→${bad.v} vẫn relax được → có chu trình âm: ` +
      `${cycle.length ? [...cycle, cycle[0]].join(' → ') : '?'}. Không tồn tại đường đi ngắn nhất.`,
      { cycle });
    return {
      result: { source: s, target: t, dist, prev, path: null, negativeCycle: true, cycle, stats },
      trace,
    };
  }

  // Dòng 12: kết thúc, các đỉnh tới được đều đã có dist đúng
  for (let v = 1; v <= n; v++) finalized[v] = dist[v] !== Infinity;
  const path = t === null ? null : buildPath(prev, dist, s, t);
  record('done', 12, null, null,
    'Không cạnh nào còn relax được → không có chu trình âm, kết thúc.' + pathMessage(path, dist, s, t));

  return {
    result: { source: s, target: t, dist, prev, path, negativeCycle: false, stats },
    trace,
  };
}
