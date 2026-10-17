// solve.js — Chạy trọn một bài: chuỗi input → chuỗi output, như một chương trình nộp lên hệ thống chấm.
// Dùng cho script kiểm thử. Lỗi input / cạnh âm trả về một dòng "Lỗi: ..." thay vì ném ngoại lệ.

import { parseInput, formatOutput, InputError } from './parser.js';
import { createGraph, GraphError } from './graph.js';
import { ALGORITHMS } from './algorithms.js';

/**
 * @param {string} text input theo định dạng n m s [t] + m cạnh
 * @param {string} algorithmId khóa trong ALGORITHMS
 * @param {{directed?: boolean}} [options]
 * @returns {string} output (kết thúc bằng xuống dòng)
 */
export function solve(text, algorithmId = 'dijkstra-heap', { directed = true } = {}) {
  try {
    const input = parseInput(text);
    const graph = createGraph(input.n, input.edges, { directed });
    const { result } = ALGORITHMS[algorithmId].run(graph, input.s, { t: input.t, recordTrace: false });
    return formatOutput(result, input.t);
  } catch (err) {
    if (err instanceof InputError || err instanceof GraphError) return `Lỗi: ${err.message}\n`;
    throw err;
  }
}
