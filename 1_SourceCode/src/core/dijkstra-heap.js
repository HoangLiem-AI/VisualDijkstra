// dijkstra-heap.js — Dijkstra dùng min-heap với lazy deletion. Độ phức tạp O((V + E) log V).
// Trả về { result, trace }; giao diện chỉ phát lại trace, không chạy lại thuật toán.

import { MinHeap } from './min-heap.js';
import { GraphError, buildPath, hasNegativeEdge, defaultRelax, fmtDist as fmt, pathMessage } from './graph.js';

// Pseudo-code hiển thị trên giao diện. Trường `line` của mỗi bước trace là số dòng ở đây (từ 1).
export const PSEUDO_CODE = [
  'for mỗi đỉnh v: dist[v] ← ∞; prev[v] ← null',
  'dist[s] ← 0; PQ.push(s, 0)',
  'while PQ khác rỗng:',
  '    (u, d) ← PQ.popMin()',
  '    if u đã chốt: continue          ▷ phần tử cũ (lazy deletion)',
  '    chốt u                          ▷ dist[u] là ngắn nhất',
  '    for mỗi cạnh (u, v, w) với v chưa chốt:',
  '        nd ← relax((u, v, w), dist[u])   ▷ mặc định dist[u] + w',
  '        if nd < dist[v]:',
  '            dist[v] ← nd; prev[v] ← u; PQ.push(v, nd)',
  'return dist, prev',
];

/**
 * Chạy Dijkstra (min-heap) từ đỉnh s.
 * @param {object} graph đồ thị từ createGraph()
 * @param {number} s đỉnh nguồn
 * @param {object} [options]
 * @param {number|null} [options.t=null]          đỉnh đích (để dựng đường đi)
 * @param {Function} [options.relax=defaultRelax]  hàm relax(edge, t)
 * @param {boolean} [options.recordTrace=true]     false khi chạy đồ thị lớn (benchmark)
 * @param {boolean} [options.allowNegative=false]  true chỉ dùng cho chế độ minh họa Dijkstra sai với cạnh âm
 * @returns {{ result: object, trace: object[] }}
 * @throws {GraphError} khi có cạnh âm mà allowNegative = false
 */
export function dijkstraHeap(graph, s, options = {}) {
  const { t = null, relax = defaultRelax, recordTrace = true, allowNegative = false } = options;
  const n = graph.n;

  if (!allowNegative && hasNegativeEdge(graph)) {
    throw new GraphError(
      'NEGATIVE_EDGE',
      'Đồ thị có cạnh trọng số âm: Dijkstra không đảm bảo đúng. Hãy dùng Bellman-Ford.'
    );
  }

  const dist = new Array(n + 1).fill(Infinity);
  const prev = new Array(n + 1).fill(null);
  const finalized = new Array(n + 1).fill(false);
  const pq = new MinHeap();
  const stats = { pushes: 0, pops: 0, staleSkips: 0, relaxations: 0, improvements: 0 };
  const trace = [];

  // Ghi một bước trace. dist, prev, finalized, pq đều là bản sao tại thời điểm này.
  const record = (type, line, current, edge, message) => {
    if (!recordTrace) return;
    trace.push({
      type,
      line,
      current,
      edge: edge ? { id: edge.id, u: edge.u, v: edge.v, w: edge.w } : null,
      dist: dist.slice(),
      prev: prev.slice(),
      finalized: finalized.slice(),
      pq: pq.toSortedArray(),
      message,
    });
  };

  // Dòng 1–2: khởi tạo
  dist[s] = 0;
  pq.push(s, 0);
  stats.pushes++;
  record('init', 2, s, null, `Khởi tạo: dist[${s}] = 0, các đỉnh khác = ∞; đẩy (${s}, 0) vào hàng đợi`);

  // Dòng 3: lặp đến khi hàng đợi rỗng
  while (!pq.isEmpty()) {
    // Dòng 4: lấy phần tử có khóa nhỏ nhất
    const { vertex: u, key: d } = pq.pop();
    stats.pops++;

    // Dòng 5: lazy deletion — u đã chốt thì (u, d) là bản cũ, bỏ qua
    if (finalized[u]) {
      stats.staleSkips++;
      record('skip-stale', 5, u, null,
        `Lấy (${u}, ${d}) nhưng đỉnh ${u} đã chốt với dist = ${dist[u]} → bỏ qua phần tử cũ`);
      continue;
    }

    // Dòng 6: chốt u, dist[u] không thay đổi nữa
    finalized[u] = true;
    record('extract', 6, u, null, `Lấy (${u}, ${d}) ra khỏi hàng đợi, chốt dist[${u}] = ${d}`);

    // Dòng 7: duyệt các cạnh ra khỏi u
    for (const edge of graph.adj[u]) {
      const v = edge.v;
      if (finalized[v]) {
        record('relax-fail', 7, u, edge, `Bỏ qua ${u}→${v}: đỉnh ${v} đã chốt`);
        continue;
      }

      // Dòng 8: tính giá trị mới qua hàm relax (không cộng trực tiếp)
      const nd = relax(edge, dist[u]);
      stats.relaxations++;

      // Dòng 9–10: cập nhật nếu tốt hơn, đẩy bản mới vào heap
      if (nd < dist[v]) {
        const old = dist[v];
        dist[v] = nd;
        prev[v] = u;
        pq.push(v, nd);
        stats.pushes++;
        stats.improvements++;
        record('relax-ok', 10, u, edge, `Relax ${u}→${v}: ${fmt(old)} → ${nd}`);
      } else {
        record('relax-fail', 9, u, edge,
          `Relax ${u}→${v}: ${dist[u]} + ${edge.w} = ${nd} ≥ ${fmt(dist[v])}, giữ nguyên`);
      }
    }
  }

  // Dòng 11: kết thúc
  const path = t === null ? null : buildPath(prev, dist, s, t);
  const doneMsg = 'Hàng đợi rỗng → kết thúc.' + pathMessage(path, dist, s, t);
  record('done', 11, null, null, doneMsg);

  return {
    result: { source: s, target: t, dist, prev, path, stats },
    trace,
  };
}
