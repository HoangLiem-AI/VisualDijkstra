# DEVLOG — Bài tập lớn CS112: Mô phỏng thuật toán Dijkstra

Nhật ký phát triển, dùng làm nguồn cho mục **"Tường thuật quá trình thiết kế và xây dựng"** trong report.

Nguyên tắc ghi:
- Prompt chép **nguyên văn**, kể cả lỗi chính tả.
- Mục **"Kiểm chứng của SV"** do sinh viên tự viết. AI không điền mục này.
- Mỗi chức năng xong: commit git và chụp ảnh giao diện (lưu ở `4_Report/hinh/`) để làm bằng chứng tiến trình.

## Công cụ sử dụng

| Công cụ | Model / phiên bản | Công đoạn |
|---|---|---|
| Claude trên claude.ai (Project "Phân tích và thiết kế thuật toán", có đính kèm slide và đề thi của môn) | Claude Opus 5.5 | Phân tích đề, lập kế hoạch, hỏi lý thuyết |
| Claude Code (CLI) | Claude Opus 5.5 | Viết code, sinh testcase, script kiểm thử |
| Cytoscape.js | 3.30.2 (CDN jsDelivr) | Vẽ đồ thị trên giao diện |
| Node.js | 24.20.0 LTS | Chạy testcase, benchmark |

## Mẫu một mục nhật ký

```
### #N — dd/mm/yyyy — <tiêu đề ngắn>
- Công cụ:
- Công đoạn: phân tích / thiết kế / code / kiểm thử / report
- Prompt (nguyên văn):
  > ...
- Kết quả AI trả về (tóm tắt):
- File tạo / sửa:
- Vấn đề gặp phải và cách giải quyết:
- Kiểm chứng của SV: (SV tự viết — kiểm tra bằng cách nào: chạy tay ví dụ, so testcase,
  đọc lại code...; giữ / sửa / bỏ phần nào và vì sao)
- Commit / ảnh chụp:
```

---

## Nhật ký

### #1 — 11/10/2026 — Phân tích yêu cầu đồ án
- **Công cụ:** Claude trên claude.ai (Opus 5.5), trong Project môn học.
- **Công đoạn:** phân tích đề.
- **Prompt (nguyên văn)**, kèm file đề bài tập lớn:
  > Phân tích toàn bộ yếu cầu đố án sản phẩm cho môn này giúp tôi, dự tính của tôi làm mô phong thuật toán dijkstra
- **Kết quả AI trả về (tóm tắt):**
  - Bóc tách 4 sản phẩm cần nộp và từng mục của report. Chỉ ra mục "tường thuật" là quan trọng nhất, và yêu cầu "mối liên hệ thống nhất" (cùng một đồ thị cho report, video, testcase).
  - Nhận xét Dijkstra hợp lệ nhưng phổ biến. Gợi ý giải cùng bài toán bằng nhiều chiến lược để so sánh: vét cạn, Dijkstra (tham lam), A* (heuristic), Bellman-Ford (quy hoạch động).
  - Đề xuất 3 mức phạm vi A/B/C, khuyến nghị mức B.
  - Kiến trúc: lõi thuật toán sinh danh sách bước (trace), giao diện chỉ phát lại.
  - Bộ testcase 5 nhóm (nhỏ, biên, đặc biệt, lớn, không hợp lệ); dùng vét cạn và Bellman-Ford làm đáp án chuẩn.
  - Gợi ý tạo DEVLOG.md ngay từ đầu.
- **Vấn đề / ghi chú:** chưa chốt hạn nộp và công nghệ.
- **Kiểm chứng của SV:** _(...)_

### #2 — 13/10/2026 — Chốt hạn nộp; hỏi thêm về quy hoạch động và hành trình đường thư
- **Công cụ:** Claude trên claude.ai (Opus 5.5).
- **Công đoạn:** lập kế hoạch, hỏi lý thuyết.
- **Prompt (nguyên văn):**
  > deadline là ngày 18/10
  > quy hoạch động tìm đường đi được sao? áp dụng được tìm đường đi trong hành trình đường thư ma trận điểm là các bưu cục (điêu kiện là đủ thứ qui định ràng buộc thời gian đi thời gian đến cho từng đường nối) tìm hành trình tới tối ưu thời gian nhất? cái này tôi chỉ hỏi thêm chứ vẫn tập trung làm đồ án là tìm đường đi đơn gian, sau dể dàng phát triển visual cho hành trình thư ở công ty
- **Kết quả AI trả về (tóm tắt):**
  - Quy hoạch động tìm được đường đi ngắn nhất nhờ cấu trúc con tối ưu.
    - Bellman-Ford: d_k(v) = min( d_{k−1}(v), min_{(u,v)∈E} [ d_{k−1}(u) + w(u,v) ] ), O(V·E).
    - Floyd-Warshall: D_k[i][j] = min( D_{k−1}[i][j], D_{k−1}[i][k] + D_{k−1}[k][j] ), O(V³).
    - Nhận xét: Dijkstra cũng là quy hoạch động, với thứ tự giải bài toán con được chọn theo tham lam.
  - Hành trình đường thư có lịch giờ đi/giờ đến: trọng số cạnh phụ thuộc thời điểm đến. Ba cách giải:
    - Dijkstra phụ thuộc thời gian (vẫn đúng nhờ tính chất FIFO);
    - đồ thị mở rộng theo thời gian + quy hoạch động;
    - Connection Scan.
  - Gợi ý thiết kế: relax qua hàm `relax(edge, t)` để sau này mở rộng. Lịch làm 5 ngày; thu hẹp phạm vi còn Dijkstra (heap + mảng) và Bellman-Ford.
- **Quyết định của SV:** giữ đồ án ở bài toán đường đi ngắn nhất đơn giản; hướng hành trình đường thư để phát triển sau.
- **Kiểm chứng của SV:** _(...)_

### #3 — 14/10/2026 — Tạo DEVLOG.md và CLAUDE.md
- **Công cụ:** Claude trên claude.ai (Opus 5.5).
- **Công đoạn:** thiết lập dự án.
- **Prompt (nguyên văn):**
  > Giờ viết ra 1 file DEVLOG.md rồi tôi sẽ dùng claude cli tạo ở thu mục đọc file local rồi làm phải không?
- **Kết quả AI trả về (tóm tắt):**
  - Xác nhận quy trình. Lưu ý Claude Code tự đọc `CLAUDE.md` khi khởi động, còn `DEVLOG.md` thì không, nên tạo thêm `CLAUDE.md`.
  - Tạo `DEVLOG.md` (file này) và `CLAUDE.md` gồm: phạm vi, công nghệ đề xuất, cấu trúc thư mục, định dạng input/output, cấu trúc một bước trace, quy tắc tự ghi DEVLOG sau mỗi yêu cầu.
- **Kiểm chứng của SV:** _(đọc lại CLAUDE.md; sửa công nghệ, ràng buộc, định dạng input nếu khác ý)_

### #4 — 14/10/2026 — Khung thư mục, parser, min-heap, Dijkstra (heap) sinh trace
- **Công cụ:** Claude Code (CLI), model Claude Opus 5.5.
- **Công đoạn:** code.
- **Prompt (nguyên văn):**
  > Đọc CLAUDE.md và DEVLOG.md. Tạo khung thư mục theo CLAUDE.md, viết parser input, min-heap và Dijkstra (heap) sinh trace đúng cấu trúc đã quy định. Thêm một script Node chạy thử trên một đồ thị 6 đỉnh và in trace ra console. Chưa làm giao diện.
- **Kết quả AI trả về (tóm tắt):**
  - Tạo khung thư mục theo CLAUDE.md (`1_SourceCode/src/core`, `src/ui`, `scripts`, `3_Testcase/{nho,bien,dac-biet,lon,khong-hop-le}`, `4_Report/hinh`). Chưa tạo `2_VideoDemo/` (để khi quay video).
  - `graph.js`: danh sách kề, tùy chọn vô hướng (cạnh ngược giữ cùng `id`), `hasNegativeEdge`, `buildPath`, lớp lỗi `GraphError`.
  - `parser.js`: đọc `n m s [t]` + m cạnh; báo lỗi kèm số dòng (không phải số nguyên, ngoài phạm vi, thiếu/thừa dòng cạnh). Parser cho phép w âm (|w| ≤ 10^9); việc cấm cạnh âm do Dijkstra tự kiểm tra. `formatOutput` in `-1` cho đỉnh không tới được; dòng đường đi in `-1` nếu không có đường tới t.
  - `min-heap.js`: heap nhị phân, khóa bằng nhau thì đỉnh nhỏ ra trước để trace tái tạo được; `toSortedArray()` trả bản sao cho trace.
  - `dijkstra-heap.js`: pseudo-code 11 dòng (`PSEUDO_CODE`), lazy deletion sinh bước `skip-stale`, relax qua `relax(edge, t)`; mỗi bước trace có `{ type, line, current, edge, dist, prev, finalized, pq, message }` với dist/prev/finalized/pq là bản sao. Tùy chọn `recordTrace: false` cho đồ thị lớn; `allowNegative: true` để dành cho chế độ minh họa cạnh âm. Trả thêm `stats` (số lần push/pop/skip-stale/relax) để dùng khi benchmark.
  - `scripts/demo-trace.js`: chạy trên đồ thị mẫu 6 đỉnh (hoặc file `.in`, cờ `--vo-huong`), in từng bước, thống kê và output.
  - Đồ thị mẫu (có hướng, s = 1, t = 6) được chọn để có đủ các loại bước: relax-ok, relax-fail (không cải thiện, và v đã chốt), skip-stale. Kết quả: `0 3 1 8 10 13`, đường đi `1 -> 3 -> 2 -> 4 -> 5 -> 6`, 23 bước trace. Có thể dùng làm ví dụ thống nhất cho report/video/testcase.
- **File tạo / sửa:** `1_SourceCode/{package.json, README.md}`, `1_SourceCode/src/core/{graph.js, parser.js, min-heap.js, dijkstra-heap.js}`, `1_SourceCode/scripts/demo-trace.js`, `.gitignore`, các `.gitkeep` trong thư mục rỗng.
- **Vấn đề gặp phải và cách giải quyết:**
  - Máy chưa cài Node.js → hỏi SV, cài Node.js LTS 24.20.0 bằng `winget install OpenJS.NodeJS.LTS`.
  - Lần chạy đầu, đồ thị mẫu (10 cạnh) không sinh bước "bỏ qua vì v đã chốt" như comment ghi → thêm cạnh `6 4 1` (không đổi khoảng cách).
  - Quyết định thiết kế: bước "lấy ra bản cũ" kiểm tra bằng `u đã chốt` thay vì `d > dist[u]`, và không relax tới đỉnh đã chốt. Với trọng số không âm hai cách tương đương; nhưng cách này giữ đúng hành vi Dijkstra kinh điển, nên ở chế độ minh họa cạnh âm Dijkstra sẽ cho kết quả sai như mong muốn (nếu cho phép xử lý lại đỉnh, thuật toán trở thành label-correcting và có thể ra kết quả đúng, làm hỏng phần minh họa).
  - Đã chạy thử thêm: cạnh âm (báo lỗi, exit 1), w không phải số, s ngoài phạm vi, thiếu/thừa dòng cạnh, đỉnh không tới được (in -1), đồ thị vô hướng.
- **Kiểm chứng của SV:** _(...)_
- **Commit / ảnh chụp:** "Khung dự án, parser, min-heap, Dijkstra heap sinh trace"

### #5 — 14/10/2026 — README hướng dẫn cách chạy
- **Công cụ:** Claude Code (CLI), model Claude Opus 5.5.
- **Công đoạn:** tài liệu.
- **Prompt (nguyên văn):**
  > tạo giúp tôi 1 file readme hướng dẫn cách chạy luôn đi
- **Kết quả AI trả về (tóm tắt):**
  - Tạo `README.md` ở thư mục gốc gồm: cài Node.js, các lệnh chạy (đồ thị mẫu, đọc file, `--vo-huong`, `npm run demo`), định dạng input kèm ví dụ, cách đọc trace (bảng ý nghĩa các loại bước), output mẫu, các thông báo lỗi khi input sai, cấu trúc thư mục.
  - Giữ `1_SourceCode/README.md` làm tài liệu kỹ thuật (cấu trúc một bước trace).
- **File tạo / sửa:** `README.md` (mới), `DEVLOG.md`.
- **Vấn đề gặp phải và cách giải quyết:** đã chạy lại `npm run demo` và chạy ví dụ chép từ README ra file `.in`; cả hai cho output đúng như README ghi.
- **Kiểm chứng của SV:** _(...)_
- **Commit / ảnh chụp:** "Thêm README hướng dẫn cách chạy"

### #6 — 14/10/2026 — Gắn remote GitHub
- **Công cụ:** Claude Code (CLI), model Claude Opus 5.5.
- **Công đoạn:** thiết lập dự án.
- **Prompt (nguyên văn):**
  > git remote add origin https://github.com/HoangLiem-AI/VisualDijkstra.git
- **Kết quả AI trả về (tóm tắt):** chạy lệnh trên; `git ls-remote origin` kết nối được, repo trên GitHub còn rỗng. Chưa push.
- **File tạo / sửa:** `DEVLOG.md`.
- **Kiểm chứng của SV:** _(...)_
- **Commit / ảnh chụp:** "Ghi DEVLOG: gắn remote GitHub"

### #7 — 15/10/2026 — Hỏi cách chạy (chưa có web)
- **Công cụ:** Claude Code (CLI), model Claude Opus 5.5.
- **Công đoạn:** hỏi đáp.
- **Prompt (nguyên văn):**
  > ủa hiện tại tôi phải chạy làm sao? sẽ dựng 1 trang web chứ nhỉ
- **Kết quả AI trả về (tóm tắt):** giải thích hiện mới có lõi + script console (do yêu cầu #4 ghi "Chưa làm giao diện"); mô tả trang web dự kiến theo CLAUDE.md; lưu ý phải mở qua server vì trình duyệt chặn ES modules khi mở `file://`. Không sửa file.
- **Kiểm chứng của SV:** _(...)_

### #8 — 15/10/2026 — Giao diện web mô phỏng từng bước
- **Công cụ:** Claude Code (CLI), model Claude Opus 5.5; Claude in Chrome để kiểm tra trang.
- **Công đoạn:** code.
- **Prompt (nguyên văn):**
  > có làm luôn đi, cập nhật trên readme luôn
- **Kết quả AI trả về (tóm tắt):**
  - Trang web 3 cột: Input / Output / Nhật ký các bước — Đồ thị + điều khiển + chú thích màu — Pseudo-code / Hàng đợi ưu tiên / Bảng dist-prev.
  - `renderer.js`: vẽ bằng Cytoscape.js 3.30.2 (CDN jsDelivr). Đỉnh ghi số đỉnh và dist; màu theo trạng thái (chưa thăm / tạm thời / đang xét / đã chốt); cạnh đang relax xanh (thành công) hoặc đỏ nét đứt (không cải thiện); tô cây `prev`; bước cuối tô đường đi s → t. 3 kiểu bố cục (cây theo tầng, vòng tròn, lực đẩy), kéo thả đỉnh được.
  - `player.js`: Tiến / Lùi / Đầu / Cuối / Tự chạy / tốc độ, không đụng DOM. Thanh trượt nhảy tới bước bất kỳ; phím tắt ← → Space Home End.
  - `panels.js`: pseudo-code tô dòng đang chạy (màu theo loại bước); hàng đợi gạch ngang phần tử cũ để minh họa lazy deletion; bảng dist/prev tô dòng đang xét; nhật ký chỉ hiện các bước đã chạy, bấm vào để nhảy tới bước đó.
  - `app.js`: đọc input → gọi `dijkstraHeap` lấy trace → phát lại. Giao diện không tự tính lại thuật toán. Giới hạn ≤ 30 đỉnh, ≤ 150 cạnh. Lỗi input / cạnh âm hiện khung đỏ, không crash.
  - `src/core/samples.js`: 4 ví dụ (6 đỉnh thống nhất, vô hướng 5 đỉnh, có đỉnh không tới được, có cạnh âm). `demo-trace.js` lấy đồ thị mẫu từ đây, để web và script dùng chung đúng một đồ thị.
  - `scripts/serve.js`: server tĩnh không cần cài gói (`npm start` → http://localhost:8080), chặn đọc file ngoài `1_SourceCode`.
  - README gốc: thêm mục "Chạy giao diện web" (cách mở, cảnh báo không double-click `index.html`, cách khác bằng Live Server / Python, bảng nút và phím tắt, ý nghĩa màu); đánh lại số mục. README trong `1_SourceCode` cập nhật cấu trúc và lệnh chạy.
- **File tạo / sửa:** `1_SourceCode/{index.html, style.css, package.json, README.md}`, `1_SourceCode/src/ui/{app.js, renderer.js, player.js, panels.js}`, `1_SourceCode/src/core/samples.js`, `1_SourceCode/scripts/{serve.js, demo-trace.js}`, `README.md`, `DEVLOG.md`.
- **Vấn đề gặp phải và cách giải quyết:**
  - Pseudo-code dùng khoảng trắng để căn chú thích `▷` nên trên web bị xuống dòng khó đọc → khi hiển thị tách phần chú thích ra, bỏ khoảng trắng căn lề, tô màu nhạt.
  - Kiểm tra trên Chrome: ví dụ 6 đỉnh ra 23 bước, output `0 3 1 8 10 13` và đường đi `1 -> 3 -> 2 -> 4 -> 5 -> 6`, khớp script console. Ví dụ vô hướng, không tới được (in -1), cạnh âm (báo lỗi) đều đúng; console trình duyệt không có lỗi.
  - Chưa xử lý: ở bước `skip-stale`, đỉnh bị bỏ qua vẫn tô màu cam "đang xét"; thông báo bên dưới đã giải thích nên tạm giữ.
- **Kiểm chứng của SV:** _(...)_
- **Commit / ảnh chụp:** "Giao diện web mô phỏng từng bước Dijkstra (heap)"

---

## Nhật ký lỗi

| # | Ngày | Mô tả lỗi | Phát hiện bằng | Nguyên nhân | Cách sửa | Commit |
|---|---|---|---|---|---|---|
| 1 | 14/10 | Đồ thị mẫu 6 đỉnh không sinh bước relax-fail "v đã chốt" như comment khẳng định | Chạy `demo-trace.js`, đọc trace | Chọn cạnh chưa đủ | Thêm cạnh `6 4 1` | (commit #4) |

## Các quyết định thiết kế

Dòng ghi "(đề xuất)" là gợi ý của AI; SV xác nhận hoặc sửa lại.

| Ngày | Quyết định | Phương án đã cân nhắc | Lý do |
|---|---|---|---|
| 13/10 | Giữ bài toán đường đi ngắn nhất đơn giản; hành trình đường thư để phát triển sau | Làm luôn bản theo lịch chuyến | Hạn nộp 18/10 |
| 13/10 | (đề xuất) Phạm vi: Dijkstra heap + Dijkstra mảng + Bellman-Ford | Chỉ Dijkstra; thêm A* và bản đồ thật | Cân bằng điểm sáng tạo và thời gian |
| 13/10 | (đề xuất) Relax qua hàm `relax(edge, t)` | Cộng trực tiếp `t + w` | Dễ mở rộng sang lịch chuyến |
| 14/10 | (đề xuất) Web tĩnh + Cytoscape.js; script bằng Node | Python (Streamlit/PyQt); .NET (Blazor/WPF) | Vẽ đồ thị tốt, chạy trên trình duyệt, deploy dễ |
| 14/10 | (đề xuất) Lazy deletion kiểm tra "u đã chốt"; không relax tới đỉnh đã chốt | Kiểm tra `d > dist[u]` và cho xử lý lại đỉnh | Giữ đúng Dijkstra kinh điển để minh họa sai với cạnh âm |
| 14/10 | (đề xuất) Parser cho phép w âm; Dijkstra tự báo lỗi cạnh âm | Parser cấm cạnh âm | Dùng chung parser cho Bellman-Ford |
| 15/10 | (đề xuất) Mở web qua server tĩnh tự viết `scripts/serve.js` | `npx serve` (phải tải gói); mở trực tiếp file:// (bị chặn ES modules) | Không cần cài thêm gì ngoài Node |
| 15/10 | (đề xuất) Đồ thị ví dụ để ở `src/core/samples.js` | Mỗi nơi tự chép đồ thị | Web, script, report, video dùng đúng một đồ thị |
