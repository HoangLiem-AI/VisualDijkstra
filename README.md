# Mô phỏng thuật toán Dijkstra — Bài tập lớn CS112

Mô phỏng từng bước thuật toán Dijkstra (dùng min-heap) tìm đường đi ngắn nhất từ một đỉnh nguồn.

Có hai cách dùng:
- **Giao diện web**: nhập đồ thị, xem từng bước trên hình vẽ (mục 2).
- **Script console**: in toàn bộ các bước ra terminal, dùng để kiểm tra nhanh (mục 3).

## 1. Cài đặt

Chỉ cần **Node.js ≥ 18**. Dự án không có thư viện ngoài nên không phải chạy `npm install`.

Kiểm tra Node đã cài chưa:
```
node --version
```
Nếu báo không tìm thấy lệnh `node`:
- Windows: `winget install OpenJS.NodeJS.LTS`, hoặc tải bản LTS ở https://nodejs.org
- Cài xong thì **mở terminal mới** để nhận lệnh `node`.

## 2. Chạy giao diện web

```
cd 1_SourceCode
npm start
```
(hoặc `node scripts/serve.js`). Sau đó mở trình duyệt vào **http://localhost:8080**. Nhấn `Ctrl+C` trong terminal để dừng server.

> **Không mở `index.html` bằng cách double-click.** Trình duyệt chặn JavaScript module khi mở file trực tiếp (`file://`), trang sẽ trống. Luôn mở qua server như trên.
>
> Cổng 8080 bị chiếm thì đổi cổng: `node scripts/serve.js 8081`.
> Lần đầu mở trang cần có Internet để tải thư viện vẽ đồ thị Cytoscape.js.

Cách khác, nếu không muốn dùng Node:
- VS Code: cài extension **Live Server**, chuột phải `1_SourceCode/index.html` → *Open with Live Server*.
- Python: `cd 1_SourceCode` rồi `python -m http.server 8080`.

### Sử dụng

1. **Nhập đồ thị** ở ô *Input* (cột trái), hoặc chọn một ví dụ có sẵn. Đánh dấu *Đồ thị vô hướng* nếu cần. Bấm **Chạy thuật toán** (hoặc `Ctrl+Enter`).
2. **Xem từng bước** bằng các nút dưới đồ thị:

   | Nút | Phím tắt | Tác dụng |
   |---|---|---|
   | ⏮ / ⏭ | `Home` / `End` | Về bước đầu / tới bước cuối |
   | ◀ Lùi / Tiến ▶ | `←` / `→` | Lùi / tiến một bước |
   | ▶ Tự chạy | `Space` | Tự động chạy, bấm lại để tạm dừng |
   | Thanh trượt dài | | Kéo để nhảy tới bước bất kỳ |
   | Tốc độ | | Tốc độ khi tự chạy |

   Có thể bấm vào một dòng trong *Nhật ký các bước* để nhảy tới bước đó, kéo thả đỉnh để sắp lại hình, nút *⟳ Bố cục* để đổi kiểu sắp xếp.
3. **Theo dõi** ở các khung:
   - *Đồ thị*: mỗi đỉnh ghi `số đỉnh` và `dist` hiện tại. Màu: xám = chưa thăm, xanh dương = tạm thời, cam = đang xét, xanh lá = đã chốt. Cạnh xanh lá = relax thành công, đỏ nét đứt = relax không cải thiện, xanh dương = cây `prev`, tím = đường đi ngắn nhất s → t (ở bước cuối).
   - *Pseudo-code*: dòng đang chạy được tô sáng.
   - *Hàng đợi ưu tiên*: các phần tử trong min-heap; phần tử gạch ngang là bản cũ, sẽ bị bỏ qua khi lấy ra (lazy deletion).
   - *Bảng dist / prev*: khoảng cách và đỉnh đứng trước của từng đỉnh.
4. **Output** hiện ở cột trái khi tới bước cuối, đúng định dạng như script console.

Giao diện chỉ mô phỏng đồ thị tối đa 30 đỉnh, 150 cạnh; đồ thị lớn hơn hãy dùng script.

## 3. Chạy bằng script console

Mọi lệnh chạy trong thư mục `1_SourceCode`:

| Mục đích | Lệnh |
|---|---|
| Chạy đồ thị mẫu 6 đỉnh có sẵn | `node scripts/demo-trace.js` (hoặc `npm run demo`) |
| Chạy với input từ file | `node scripts/demo-trace.js duong/dan/file.in` |
| Coi đồ thị là vô hướng | `node scripts/demo-trace.js duong/dan/file.in --vo-huong` |
| Lưu kết quả ra file | `node scripts/demo-trace.js > ket-qua.txt` |

## 4. Định dạng input

```
n m s [t]
u1 v1 w1
...
um vm wm
```
- `n`: số đỉnh (đánh số 1..n), `m`: số cạnh, `s`: đỉnh nguồn, `t`: đỉnh đích (không bắt buộc).
- Mỗi dòng sau là một cạnh có hướng `u → v` với trọng số `w`.
- Ràng buộc: 1 ≤ n ≤ 10^5; 0 ≤ m ≤ 2·10^5; 0 ≤ w ≤ 10^9 (Dijkstra không nhận cạnh âm).

Ví dụ (đây chính là đồ thị mẫu, lưu thành `vi-du.in`):
```
6 11 1 6
1 2 4
1 3 1
3 2 2
2 4 5
3 4 8
3 5 10
2 5 9
4 5 2
4 6 6
5 6 3
6 4 1
```

## 5. Đọc kết quả của script console

Script in ra 4 phần:

1. **Input**: đồ thị vừa đọc.
2. **Trace**: từng bước thuật toán, ví dụ:
   ```
   # 5 [relax-ok] dòng 10: dist[v] ← nd; prev[v] ← u; PQ.push(v, nd)
        → Relax 3→2: 4 → 3
        dist: 1:0*(-)  2:3(3)  3:1*(1)  4:∞(-)  5:∞(-)  6:∞(-)
        PQ  : (2,3) (2,4)
   ```
   - `[relax-ok]`: loại bước; `dòng 10`: dòng pseudo-code đang chạy.
   - `2:3(3)` nghĩa là đỉnh 2 có dist = 3, đỉnh đứng trước là 3. Dấu `*` là đỉnh đã chốt.
   - `PQ`: hàng đợi ưu tiên, dạng `(đỉnh, khoảng cách)`, xếp tăng dần.

   | Loại bước | Ý nghĩa |
   |---|---|
   | `init` | Khởi tạo dist, đưa đỉnh nguồn vào hàng đợi |
   | `extract` | Lấy đỉnh có dist nhỏ nhất ra và chốt |
   | `skip-stale` | Lấy ra phần tử cũ của đỉnh đã chốt → bỏ qua (lazy deletion) |
   | `relax-ok` | Tìm được đường ngắn hơn → cập nhật dist |
   | `relax-fail` | Không ngắn hơn, hoặc đỉnh đích đã chốt → giữ nguyên |
   | `done` | Hàng đợi rỗng, kết thúc |
3. **Thống kê**: số lần push/pop, số phần tử cũ bị bỏ qua, số lần relax.
4. **Output**: dòng i là khoảng cách ngắn nhất tới đỉnh i (`-1` nếu không tới được). Nếu input có `t` thì thêm một dòng đường đi `s -> ... -> t` (`-1` nếu không có đường).

Output của ví dụ trên:
```
0
3
1
8
10
13
1 -> 3 -> 2 -> 4 -> 5 -> 6
```

## 6. Khi input sai

Chương trình không crash mà báo lỗi kèm số dòng (giao diện web hiện khung đỏ dưới nút *Chạy*, script in `Lỗi: ...`), ví dụ:
```
Lỗi: Dòng 2: "x" không phải số nguyên (w)
Lỗi: Dòng 1: s = 4 nằm ngoài khoảng [1, 3]
Lỗi: khai báo m = 3 cạnh nhưng chỉ có 1 dòng cạnh
Lỗi: Đồ thị có cạnh trọng số âm: Dijkstra không đảm bảo đúng. Hãy dùng Bellman-Ford.
```

## 7. Cấu trúc thư mục

```
1_SourceCode/      mã nguồn (chi tiết kỹ thuật: 1_SourceCode/README.md)
  index.html, style.css   trang web
  src/core/        lõi thuật toán: graph, parser, min-heap, dijkstra-heap, samples
  src/ui/          giao diện: renderer (vẽ đồ thị), player (Tiến/Lùi/Tự chạy), panels, app
  scripts/         script Node: serve.js (server tĩnh), demo-trace.js
3_Testcase/        bộ testcase (chưa có)
4_Report/          báo cáo
CLAUDE.md          quy ước dự án cho Claude Code
DEVLOG.md          nhật ký phát triển
```
