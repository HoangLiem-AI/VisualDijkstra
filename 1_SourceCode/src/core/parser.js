// parser.js — Đọc input và ghi output theo định dạng kiểu Wecode.
//
// Input:            Output:
//   n m s [t]         dist[1]   (-1 nếu không tới được)
//   u1 v1 w1          ...
//   ...               dist[n]
//   um vm wm          s -> ... -> t   (chỉ khi có t; -1 nếu không có đường)
//
// Parser chỉ kiểm tra cú pháp và ràng buộc chung. Việc cấm cạnh âm do từng
// thuật toán tự kiểm tra (Dijkstra cấm, Bellman-Ford cho phép).

export const LIMITS = {
  MAX_N: 100000,
  MAX_M: 200000,
  MAX_ABS_W: 1e9,
};

/** Lỗi định dạng input, kèm số dòng (đánh số từ 1) để báo cho người dùng. */
export class InputError extends Error {
  constructor(message, line = null) {
    super(line === null ? message : `Dòng ${line}: ${message}`);
    this.name = 'InputError';
    this.line = line;
  }
}

const INT_RE = /^-?\d+$/;

function toInt(token, lineNo, name) {
  if (!INT_RE.test(token)) {
    throw new InputError(`"${token}" không phải số nguyên (${name})`, lineNo);
  }
  return Number(token);
}

function checkRange(value, lo, hi, lineNo, name) {
  if (value < lo || value > hi) {
    throw new InputError(`${name} = ${value} nằm ngoài khoảng [${lo}, ${hi}]`, lineNo);
  }
}

/**
 * Phân tích chuỗi input.
 * @param {string} text
 * @returns {{n:number, m:number, s:number, t:number|null, edges:{u:number,v:number,w:number}[]}}
 * @throws {InputError}
 */
export function parseInput(text) {
  // Giữ số dòng gốc, bỏ dòng trống
  const lines = String(text)
    .split(/\r?\n/)
    .map((raw, i) => ({ no: i + 1, tokens: raw.trim().split(/\s+/).filter(Boolean) }))
    .filter((l) => l.tokens.length > 0);

  if (lines.length === 0) throw new InputError('Input rỗng');

  // Dòng đầu: n m s [t]
  const head = lines[0];
  if (head.tokens.length < 3 || head.tokens.length > 4) {
    throw new InputError('dòng đầu phải có dạng "n m s" hoặc "n m s t"', head.no);
  }
  const n = toInt(head.tokens[0], head.no, 'n');
  const m = toInt(head.tokens[1], head.no, 'm');
  const s = toInt(head.tokens[2], head.no, 's');
  const t = head.tokens.length === 4 ? toInt(head.tokens[3], head.no, 't') : null;

  checkRange(n, 1, LIMITS.MAX_N, head.no, 'n');
  checkRange(m, 0, LIMITS.MAX_M, head.no, 'm');
  checkRange(s, 1, n, head.no, 's');
  if (t !== null) checkRange(t, 1, n, head.no, 't');

  // m dòng cạnh
  const edgeLines = lines.slice(1);
  if (edgeLines.length < m) {
    throw new InputError(`khai báo m = ${m} cạnh nhưng chỉ có ${edgeLines.length} dòng cạnh`);
  }
  if (edgeLines.length > m) {
    throw new InputError(`thừa dữ liệu: khai báo m = ${m} cạnh`, edgeLines[m].no);
  }

  const edges = edgeLines.map(({ no, tokens }) => {
    if (tokens.length !== 3) throw new InputError('mỗi cạnh phải có dạng "u v w"', no);
    const u = toInt(tokens[0], no, 'u');
    const v = toInt(tokens[1], no, 'v');
    const w = toInt(tokens[2], no, 'w');
    checkRange(u, 1, n, no, 'u');
    checkRange(v, 1, n, no, 'v');
    checkRange(w, -LIMITS.MAX_ABS_W, LIMITS.MAX_ABS_W, no, 'w');
    return { u, v, w };
  });

  return { n, m, s, t, edges };
}

/**
 * Ghi kết quả ra chuỗi output.
 * @param {{dist:number[], path:number[]|null}} result kết quả thuật toán
 * @param {number|null} t đỉnh đích (null nếu input không có t)
 */
export function formatOutput(result, t = null) {
  const out = [];
  for (let i = 1; i < result.dist.length; i++) {
    out.push(result.dist[i] === Infinity ? '-1' : String(result.dist[i]));
  }
  if (t !== null) out.push(result.path ? result.path.join(' -> ') : '-1');
  return out.join('\n') + '\n';
}
