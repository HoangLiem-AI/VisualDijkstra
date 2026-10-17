# Mô phỏng thuật toán Dijkstra — CS112

## Cấu trúc
- `src/core/` — lõi thuật toán, không dùng DOM, chạy được bằng Node và trình duyệt.
  - `graph.js`: danh sách kề, `buildPath`, `GraphError`
  - `parser.js`: đọc input / ghi output, `InputError`
  - `min-heap.js`: heap nhị phân
  - `dijkstra-heap.js`: Dijkstra + min-heap (lazy deletion), trả về `{ result, trace }`
  - `dijkstra-array.js`: Dijkstra dùng mảng, O(V² + E)
  - `bellman-ford.js`: Bellman-Ford, O(V·E); phát hiện chu trình âm
  - `algorithms.js`: danh mục thuật toán (tên, hàm chạy, pseudo-code, độ phức tạp)
  - `samples.js`: đồ thị ví dụ dùng chung cho web và script
  - `solve.js`: chuỗi input → chuỗi output (như chương trình nộp chấm), dùng cho kiểm thử
- `src/ui/` — giao diện, chỉ phát lại trace
  - `renderer.js`: vẽ đồ thị bằng Cytoscape.js, tô màu theo bước
  - `player.js`: Tiến / Lùi / Tự chạy (không đụng DOM)
  - `panels.js`: pseudo-code, bảng dist/prev, hàng đợi, nhật ký
  - `app.js`: nối input → lõi → player → các khung hiển thị
- `scripts/` — script Node:
  - `serve.js` (server tĩnh), `demo-trace.js` (in trace)
  - `gen-tests.js` (sinh testcase có seed), `run-tests.js` (chấm 3 thuật toán), `brute-force.js` (vét cạn, Floyd-Warshall)
  - `benchmark.js` (đo thời gian), `rng.js` (mulberry32), `generators.js` (sinh đồ thị)

## Chạy (cần Node.js ≥ 18)
```
cd 1_SourceCode
npm start                                   # giao diện web: http://localhost:8080
node scripts/demo-trace.js                  # đồ thị mẫu 6 đỉnh
node scripts/demo-trace.js file.in          # đọc từ file
node scripts/demo-trace.js file.in --vo-huong
node scripts/demo-trace.js --thuat-toan=mang     # heap | mang | bf
node scripts/demo-trace.js file.in --minh-hoa-am # cho Dijkstra chạy với cạnh âm
node scripts/run-tests.js                   # chấm toàn bộ 3_Testcase
node scripts/gen-tests.js                   # sinh lại 3_Testcase
node scripts/benchmark.js                   # đo thời gian, ghi 4_Report/so-lieu/
```

## Một bước trace
```
{ type, line, current, edge, dist, prev, finalized, pq, message }
```
- `type`: `init | extract | skip-stale | relax-ok | relax-fail | done`; Bellman-Ford thêm `round`, `negative-cycle`
- Bellman-Ford thêm trường `round`, `maxRound`; bước `negative-cycle` có `cycle` (dãy đỉnh của chu trình)
- Dijkstra mảng: `pq` là các đỉnh ứng viên (chưa chốt, dist < ∞); Bellman-Ford: `pq` rỗng
- `line`: số dòng trong `PSEUDO_CODE` (từ 1)
- `dist`, `prev`, `finalized`: mảng bản sao, chỉ số 1..n (ô 0 bỏ trống)
- `pq`: bản sao hàng đợi, sắp tăng dần, dạng `[{ vertex, key }]`
- `edge`: `{ id, u, v, w }` hoặc `null`
