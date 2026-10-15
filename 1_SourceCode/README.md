# Mô phỏng thuật toán Dijkstra — CS112

## Cấu trúc
- `src/core/` — lõi thuật toán, không dùng DOM, chạy được bằng Node và trình duyệt.
  - `graph.js`: danh sách kề, `buildPath`, `GraphError`
  - `parser.js`: đọc input / ghi output, `InputError`
  - `min-heap.js`: heap nhị phân
  - `dijkstra-heap.js`: Dijkstra + min-heap (lazy deletion), trả về `{ result, trace }`
  - `samples.js`: đồ thị ví dụ dùng chung cho web và script
- `src/ui/` — giao diện, chỉ phát lại trace
  - `renderer.js`: vẽ đồ thị bằng Cytoscape.js, tô màu theo bước
  - `player.js`: Tiến / Lùi / Tự chạy (không đụng DOM)
  - `panels.js`: pseudo-code, bảng dist/prev, hàng đợi, nhật ký
  - `app.js`: nối input → lõi → player → các khung hiển thị
- `scripts/` — script Node: `serve.js` (server tĩnh), `demo-trace.js`

## Chạy (cần Node.js ≥ 18)
```
cd 1_SourceCode
npm start                                   # giao diện web: http://localhost:8080
node scripts/demo-trace.js                  # đồ thị mẫu 6 đỉnh
node scripts/demo-trace.js file.in          # đọc từ file
node scripts/demo-trace.js file.in --vo-huong
```

## Một bước trace
```
{ type, line, current, edge, dist, prev, finalized, pq, message }
```
- `type`: `init | extract | skip-stale | relax-ok | relax-fail | done`
- `line`: số dòng trong `PSEUDO_CODE` (từ 1)
- `dist`, `prev`, `finalized`: mảng bản sao, chỉ số 1..n (ô 0 bỏ trống)
- `pq`: bản sao hàng đợi, sắp tăng dần, dạng `[{ vertex, key }]`
- `edge`: `{ id, u, v, w }` hoặc `null`
