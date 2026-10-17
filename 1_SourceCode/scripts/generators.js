// generators.js — Các hàm sinh đồ thị, dùng chung cho gen-tests.js và benchmark.js.
// Mỗi hàm nhận bộ sinh r = makeRandom(seed) và trả về mảng cạnh { u, v, w } (đỉnh 1..n, có hướng).

/** m cạnh ngẫu nhiên; nếu connected = true thì m − (n − 1) cạnh đầu là cây khung từ s để hầu hết đỉnh tới được. */
export function randomGraph(r, n, m, wLo, wHi, { s = 1, connected = false, loops = false } = {}) {
  const edges = [];
  if (connected && n > 1) {
    // Cây ngẫu nhiên: thứ tự thăm ngẫu nhiên bắt đầu từ s, mỗi đỉnh nối từ một đỉnh đứng trước
    const order = r.shuffle(Array.from({ length: n }, (_, i) => i + 1).filter((v) => v !== s));
    order.unshift(s);
    for (let i = 1; i < n && edges.length < m; i++) {
      edges.push({ u: order[r.int(0, i - 1)], v: order[i], w: r.int(wLo, wHi) });
    }
  }
  while (edges.length < m) {
    const u = r.int(1, n);
    const v = r.int(1, n);
    if (u === v && !loops) continue;
    edges.push({ u, v, w: r.int(wLo, wHi) });
  }
  return r.shuffle(edges);
}

/** Đồ thị dày: chọn ngẫu nhiên m cặp (u, v) khác nhau, u ≠ v. m ≤ n(n − 1). */
export function denseGraph(r, n, m, wLo, wHi) {
  const pairs = [];
  for (let u = 1; u <= n; u++) for (let v = 1; v <= n; v++) if (u !== v) pairs.push([u, v]);
  r.shuffle(pairs);
  return pairs.slice(0, m).map(([u, v]) => ({ u, v, w: r.int(wLo, wHi) }));
}

/** Cạnh âm nhưng không có chu trình âm: cạnh âm chỉ đi từ đỉnh số nhỏ tới đỉnh số lớn (không tạo vòng). */
export function negativeAcyclicGraph(r, n, m, wLo, wHi) {
  const edges = [];
  while (edges.length < m) {
    let u = r.int(1, n);
    let v = r.int(1, n);
    if (u === v) continue;
    let w = r.int(wLo, wHi);
    if (w < 0 && u > v) [u, v] = [v, u];
    edges.push({ u, v, w });
  }
  return edges;
}

/** Lưới rows × cols, cạnh hai chiều giữa các ô kề nhau. Đỉnh (i, j) đánh số i·cols + j + 1. */
export function gridGraph(r, rows, cols, wLo, wHi) {
  const id = (i, j) => i * cols + j + 1;
  const edges = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (j + 1 < cols) {
        edges.push({ u: id(i, j), v: id(i, j + 1), w: r.int(wLo, wHi) });
        edges.push({ u: id(i, j + 1), v: id(i, j), w: r.int(wLo, wHi) });
      }
      if (i + 1 < rows) {
        edges.push({ u: id(i, j), v: id(i + 1, j), w: r.int(wLo, wHi) });
        edges.push({ u: id(i + 1, j), v: id(i, j), w: r.int(wLo, wHi) });
      }
    }
  }
  return r.shuffle(edges);
}

/** Ghép thành chuỗi input. */
export function toInput(n, edges, s, t = null) {
  const head = t === null ? `${n} ${edges.length} ${s}` : `${n} ${edges.length} ${s} ${t}`;
  const lines = new Array(edges.length + 1);
  lines[0] = head;
  for (let i = 0; i < edges.length; i++) lines[i + 1] = `${edges[i].u} ${edges[i].v} ${edges[i].w}`;
  return lines.join('\n') + '\n';
}
