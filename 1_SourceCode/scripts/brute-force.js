// brute-force.js — Đáp án chuẩn độc lập với các cài đặt chính, để sinh và đối chiếu testcase.
//   - bruteForce: vét cạn mọi đường đi đơn từ s bằng DFS. O(n!) nên chỉ dùng n ≤ 8.
//   - floydWarshall: quy hoạch động O(n³), dùng cho n vừa (≤ khoảng 300); phát hiện được chu trình âm.
// Cách dùng riêng:  node scripts/brute-force.js file.in    (in output theo định dạng đề)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseInput, formatOutput, NEGATIVE_CYCLE_OUTPUT } from '../src/core/parser.js';

export const BRUTE_MAX_N = 8;

/**
 * Vét cạn: thử mọi đường đi đơn (không lặp đỉnh) xuất phát từ s, giữ đường ngắn nhất tới từng đỉnh.
 * Đúng khi không có chu trình âm (khi đó luôn có đường ngắn nhất là đường đơn).
 */
export function bruteForce(n, edges, s, t = null) {
  if (n > BRUTE_MAX_N) throw new Error(`Vét cạn chỉ dùng cho n ≤ ${BRUTE_MAX_N}`);
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const e of edges) adj[e.u].push(e);

  const dist = new Array(n + 1).fill(Infinity);
  const bestPath = new Array(n + 1).fill(null);
  const visited = new Array(n + 1).fill(false);
  const path = [s];
  dist[s] = 0;
  bestPath[s] = [s];
  visited[s] = true;

  (function dfs(u, len) {
    for (const e of adj[u]) {
      if (visited[e.v]) continue;
      const nl = len + e.w;
      path.push(e.v);
      if (nl < dist[e.v]) {
        dist[e.v] = nl;
        bestPath[e.v] = path.slice();
      }
      visited[e.v] = true;
      dfs(e.v, nl);
      visited[e.v] = false;
      path.pop();
    }
  })(s, 0);

  return { dist, path: t === null ? null : bestPath[t], negativeCycle: false };
}

/**
 * Floyd-Warshall: D_k[i][j] = min(D_{k−1}[i][j], D_{k−1}[i][k] + D_{k−1}[k][j]).
 * Trả về dist từ s; negativeCycle = true nếu có chu trình âm tới được từ s (cùng quy ước với Bellman-Ford).
 * Không dựng đường đi (path = null): script kiểm thử tự kiểm tra tính hợp lệ của đường đi.
 */
export function floydWarshall(n, edges, s) {
  const d = Array.from({ length: n + 1 }, (_, i) => {
    const row = new Array(n + 1).fill(Infinity);
    row[i] = 0;
    return row;
  });
  for (const e of edges) if (e.w < d[e.u][e.v]) d[e.u][e.v] = e.w;

  for (let k = 1; k <= n; k++) {
    const dk = d[k];
    for (let i = 1; i <= n; i++) {
      const dik = d[i][k];
      if (dik === Infinity) continue;
      const di = d[i];
      for (let j = 1; j <= n; j++) {
        if (dik + dk[j] < di[j]) di[j] = dik + dk[j];
      }
    }
  }

  let negativeCycle = false;
  for (let v = 1; v <= n; v++) if (d[s][v] !== Infinity && d[v][v] < 0) negativeCycle = true;
  return { dist: d[s], path: null, negativeCycle };
}

// Chạy trực tiếp: in đáp án của vét cạn (n ≤ 8) hoặc Floyd-Warshall
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const input = parseInput(readFileSync(process.argv[2], 'utf8'));
  const small = input.n <= BRUTE_MAX_N;
  const res = small ? bruteForce(input.n, input.edges, input.s, input.t)
    : floydWarshall(input.n, input.edges, input.s);
  if (small) {
    // Vét cạn không phát hiện được chu trình âm, nên đối chiếu thêm với Floyd-Warshall
    if (floydWarshall(input.n, input.edges, input.s).negativeCycle) res.negativeCycle = true;
  }
  console.error(`(đáp án bằng ${small ? 'vét cạn' : 'Floyd-Warshall'})`);
  process.stdout.write(res.negativeCycle ? NEGATIVE_CYCLE_OUTPUT + '\n' : formatOutput(res, small ? input.t : null));
}
