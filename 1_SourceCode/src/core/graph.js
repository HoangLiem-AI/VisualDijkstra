// graph.js — Biểu diễn đồ thị bằng danh sách kề.
// Đỉnh đánh số 1..n; các mảng có kích thước n + 1, ô số 0 bỏ trống.
// Không dùng DOM: chạy được cả trên trình duyệt lẫn Node.

/** Thông báo khi chạy Dijkstra trên đồ thị có cạnh âm (script kiểm thử dùng để so khớp). */
export const NEGATIVE_EDGE_MESSAGE =
  'Đồ thị có cạnh trọng số âm: Dijkstra không đảm bảo đúng. Hãy dùng Bellman-Ford.';

/** Lỗi do đồ thị không thỏa điều kiện của thuật toán (ví dụ cạnh âm với Dijkstra). */
export class GraphError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'GraphError';
    this.code = code;
  }
}

/**
 * Tạo đồ thị từ danh sách cạnh.
 * @param {number} n số đỉnh
 * @param {{u:number, v:number, w:number}[]} edges danh sách cạnh
 * @param {{directed?: boolean}} options mặc định có hướng
 * @returns {{n:number, directed:boolean, edges:object[], adj:object[][]}}
 */
export function createGraph(n, edges, { directed = true } = {}) {
  const adj = Array.from({ length: n + 1 }, () => []);
  const list = [];

  edges.forEach((e, id) => {
    const edge = { id, u: e.u, v: e.v, w: e.w };
    list.push(edge);
    adj[e.u].push(edge);
    // Vô hướng: thêm cạnh ngược, giữ cùng id để giao diện tô đúng một cạnh
    if (!directed) adj[e.v].push({ id, u: e.v, v: e.u, w: e.w });
  });

  return { n, directed, edges: list, adj };
}

/**
 * Hàm relax mặc định, dùng chung cho mọi thuật toán: giá trị tới v khi đi cạnh `edge` từ giá trị t.
 * Tách riêng để sau này thay bằng "giờ đến sớm nhất theo lịch chuyến".
 */
export function defaultRelax(edge, t) {
  return t + edge.w;
}

/** In khoảng cách: Infinity → ∞ */
export const fmtDist = (x) => (x === Infinity ? '∞' : String(x));

/** Câu tóm tắt đường đi s → t cho bước kết thúc của trace. */
export function pathMessage(path, dist, s, t) {
  if (t === null) return '';
  return path
    ? ` Đường đi ngắn nhất ${s}→${t}: ${path.join(' → ')} (độ dài ${dist[t]})`
    : ` Không có đường đi từ ${s} tới ${t}`;
}

/** Đồ thị có cạnh trọng số âm hay không. */
export function hasNegativeEdge(graph) {
  return graph.edges.some((e) => e.w < 0);
}

/**
 * Dựng lại đường đi s → t từ mảng prev.
 * @returns {number[] | null} dãy đỉnh, hoặc null nếu t không tới được
 */
export function buildPath(prev, dist, s, t) {
  if (dist[t] === Infinity) return null;
  const path = [];
  for (let v = t; v !== null; v = prev[v]) {
    path.push(v);
    if (path.length > prev.length) return null; // phòng vòng lặp do prev sai
  }
  path.reverse();
  return path[0] === s ? path : null;
}
