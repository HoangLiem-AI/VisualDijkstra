// xuat-trace.mjs — Xuất trace thật của các ví dụ ra JSON để đưa vào report (không chép tay).
// Cách dùng (trong thư mục gốc dự án):  node 4_Report/tools/xuat-trace.mjs
// Kết quả: 4_Report/so-lieu/trace-vi-du.json

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseInput, formatOutput } from '../../1_SourceCode/src/core/parser.js';
import { createGraph } from '../../1_SourceCode/src/core/graph.js';
import { ALGORITHMS } from '../../1_SourceCode/src/core/algorithms.js';
import { SAMPLES } from '../../1_SourceCode/src/core/samples.js';

const here = dirname(fileURLToPath(import.meta.url));
const fmt = (x) => (x === Infinity ? '∞' : String(x));

function run(sampleId, algoId) {
  const sample = SAMPLES.find((x) => x.id === sampleId);
  const input = parseInput(sample.text);
  const graph = createGraph(input.n, input.edges, { directed: sample.directed });
  const { result, trace } = ALGORITHMS[algoId].run(graph, input.s, { t: input.t, allowNegative: true });
  return {
    sample: sampleId,
    algorithm: algoId,
    input: sample.text.trim(),
    output: formatOutput(result, input.t).trim(),
    stats: result.stats,
    steps: trace.map((st, i) => ({
      k: i + 1,
      type: st.type,
      line: st.line,
      message: st.message,
      pq: st.pq.map((x) => `(${x.vertex}, ${fmt(x.key)})`).join(' '),
      dist: st.dist.slice(1).map(fmt),
      finalized: st.finalized.slice(1),
    })),
  };
}

const data = {
  heap: run('vi-du-6-dinh', 'dijkstra-heap'),
  array: run('vi-du-6-dinh', 'dijkstra-array'),
  bf: run('vi-du-6-dinh', 'bellman-ford'),
  negative: run('canh-am-dijkstra-sai', 'dijkstra-heap'),
  negativeBf: run('canh-am-dijkstra-sai', 'bellman-ford'),
  cycle: run('chu-trinh-am', 'bellman-ford'),
};
const out = resolve(here, '../so-lieu/trace-vi-du.json');
writeFileSync(out, JSON.stringify(data, null, 1));
console.log('Đã ghi', out, Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.steps.length])));
