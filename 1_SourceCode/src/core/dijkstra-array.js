// dijkstra-array.js — Dijkstra dùng mảng: mỗi lần duyệt cả mảng dist để tìm đỉnh nhỏ nhất.
// Độ phức tạp O(V² + E): tốt cho đồ thị dày (E ≈ V²), kém hơn bản heap với đồ thị thưa.
// Trả về { result, trace } cùng cấu trúc với dijkstra-heap.js.

import {
  GraphError, NEGATIVE_EDGE_MESSAGE, buildPath, hasNegativeEdge, defaultRelax, fmtDist as fmt, pathMessage,
} from './graph.js';

export const PSEUDO_CODE = [
  'for mỗi đỉnh v: dist[v] ← ∞; prev[v] ← null',
  'dist[s] ← 0',
  'lặp tối đa n lần:',
  '    u ← đỉnh chưa chốt có dist nhỏ nhất   ▷ duyệt cả mảng, O(V)',
  '    if dist[u] = ∞: break                 ▷ còn lại đều không tới được',
  '    chốt u                                ▷ dist[u] là ngắn nhất',
  '    for mỗi cạnh (u, v, w) với v chưa chốt:',
  '        nd ← relax((u, v, w), dist[u])     ▷ mặc định dist[u] + w',
  '        if nd < dist[v]:',
  '            dist[v] ← nd; prev[v] ← u',
  'return dist, prev',
];

/**
 * Chạy Dijkstra (mảng) từ đỉnh s. Tham số giống dijkstraHeap.
 * @returns {{ result: object, trace: object[] }}
 * @throws {GraphError} khi có cạnh âm mà allowNegative = false
 */
export function dijkstraArray(graph, s, options = {}) {
  const { t = null, relax = defaultRelax, recordTrace = true, allowNegative = false } = options;
  const n = graph.n;

  if (!allowNegative && hasNegativeEdge(graph)) {
    throw new GraphError('NEGATIVE_EDGE', NEGATIVE_EDGE_MESSAGE);
  }

  const dist = new Array(n + 1).fill(Infinity);
  const prev = new Array(n + 1).fill(null);
  const finalized = new Array(n + 1).fill(false);
  const stats = { extractions: 0, comparisons: 0, relaxations: 0, improvements: 0 };
  const trace = [];

  // Không có hàng đợi: trường pq của trace là các đỉnh ứng viên (chưa chốt, dist < ∞), sắp tăng dần
  const candidates = () => {
    const list = [];
    for (let v = 1; v <= n; v++) {
      if (!finalized[v] && dist[v] !== Infinity) list.push({ vertex: v, key: dist[v] });
    }
    return list.sort((a, b) => a.key - b.key || a.vertex - b.vertex);
  };

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
      pq: candidates(),
      message,
    });
  };

  // Dòng 1–2: khởi tạo
  dist[s] = 0;
  record('init', 2, s, null, `Khởi tạo: dist[${s}] = 0, các đỉnh khác = ∞`);

  let stoppedEarly = false;

  // Dòng 3: mỗi vòng chốt thêm một đỉnh
  for (let k = 0; k < n; k++) {
    // Dòng 4: duyệt mảng tìm đỉnh chưa chốt có dist nhỏ nhất (bằng nhau thì lấy đỉnh số nhỏ)
    let u = -1;
    for (let v = 1; v <= n; v++) {
      if (finalized[v]) continue;
      stats.comparisons++;
      if (u === -1 || dist[v] < dist[u]) u = v;
    }

    // Dòng 5: mọi đỉnh chưa chốt đều không tới được → dừng
    if (dist[u] === Infinity) {
      stoppedEarly = true;
      const path = t === null ? null : buildPath(prev, dist, s, t);
      record('done', 5, null, null,
        'Các đỉnh chưa chốt đều có dist = ∞ (không tới được) → dừng.' + pathMessage(path, dist, s, t));
      break;
    }

    // Dòng 6: chốt u
    finalized[u] = true;
    stats.extractions++;
    record('extract', 6, u, null,
      `Duyệt mảng dist: đỉnh chưa chốt nhỏ nhất là ${u} (dist = ${dist[u]}) → chốt`);

    // Dòng 7–10: relax các cạnh ra khỏi u
    for (const edge of graph.adj[u]) {
      const v = edge.v;
      if (finalized[v]) {
        record('relax-fail', 7, u, edge, `Bỏ qua ${u}→${v}: đỉnh ${v} đã chốt`);
        continue;
      }

      const nd = relax(edge, dist[u]);
      stats.relaxations++;

      if (nd < dist[v]) {
        const old = dist[v];
        dist[v] = nd;
        prev[v] = u;
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
  if (!stoppedEarly) {
    record('done', 11, null, null, 'Đã chốt tất cả các đỉnh → kết thúc.' + pathMessage(path, dist, s, t));
  }

  return {
    result: { source: s, target: t, dist, prev, path, stats },
    trace,
  };
}
