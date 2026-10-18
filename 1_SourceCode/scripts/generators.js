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

/**
 * Mạng bưu chính mô phỏng (gần với thực tế giao hàng). Trọng số = phút di chuyển, cạnh hai chiều.
 * Đỉnh 1..3: trung tâm khai thác (TTKT) vùng Hà Nội, Đà Nẵng, TP.HCM; 4..66: TTKT của 63 tỉnh; 67..n: bưu cục.
 * - Dày ở các trung tâm: 3 TTKT vùng nối nhau; TTKT vùng nối mọi TTKT tỉnh trong vùng;
 *   mỗi TTKT tỉnh nối thêm 3 TTKT tỉnh gần nhất cùng vùng. TTKT vùng còn trực tiếp phục vụ bưu cục nội thành.
 * - Thưa ở bưu cục: bưu cục chỉ nối với TTKT phụ trách (khoảng 10% nối thêm TTKT gần thứ hai), không nối nhau.
 * Trả về { n, edges, s, t }: s là một bưu cục ở miền Bắc, t là bưu cục xa nhất ở miền Nam.
 */
export function postalNetwork(r, n = 1250) {
  // Tọa độ km trên "bản đồ" dọc 1650 km; mỗi vùng là một dải [yLo, yHi]
  const REGIONS = [
    { name: 'Hà Nội', hub: [150, 150], yLo: 0, yHi: 450, provinces: 25 },
    { name: 'Đà Nẵng', hub: [250, 780], yLo: 450, yHi: 1100, provinces: 19 },
    { name: 'TP.HCM', hub: [150, 1400], yLo: 1100, yHi: 1650, provinces: 19 },
  ];
  const pos = [null];   // pos[v] = [x, y]
  const region = [null]; // vùng của đỉnh
  const center = [null]; // TTKT phụ trách (với bưu cục)
  REGIONS.forEach((g, k) => { pos.push(g.hub); region.push(k); center.push(0); });
  REGIONS.forEach((g, k) => {
    for (let i = 0; i < g.provinces; i++) {
      pos.push([r.int(20, 330), r.int(g.yLo + 20, g.yHi - 20)]);
      region.push(k); center.push(0);
    }
  });
  const nCenters = pos.length - 1; // 66
  const near = (p, radius) => [p[0] + r.int(-radius, radius), p[1] + r.int(-radius, radius)];
  for (let v = nCenters + 1; v <= n; v++) {
    // ~25% bưu cục nội thành do TTKT vùng phục vụ, còn lại chia ngẫu nhiên cho TTKT tỉnh
    const c = r.next() < 0.25 ? r.int(1, 3) : r.int(4, nCenters);
    pos.push(near(pos[c], c <= 3 ? 25 : 35));
    region.push(region[c]); center.push(c);
  }

  const km = (a, b) => Math.hypot(pos[a][0] - pos[b][0], pos[a][1] - pos[b][1]);
  const edges = [];
  const seen = new Set();
  // speed: km/h; extra: phút bốc xếp cố định trên tuyến
  const link = (a, b, speed, extra = 0) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a === b || seen.has(key)) return;
    seen.add(key);
    const w = Math.max(1, Math.round((km(a, b) / speed) * 60) + extra);
    edges.push({ u: a, v: b, w }, { u: b, v: a, w });
  };

  // Trục chính giữa 3 TTKT vùng (cao tốc / bay nội địa quy đổi)
  link(1, 2, 70, 30); link(2, 3, 70, 30); link(1, 3, 70, 30);
  // TTKT vùng ↔ TTKT tỉnh, và TTKT tỉnh ↔ 3 TTKT tỉnh gần nhất cùng vùng
  for (let p = 4; p <= nCenters; p++) {
    link(region[p] + 1, p, 60, 20);
    const peers = [];
    for (let q = 4; q <= nCenters; q++) if (q !== p && region[q] === region[p]) peers.push(q);
    peers.sort((a, b) => km(p, a) - km(p, b));
    for (const q of peers.slice(0, 3)) link(p, q, 50, 15);
  }
  // Bưu cục ↔ TTKT phụ trách; khoảng 10% nối thêm TTKT gần thứ hai cùng vùng
  for (let v = nCenters + 1; v <= n; v++) {
    link(v, center[v], 30, 5);
    if (r.next() < 0.1) {
      let best = 0;
      for (let c = 1; c <= nCenters; c++) {
        if (c !== center[v] && region[c] === region[v] && (!best || km(v, c) < km(v, best))) best = c;
      }
      if (best) link(v, best, 30, 5);
    }
  }

  let s = 0, t = 0;
  for (let v = nCenters + 1; v <= n; v++) {
    if (!s && region[v] === 0 && center[v] > 3) s = v;
    if (!t || pos[v][1] > pos[t][1]) t = v;
  }
  return { n, edges, s, t };
}
