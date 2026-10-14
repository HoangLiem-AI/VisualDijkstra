# CLAUDE.md — Bài tập lớn CS112: Mô phỏng thuật toán Dijkstra

> Claude Code tự đọc file này khi khởi động. File ghi bối cảnh, phạm vi và quy ước của dự án.
> Các mục ghi "(đề xuất)" chưa chốt; sinh viên sửa lại nếu khác ý.

## Bối cảnh
- Môn CS112 – Phân tích và thiết kế thuật toán. **Hạn nộp: 18/10/2026.**
- Yêu cầu: demo có giao diện cho phép nhập input → theo dõi **từng bước** thuật toán → xem output.
- Sản phẩm nộp: source code, video demo, bộ testcase, report (Word/LaTeX + PDF).
- Tiêu chí chấm: đủ yêu cầu, mức đầu tư, sáng tạo. Phần quan trọng nhất của report là **tường thuật quá trình xây dựng, kể cả cách dùng AI** → mọi thay đổi phải được ghi vào `DEVLOG.md`.
- Yêu cầu "thống nhất": ví dụ minh họa trong report, ví dụ chạy trong video và một testcase phải là **cùng một đồ thị**.

## Phạm vi
- Bắt buộc: Dijkstra dùng min-heap, mô phỏng từng bước.
- Mở rộng:
  - Dijkstra dùng mảng, O(V²), để so sánh cấu trúc dữ liệu (đồ thị thưa và dày).
  - Bellman-Ford (quy hoạch động) để so sánh và xử lý cạnh âm.
  - Chế độ minh họa: đồ thị có cạnh âm làm Dijkstra cho kết quả sai, Bellman-Ford cho kết quả đúng.
- Không làm (để mục Hướng phát triển): A*, bản đồ thật, hành trình đường thư theo lịch chuyến.
- Không tự ý mở rộng ngoài phạm vi này; hỏi trước.

## Công nghệ (đề xuất)
- Web tĩnh, không cần build: HTML + CSS + JavaScript (ES modules) + Cytoscape.js qua CDN. Deploy được lên GitHub Pages.
- Script testcase và benchmark: Node.js, **dùng chung lõi thuật toán** với giao diện.
- Giao diện và comment bằng tiếng Việt.

## Cấu trúc thư mục
```
1_SourceCode/
  index.html, style.css, README.md
  src/core/    graph.js, parser.js, min-heap.js,
               dijkstra-heap.js, dijkstra-array.js, bellman-ford.js
  src/ui/      renderer.js (vẽ đồ thị), player.js (Tiến/Lùi/Tự chạy), panels.js (bảng, hàng đợi, log)
  scripts/     gen-tests.js, brute-force.js, run-tests.js, benchmark.js
2_VideoDemo/   (tạo khi quay video)
3_Testcase/    nho/, bien/, dac-biet/, lon/, khong-hop-le/   (mỗi test: .in và .out)
4_Report/
CLAUDE.md
DEVLOG.md
```

## Quy tắc thiết kế (bắt buộc)
1. **Lõi tách khỏi giao diện.** `src/core/` không đụng tới DOM và phải chạy được bằng Node.
2. **Thuật toán trả về `{ result, trace }`.** `trace` là mảng các bước. Giao diện chỉ phát lại trace; không viết lại thuật toán trong UI.
3. Mỗi bước trong trace có tối thiểu:
   `{ type, line, current, edge, dist, prev, finalized, pq, message }`
   - `type`: `init | extract | skip-stale | relax-ok | relax-fail | done` (Bellman-Ford thêm `round`, `negative-cycle`)
   - `line`: số dòng pseudo-code đang chạy, để tô sáng
   - `dist`, `prev`, `finalized`, `pq`: **bản sao** tại thời điểm đó, không phải tham chiếu
   - `message`: câu tiếng Việt, ví dụ `Relax B→D: 7 → 5`
4. **Phép relax đi qua hàm `relax(edge, t)`**, mặc định trả về `t + edge.w`. Không cộng trực tiếp trong vòng lặp. Lý do: sau này thay bằng hàm "giờ đến sớm nhất theo lịch chuyến" cho bài toán hành trình đường thư.
5. Heap dùng lazy deletion. Khi lấy ra một phần tử đã cũ phải sinh bước `skip-stale` để minh họa.
6. Đỉnh không tới được: `dist = Infinity`, output in `-1`.
7. Số nguyên: dùng `Number` của JS. Tổng lớn nhất khoảng 10^5 · 10^9 = 10^14 < 2^53 nên vẫn chính xác.
8. Giao diện chỉ mô phỏng đồ thị nhỏ (khoảng ≤ 30 đỉnh). Đồ thị lớn chỉ chạy qua script, không vẽ.

## Định dạng input / output (kiểu Wecode, đề xuất)
Input:
```
n m s [t]
u1 v1 w1
...
um vm wm
```
- Đỉnh đánh số 1..n. Mặc định đồ thị có hướng; giao diện có tuỳ chọn vô hướng. `t` không bắt buộc.
- Ràng buộc: 1 ≤ n ≤ 10^5; 0 ≤ m ≤ 2·10^5; 0 ≤ w ≤ 10^9 với Dijkstra; Bellman-Ford cho phép w < 0.

Output:
- Dòng i (1..n): `dist[i]`, hoặc `-1` nếu không tới được.
- Nếu có `t`: thêm một dòng đường đi `s -> ... -> t`.
- Cạnh âm khi chạy Dijkstra, hoặc chu trình âm khi chạy Bellman-Ford: báo lỗi rõ ràng, không crash.

## Kiểm thử
- Đáp án chuẩn: vét cạn với n ≤ 8; Bellman-Ford hoặc Floyd-Warshall với đồ thị lớn hơn; đối chiếu chéo cả 3 cài đặt.
- Testcase sinh bằng script **có seed** để tái tạo được.
- `run-tests.js` in bảng đạt/không đạt và thời gian chạy từng test.

## Quy tắc làm việc với Claude Code
- Sau mỗi yêu cầu hoàn thành, **thêm một mục mới vào cuối `DEVLOG.md`** theo mẫu trong file đó:
  - chép **nguyên văn** prompt của người dùng;
  - tóm tắt việc đã làm và các file đã tạo hoặc sửa;
  - ghi vấn đề gặp phải và cách xử lý;
  - **để trống mục "Kiểm chứng của SV"**, vì mục này do sinh viên tự viết.
- Lỗi phát hiện được thì ghi thêm vào bảng "Nhật ký lỗi" trong DEVLOG.
- Commit git sau mỗi chức năng, message tiếng Việt ngắn gọn.
- Code dễ đọc, có comment tiếng Việt ở các bước thuật toán (để chụp vào report).
