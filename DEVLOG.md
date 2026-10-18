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

### #9 — 15/10/2026 — Lỗi npm bị PowerShell chặn khi chạy trong VS Code
- **Công cụ:** Claude Code (CLI), model Claude Opus 5.5.
- **Công đoạn:** kiểm thử / tài liệu.
- **Prompt (nguyên văn):**
  > chạy trên visual code bị:
  >
  > npm : File C:\Program Files
odejs
pm.ps1 cannot be loaded because running scripts is disabled on this system. For more information, see about_Execution_Policies at https:/go.microsoft.com/fwlink/?LinkID=135170.
  > At line:1 char:1
  > + npm install
  > + ~~~
  >     + CategoryInfo          : SecurityError: (:) [], PSSecurityException
  >     + FullyQualifiedErrorId : UnauthorizedAccess
- **Kết quả AI trả về (tóm tắt):**
  - Nguyên nhân: Execution Policy mặc định của PowerShell trên Windows chặn file `npm.ps1`; không phải lỗi code. Dự án không có thư viện ngoài nên không cần `npm install`.
  - Cách xử lý: chạy `node scripts/serve.js` (không qua npm), hoặc `npm.cmd start`, hoặc đổi terminal VS Code sang Command Prompt, hoặc SV tự chạy `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. AI không tự đổi Execution Policy vì đó là thiết lập bảo mật của máy.
  - Thêm ghi chú xử lý lỗi này vào README mục 2.
- **File tạo / sửa:** `README.md`, `DEVLOG.md`.
- **Kiểm chứng của SV:** _(...)_
- **Commit / ảnh chụp:** "README: hướng dẫn xử lý lỗi PowerShell chặn npm"

### #10 — 15/10/2026 — Hỏi các phần còn lại
- **Công cụ:** Claude Code (CLI), model Claude Opus 5.5.
- **Công đoạn:** lập kế hoạch.
- **Prompt (nguyên văn):**
  > chúng ta còn báo cáo kịch bản demo và demo phải không?
- **Kết quả AI trả về (tóm tắt):** liệt kê phần còn thiếu theo CLAUDE.md: mở rộng (Dijkstra mảng, Bellman-Ford, minh họa cạnh âm), bộ testcase và script kiểm thử/benchmark, report, kịch bản demo + video. Đề xuất lịch: 15/10 mở rộng → 16/10 testcase + benchmark → 17/10 report, kịch bản, quay video → 18/10 dự phòng, nộp. Không sửa file.
- **Kiểm chứng của SV:** _(...)_

### #11 — 15/10/2026 — Dijkstra mảng, Bellman-Ford, chế độ minh họa cạnh âm
- **Công cụ:** Claude Code (CLI), model Claude Opus 5.5; Chrome headless (điều khiển qua DevTools Protocol) để kiểm tra giao diện.
- **Công đoạn:** code, kiểm thử.
- **Prompt (nguyên văn):**
  > có làm bước 1 luôn đi
- **Kết quả AI trả về (tóm tắt):**
  - `dijkstra-array.js`: Dijkstra dùng mảng, O(V² + E). Mỗi lần duyệt cả mảng dist tìm đỉnh nhỏ nhất (bằng nhau lấy đỉnh số nhỏ, cùng thứ tự với bản heap); dừng sớm khi các đỉnh còn lại đều ∞. Trường `pq` của trace là các đỉnh ứng viên. Thống kê thêm số phép so sánh để benchmark.
  - `bellman-ford.js`: tối đa n − 1 vòng, mỗi vòng duyệt mọi cạnh theo thứ tự input (vô hướng: 2 cung), dừng sớm khi một vòng không đổi gì; thêm một lượt kiểm tra chu trình âm, nếu có thì lần theo `prev` để lấy đúng chu trình. Thêm loại bước `round`, `negative-cycle` (kèm `cycle`), trường `round`/`maxRound`. Comment có công thức truy hồi quy hoạch động.
  - `algorithms.js`: danh mục 3 thuật toán (tên, hàm, pseudo-code, độ phức tạp, kiểu khung hàng đợi). Chuyển `defaultRelax`, `fmtDist`, `pathMessage` vào `graph.js` để dùng chung; cả 3 thuật toán đều relax qua `relax(edge, t)`.
  - `parser.formatOutput`: có chu trình âm thì output một dòng `Phát hiện chu trình âm`.
  - Giao diện: ô chọn thuật toán; pseudo-code + độ phức tạp đổi theo thuật toán; khung bên phải đổi giữa Hàng đợi ưu tiên / Đỉnh ứng viên / Vòng lặp i/(n−1); tô đỏ chu trình âm. Tùy chọn **Minh họa cạnh âm**: cho Dijkstra chạy dù có cạnh âm, bước cuối hiện bảng **So sánh với Bellman-Ford** tô đỏ đỉnh sai. Không bật thì báo lỗi kèm gợi ý.
  - Thêm 2 ví dụ: "Cạnh âm: Dijkstra sai, Bellman-Ford đúng" (4 đỉnh; Dijkstra ra `0 2 5 5`, đúng là `0 1 5 4`) và "Chu trình âm" (2 → 3 → 4 → 2, tổng −1). Mỗi ví dụ có thể tự chọn thuật toán, bật minh họa, chọn bố cục.
  - `demo-trace.js`: thêm `--thuat-toan=heap|mang|bf` và `--minh-hoa-am`. Cập nhật 2 README.
- **File tạo / sửa:** `1_SourceCode/src/core/{dijkstra-array.js, bellman-ford.js, algorithms.js}` (mới), `src/core/{graph.js, dijkstra-heap.js, parser.js, samples.js}`, `src/ui/{app.js, panels.js, renderer.js}`, `index.html`, `style.css`, `scripts/demo-trace.js`, `README.md`, `1_SourceCode/README.md`, `DEVLOG.md`.
- **Vấn đề gặp phải và cách giải quyết:**
  - Kiểm tra chéo 3000 đồ thị ngẫu nhiên (n ≤ 9) với Floyd-Warshall: 3 thuật toán cho cùng dist và đường đi đúng độ dài; Bellman-Ford đúng với 387 ca có cạnh âm không chu trình âm, phát hiện đúng 566 ca chu trình âm (chu trình trả về có tổng âm thật). 0 ca sai. Script kiểm tra tạm nằm ngoài repo; ngày 16/10 sẽ làm thành `run-tests.js` chính thức.
  - Lần kiểm tra đầu chỉ có 1 ca "cạnh âm không chu trình âm" trên 3000 ca. Nguyên nhân: bộ sinh số ngẫu nhiên LCG lấy `seed % k` dùng các bit thấp có chu kỳ rất ngắn, nên các lựa chọn ngẫu nhiên liên tiếp bị phụ thuộc nhau. Đổi sang mulberry32 thì phân bố bình thường. **Ghi nhớ cho `gen-tests.js`: dùng mulberry32, không dùng LCG `% k`.**
  - Ví dụ chu trình âm vẽ bằng bố cục cây xếp các đỉnh thẳng hàng, các cạnh của chu trình chồng lên nhau → cho ví dụ chọn bố cục vòng tròn.
  - Ô chọn thuật toán bị cắt chữ khi ghi kèm độ phức tạp → chỉ ghi tên, độ phức tạp chuyển lên tiêu đề khung pseudo-code.
  - Chú thích màu "Tạm thời (trong hàng đợi)" sai với Dijkstra mảng / Bellman-Ford → đổi thành "Tạm thời (dist < ∞, chưa chốt)".
  - Thêm favicon rỗng để console trình duyệt không báo lỗi 404.
- **Kiểm chứng của SV:** _(...)_
- **Commit / ảnh chụp:** "Thêm Dijkstra mảng, Bellman-Ford và chế độ minh họa cạnh âm"

### #12 — 17/10/2026 — Bộ testcase, script kiểm thử và benchmark
- **Công cụ:** Claude Code (CLI), model Claude Opus 5.5.
- **Công đoạn:** kiểm thử.
- **Prompt (nguyên văn):**
  > làm tiếp tục bước tiếp theo đi
- **Kết quả AI trả về (tóm tắt):**
  - `scripts/rng.js`: mulberry32 có seed (rút kinh nghiệm lỗi #3). `scripts/generators.js`: sinh đồ thị ngẫu nhiên (có tùy chọn cây khung từ s), dày, cạnh âm không chu trình, lưới.
  - `scripts/brute-force.js`: vét cạn mọi đường đi đơn bằng DFS (n ≤ 8) và Floyd-Warshall (phát hiện chu trình âm tới được từ s). Chạy riêng được: `node scripts/brute-force.js file.in`.
  - `scripts/gen-tests.js`: 44 test, 5 nhóm (nho 11, bien 9, dac-biet 9, lon 4, khong-hop-le 11), mỗi test một seed. Đáp án: vét cạn (n ≤ 8) / Floyd-Warshall (n ≤ 300) / Bellman-Ford (lớn); khi sinh luôn đối chiếu chéo các nguồn, lệch là dừng. Tự ghi `3_Testcase/README.md` (bảng mô tả, n/m, nguồn đáp án, seed). `nho/01-vi-du-6-dinh` chính là ví dụ thống nhất trong report/video.
  - `src/core/solve.js`: chuỗi input → chuỗi output (như chương trình nộp chấm); lỗi trả về dòng `Lỗi: ...`. Thêm hằng `NEGATIVE_EDGE_MESSAGE`.
  - `scripts/run-tests.js`: chạy cả 3 thuật toán trên mọi test, in bảng đạt/không đạt + thời gian, ghi `4_Report/so-lieu/ket-qua-kiem-thu.md`. Chấm dist chính xác; đường đi chấp nhận mọi đường hợp lệ có độ dài bằng dist[t] (vì có thể nhiều đường ngắn nhất); test có cạnh âm thì Dijkstra phải báo lỗi; Dijkstra mảng bỏ qua khi n > 20000.
  - `scripts/benchmark.js`: đồ thị thưa (m = 4n, n tới 10^5) và dày (m ≈ n²/2, n tới 1000), trung vị 5 lần, kèm số phép toán; ghi `4_Report/so-lieu/benchmark.md` và `.csv`.
  - `package.json`: thêm `test`, `gen-tests`, `bench`. README: thêm mục "Kiểm thử và benchmark".
- **Kết quả:**
  - `run-tests.js`: **128 đạt, 0 không đạt, 4 bỏ qua** (Dijkstra mảng trên test n ≥ 48400).
  - Benchmark: đồ thị thưa n = 20000 — heap 31.8 ms, mảng 1513.7 ms, Bellman-Ford 163.6 ms; đồ thị dày n = 1000 (≈ 5·10^5 cạnh) — heap 97.3 ms, mảng 60.4 ms, Bellman-Ford 550.4 ms. Đúng lý thuyết: heap thắng ở đồ thị thưa, mảng O(V²) thắng ở đồ thị dày (từ n ≈ 400).
  - Test độ chính xác số lớn: chuỗi 10^5 đỉnh w = 10^9 cho dist cuối 99 999 000 000 000 đúng (< 2^53).
- **File tạo / sửa:** `1_SourceCode/scripts/{rng.js, generators.js, brute-force.js, gen-tests.js, run-tests.js, benchmark.js}` (mới), `1_SourceCode/src/core/solve.js` (mới), `src/core/{graph.js, dijkstra-heap.js, dijkstra-array.js}`, `1_SourceCode/package.json`, `3_Testcase/**` (88 file + README), `4_Report/so-lieu/{ket-qua-kiem-thu.md, benchmark.md, benchmark.csv}`, `README.md`, `1_SourceCode/README.md`, `DEVLOG.md`.
- **Vấn đề gặp phải và cách giải quyết:**
  - **Kiểm tra bộ test có bắt được lỗi không** (mutation test): cố ý xóa dòng so sánh với con phải trong `siftDown` của min-heap rồi chạy `run-tests.js` → 5 test không đạt, đều ở bản heap (`dac-biet/06-day-du`, `dac-biet/09-nhieu-phan-tu-cu`, 3 test `lon`). Đáng chú ý: **11 test nhỏ ngẫu nhiên không phát hiện được lỗi này** → cần cả nhóm đặc biệt và lớn. Đã khôi phục code, chạy lại 128/128 đạt.
  - Đường đi ngắn nhất không duy nhất (ví dụ test lưới mọi trọng số 1): so khớp chuỗi sẽ đánh trượt oan → viết bộ chấm kiểm tra tính hợp lệ và độ dài đường đi.
  - Đáp án cho đồ thị 10^5 đỉnh: vét cạn và Floyd-Warshall không chạy nổi → dùng Bellman-Ford có dừng sớm (độc lập với Dijkstra), chạy 0.3–6 giây; `run-tests.js` đối chiếu lại với Dijkstra heap.
  - Lịch bị trễ: theo kế hoạch #10 bước này làm ngày 16/10, thực tế làm ngày 17/10.
  - Thư mục `3_Testcase/lon` khoảng 18 MB (4 test lớn); vẫn dưới giới hạn 100 MB/file của GitHub.
  - Benchmark đồ thị thưa dùng m = 4n, tới 4·10^5 cạnh, vượt ràng buộc input m ≤ 2·10^5; chỉ để đo xu hướng, không phải testcase.
- **Kiểm chứng của SV:** _(...)_
- **Commit / ảnh chụp:** "Thêm bộ testcase, script kiểm thử và benchmark"

### #13 — 17/10/2026 — Kịch bản video demo
- **Công cụ:** Claude Code (CLI), model Claude Opus 5.5.
- **Công đoạn:** video demo.
- **Prompt (nguyên văn):**
  > soạn giúp tôi kịch bản demo đi, hướng dẫn step by step, để tôi vừa quay màn hình vừa nói
- **Kết quả AI trả về (tóm tắt):**
  - Tạo `2_VideoDemo/kich-ban-demo.md`: checklist chuẩn bị, 8 cảnh (~8–10 phút), mỗi cảnh ghi thao tác cần bấm và lời nói gợi ý; cảnh chính đi từng bước trên ví dụ 6 đỉnh (thống nhất với report và `3_Testcase/nho/01`), nhấn mạnh bước 6 (relax 3→2 cải thiện 4 → 3), bước 12 (bỏ qua phần tử cũ — lazy deletion), bước 21 (bỏ qua đỉnh đã chốt), bước 23 (đường đi 1→3→2→4→5→6 dài 13).
  - Các cảnh còn lại: sửa input (đổi `3 2 2` thành `3 2 5` → đường mới 1→3→5→6 dài 14) và input sai; Dijkstra mảng (19 bước) và Bellman-Ford (dừng sớm ở vòng 2); cạnh âm (Dijkstra sai ở đỉnh 2 và 4); chu trình âm; chạy `run-tests.js` và đọc benchmark; kết và hướng phát triển. Cuối file có checklist sau khi quay.
  - Số bước và nội dung trong kịch bản lấy từ trace thật do lõi sinh ra, không viết tay; biến thể `3 2 5` đã chạy thử để xác nhận output.
- **File tạo / sửa:** `2_VideoDemo/kich-ban-demo.md` (mới), `DEVLOG.md`.
- **Vấn đề gặp phải và cách giải quyết:** lệnh lấy trace bị treo do một lệnh `cat` thừa chờ dữ liệu vào → dừng tác vụ, ghi script ra file rồi chạy lại.
- **Kiểm chứng của SV:** _(...)_
- **Commit / ảnh chụp:** "Thêm kịch bản video demo"

### #14 — 18/10/2026 — Bản nháp report (Word + PDF)
- **Công cụ:** Claude Code (CLI), model Claude Opus 5.5; Chrome headless (chụp ảnh giao diện); Python (python-docx, matplotlib); Microsoft Word (cập nhật mục lục, xuất PDF).
- **Công đoạn:** report.
- **Prompt (nguyên văn):**
  > vậy làm report giúp tôi đi, cái nào tôi dể review và chỉnh sửa thì làm cái đó
- **Kết quả AI trả về (tóm tắt):**
  - Chọn **Word (.docx)** vì SV dễ đọc lại và sửa trực tiếp (không cần biết LaTeX), xuất PDF bằng Word.
  - `4_Report/BaoCao.docx` + `BaoCao.pdf` (34 trang): bìa, mục lục tự động, 9 chương — giới thiệu; cơ sở lý thuyết (chứng minh tính đúng Dijkstra, độ phức tạp, lazy deletion, Bellman-Ford, vì sao sai với cạnh âm); thiết kế (kiến trúc trace, quyết định thiết kế); cài đặt và giao diện; ví dụ thống nhất (bảng đủ 23 bước trace, ảnh các bước 6/12/21/23, so sánh 3 thuật toán, cạnh âm, chu trình âm); kiểm thử (mutation test); benchmark (bảng + biểu đồ); quá trình xây dựng và dùng AI (dòng thời gian prompt, nhật ký lỗi, phân công SV/AI); kết luận, hướng phát triển; tài liệu tham khảo.
  - Chỗ SV phải tự điền / tự viết được **tô vàng** `[...]`: họ tên, MSSV, lớp, giảng viên, tên khoa, link video, slide môn học, phần kiểm chứng của SV (8.4), phân công (8.5), nhận xét về việc dùng AI (8.6). AI không viết thay các phần này.
  - `4_Report/tools/`: `xuat-trace.mjs` (trace thật → `so-lieu/trace-vi-du.json`, bảng trace trong report lấy từ đây), `ve-bieu-do.py` (biểu đồ benchmark → `hinh/bd-thua.png`, `bd-day.png`), `tao-report.py` (dựng bản nháp; không ghi đè `BaoCao.docx` đã có trừ khi thêm `--ghi-de`, để không mất phần SV đã sửa).
  - `4_Report/hinh/`: 10 ảnh chụp giao diện (`h01`–`h10`) chụp tự động bằng Chrome headless, cắt vùng khi đưa vào report.
- **File tạo / sửa:** `4_Report/{BaoCao.docx, BaoCao.pdf}`, `4_Report/tools/{xuat-trace.mjs, ve-bieu-do.py, tao-report.py}`, `4_Report/hinh/*.png`, `4_Report/so-lieu/trace-vi-du.json`, `README.md`, `DEVLOG.md`.
- **Vấn đề gặp phải và cách giải quyết:**
  - Ảnh chụp lần đầu bị cắt mất bảng "So sánh với Bellman-Ford" ở cuối cột trái → tăng chiều cao khung chụp.
  - Tiêu đề chương hiện font Calibri dù đã đặt Times New Roman (kiểu Heading của Word dùng font theo theme) → xóa thuộc tính font theme. Độ rộng cột bảng bị Word bỏ qua → tắt autofit, ghi độ rộng vào lưới bảng.
  - Script xuất PDF chạy trong một tiến trình PowerShell riêng thì Word (chạy ẩn) bị treo, chạy trực tiếp thì không; không tìm ra nguyên nhân trong thời gian cho phép → bỏ script, hướng dẫn SV xuất PDF bằng tay trong Word (File → Save As → PDF). Phải tắt các tiến trình Word ẩn bị treo.
  - Các số liệu trong report (số bước, thống kê heap, kết quả test, benchmark) đều lấy từ file kết quả / trace thật; các phép tính so sánh (84 lần, 48 lần, 34 %) đã tính lại từ bảng benchmark.
  - Nhận định về tên khoa trên bìa chưa chắc chắn → để ô tô vàng cho SV kiểm tra.
- **Kiểm chứng của SV:** _(...)_
- **Commit / ảnh chụp:** "Thêm bản nháp report Word và PDF"

---

## Nhật ký lỗi

| # | Ngày | Mô tả lỗi | Phát hiện bằng | Nguyên nhân | Cách sửa | Commit |
|---|---|---|---|---|---|---|
| 1 | 14/10 | Đồ thị mẫu 6 đỉnh không sinh bước relax-fail "v đã chốt" như comment khẳng định | Chạy `demo-trace.js`, đọc trace | Chọn cạnh chưa đủ | Thêm cạnh `6 4 1` | (commit #4) |
| 2 | 15/10 | `npm start` / `npm install` báo "npm.ps1 cannot be loaded because running scripts is disabled" trong terminal VS Code | SV chạy thử trên máy | PowerShell Execution Policy chặn `npm.ps1` (môi trường, không phải lỗi code) | Dùng `node scripts/serve.js` hoặc `npm.cmd start`; ghi hướng dẫn vào README | (commit #9) |
| 3 | 15/10 | Kiểm tra ngẫu nhiên gần như không sinh ca "cạnh âm, không chu trình âm" (1/3000) | Đếm số ca theo loại trong script kiểm tra chéo | LCG `seed % k` dùng bit thấp chu kỳ ngắn, các lựa chọn liên tiếp phụ thuộc nhau | Đổi sang mulberry32 (387/3000) | (commit #11) |
| 4 | 15/10 | Ví dụ chu trình âm: các cạnh của chu trình chồng lên nhau, không nhìn thấy | Chụp màn hình Chrome headless | Bố cục cây xếp đỉnh thẳng hàng | Ví dụ tự chọn bố cục vòng tròn | (commit #11) |

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
| 15/10 | (đề xuất) Chu trình âm: output một dòng `Phát hiện chu trình âm` | In dist kèm cảnh báo; mã lỗi tiếng Anh | Rõ ràng, không đưa ra dist vô nghĩa |
| 15/10 | (đề xuất) Minh họa cạnh âm bằng tùy chọn bật/tắt + bảng so sánh với Bellman-Ford ở bước cuối | Luôn cho Dijkstra chạy với cạnh âm | Mặc định vẫn an toàn (báo lỗi); khi minh họa thì thấy rõ chỗ sai |
| 15/10 | (đề xuất) Bellman-Ford duyệt cạnh theo thứ tự input, dừng sớm khi một vòng không đổi | Duyệt theo danh sách kề; luôn chạy đủ n − 1 vòng | Trace khớp với file input, ngắn hơn khi demo |
| 17/10 | (đề xuất) Chấm đường đi bằng kiểm tra hợp lệ + độ dài, không so chuỗi | So khớp chuỗi với `.out` | Có thể có nhiều đường ngắn nhất bằng nhau |
| 17/10 | (đề xuất) Đáp án test lớn bằng Bellman-Ford có dừng sớm | Dùng Dijkstra làm đáp án | Nguồn đáp án độc lập với thuật toán đang kiểm tra |
| 17/10 | (đề xuất) Test có cạnh âm: Dijkstra đạt khi báo đúng lỗi cạnh âm | Bỏ qua Dijkstra trên các test này | Kiểm tra luôn yêu cầu "báo lỗi rõ ràng, không crash" |
| 18/10 | (đề xuất) Report bằng Word (.docx), xuất PDF bằng Word | LaTeX | SV dễ đọc lại và sửa trực tiếp |
