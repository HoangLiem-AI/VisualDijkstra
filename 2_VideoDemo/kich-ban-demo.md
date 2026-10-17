# Kịch bản video demo — Mô phỏng thuật toán Dijkstra

**Thời lượng mục tiêu:** khoảng 8–10 phút.
**Đồ thị chính:** "Ví dụ 6 đỉnh". Đây cũng là ví dụ trong report và testcase `3_Testcase/nho/01-vi-du-6-dinh` (yêu cầu "thống nhất").

Cách đọc kịch bản:
- **▶ Thao tác**: việc cần làm trên màn hình.
- **🎙 Lời nói**: câu gợi ý. Không cần đọc thuộc lòng; nói theo ý mình, miễn đủ ý.
- Số bước ghi theo bộ đếm **"Bước k / N"** dưới đồ thị. Phím `→` tiến một bước, `←` lùi một bước.

---

## 0. Chuẩn bị trước khi quay (không quay phần này)

- [ ] Mở terminal trong VS Code, chạy:
  ```
  cd 1_SourceCode
  node scripts/serve.js
  ```
- [ ] Mở Chrome vào `http://localhost:8080`. Đóng các tab khác, tắt thông báo Windows (Focus assist / Do not disturb).
- [ ] Zoom trình duyệt 100% (`Ctrl+0`). Nếu màn hình nhỏ, để 90% sao cho thấy đủ 3 cột.
- [ ] Kéo thanh **Tốc độ** về khoảng giữa (để khi tự chạy, người xem kịp nhìn).
- [ ] Mở sẵn tab thứ hai của terminal ở `1_SourceCode` (dùng cho cảnh 7). Phóng to chữ terminal (`Ctrl` + `+` trong VS Code).
- [ ] Mở sẵn file `4_Report/so-lieu/benchmark.md` trong VS Code (chế độ Preview: `Ctrl+Shift+V`).
- [ ] Phần mềm quay: OBS Studio, hoặc Xbox Game Bar (`Win+Alt+R`, chỉ quay được một cửa sổ), hoặc Clipchamp. Thử thu 10 giây và nghe lại mic trước.
- [ ] Bấm thử một lượt toàn bộ kịch bản để quen tay.

**Mẹo:**
- Quay **từng cảnh riêng** rồi ghép lại, đỡ phải quay lại từ đầu khi nói vấp.
- Khi giải thích, di chuột chỉ vào đúng chỗ đang nói (đỉnh, dòng pseudo-code, hàng đợi).
- Ở các bước quan trọng, **dừng 2–3 giây** rồi mới bấm `→`.

---

## Tổng quan các cảnh

| Cảnh | Nội dung | Thời lượng |
|---|---|---|
| 1 | Giới thiệu đề tài và giao diện | 1 phút |
| 2 | Dijkstra (min-heap) từng bước trên ví dụ 6 đỉnh | 3 phút |
| 3 | Tự nhập / sửa input, báo lỗi input | 1 phút |
| 4 | So sánh Dijkstra mảng và Bellman-Ford trên cùng đồ thị | 1,5 phút |
| 5 | Cạnh âm: Dijkstra sai, Bellman-Ford đúng | 1,5 phút |
| 6 | Chu trình âm | 0,5 phút |
| 7 | Bộ testcase và benchmark | 1,5 phút |
| 8 | Kết | 0,5 phút |

---

## Cảnh 1 — Giới thiệu (≈ 1 phút)

**▶ Thao tác:** Trang vừa mở, đang ở *Ví dụ 6 đỉnh*, thuật toán *Dijkstra (min-heap)*, Bước 1 / 23. Di chuột lần lượt qua 3 cột.

**🎙 Lời nói:**
> Xin chào, em là … , mã số sinh viên … . Đây là demo đồ án môn CS112: mô phỏng thuật toán Dijkstra tìm đường đi ngắn nhất từ một đỉnh nguồn.
>
> Giao diện có ba phần.
> - Cột trái là **input**: chọn thuật toán, nhập đồ thị, và **output** khi chạy xong.
> - Ở giữa là **đồ thị**. Mỗi đỉnh ghi số hiệu và khoảng cách hiện tại `dist`. Bên dưới là các nút điều khiển để đi từng bước.
> - Cột phải là **trạng thái bên trong thuật toán**: pseudo-code với dòng đang chạy được tô sáng, hàng đợi ưu tiên, và bảng dist / prev.
>
> Định dạng input giống bài trên Wecode: dòng đầu là `n m s t` (số đỉnh, số cạnh, đỉnh nguồn, đỉnh đích), mỗi dòng sau là một cạnh có hướng `u v w`. Ví dụ này có 6 đỉnh, 11 cạnh, đi từ đỉnh 1 tới đỉnh 6.

---

## Cảnh 2 — Dijkstra min-heap từng bước (≈ 3 phút)

**🎙 Mở đầu:**
> Ý tưởng của Dijkstra là **tham lam**: mỗi lần lấy ra đỉnh chưa chốt có khoảng cách nhỏ nhất, chốt nó lại, rồi thử cải thiện (relax) các đỉnh kề. Để lấy nhanh đỉnh nhỏ nhất, em dùng **min-heap**.
>
> Màu trên đồ thị: xám là chưa thăm, xanh dương là đã có khoảng cách tạm thời, cam là đỉnh đang xét, xanh lá là đã chốt.

| Bước | ▶ Thao tác | 🎙 Lời nói |
|---|---|---|
| 1 | Chỉ vào đỉnh 1 và dòng 2 pseudo-code | "Khởi tạo: dist của đỉnh nguồn 1 bằng 0, các đỉnh khác bằng vô cực. Đẩy (1, 0) vào hàng đợi." |
| 2 | `→`. Chỉ đỉnh 1 chuyển xanh lá | "Lấy đỉnh 1 ra khỏi hàng đợi và **chốt**: khoảng cách 0 là chắc chắn ngắn nhất." |
| 3–4 | `→` `→`. Chỉ cạnh xanh lá, bảng dist, hàng đợi | "Relax hai cạnh ra khỏi 1: đỉnh 2 có dist 4, đỉnh 3 có dist 1. Cả hai được đẩy vào heap. Heap luôn sắp tăng dần, (3, 1) đứng đầu." |
| 5 | `→` | "Đỉnh nhỏ nhất là 3, lấy ra và chốt với dist = 1." |
| 6 | `→`. **Dừng lại**, chỉ đỉnh 2 và hàng đợi | "**Điểm quan trọng:** đi 1 → 3 → 2 chỉ tốn 1 + 2 = 3, ngắn hơn đi thẳng 1 → 2 là 4. dist[2] giảm từ 4 xuống 3, prev[2] đổi thành 3. Heap của em **không sửa phần tử cũ** mà đẩy thêm bản mới (2, 3). Bản (2, 4) vẫn nằm trong heap. Cách này gọi là **lazy deletion**." |
| 7–8 | `→` `→` | "Tiếp tục relax: đỉnh 4 có dist 9, đỉnh 5 có dist 11." |
| 9 | `→` | "Lấy (2, 3) ra, chốt đỉnh 2 với dist = 3." |
| 10 | `→` | "Qua đỉnh 2 tới 4: 3 + 5 = 8, tốt hơn 9 → cập nhật." |
| 11 | `→`. Chỉ cạnh đỏ nét đứt | "Cạnh 2 → 5: 3 + 9 = 12, **không** tốt hơn 11 nên giữ nguyên. Cạnh tô đỏ nét đứt là relax không cải thiện." |
| 12 | `→`. **Dừng lại**, chỉ hàng đợi và dòng 5 pseudo-code | "Bây giờ lấy ra (2, 4). Đây chính là **bản cũ** lúc nãy: đỉnh 2 đã chốt rồi, nên bỏ qua. Trong khung hàng đợi, các phần tử cũ được **gạch ngang** để dễ thấy." |
| 13–19 | Bấm **▶ Tự chạy** | "Phần còn lại em cho tự chạy. Các bước lặp lại đúng quy trình: lấy ra, chốt, relax." *(Bước 14: 4→5 giảm 11 → 10. Bước 18: 5→6 giảm 14 → 13. Bước 16 và 19 lại là phần tử cũ bị bỏ qua.)* |
| 20–21 | Bấm **⏸ Tạm dừng** ở bước 20 hoặc 21 | "Bước 21: cạnh 6 → 4 bị bỏ qua vì đỉnh 4 **đã chốt**. Dijkstra không bao giờ sửa đỉnh đã chốt." |
| 23 | `End` (hoặc nút ⏭). Chỉ đường tím, Output, nhật ký | "Hàng đợi rỗng, thuật toán kết thúc. Đường ngắn nhất từ 1 tới 6 tô màu tím: **1 → 3 → 2 → 4 → 5 → 6, độ dài 13**. Output bên trái theo đúng định dạng đề: dòng i là khoảng cách tới đỉnh i, dòng cuối là đường đi." |

**▶ Thêm:** Bấm vào một dòng bất kỳ trong **Nhật ký các bước** (ví dụ #6), rồi kéo **thanh trượt** về cuối.

**🎙 Lời nói:**
> Có thể bấm vào nhật ký hoặc kéo thanh trượt để nhảy tới bất kỳ bước nào, kể cả lùi lại.
>
> Về thiết kế: phần thuật toán **chạy một lần** và sinh ra danh sách các bước, gọi là trace. Giao diện chỉ **phát lại** danh sách đó. Nhờ vậy cùng một mã thuật toán dùng được cho cả giao diện lẫn script kiểm thử.

---

## Cảnh 3 — Tự nhập input (≈ 1 phút)

**▶ Thao tác 1:** Trong ô Input, sửa dòng `3 2 2` thành `3 2 5`. Nhấn `Ctrl+Enter`, rồi `End`.

**🎙 Lời nói:**
> Người dùng có thể tự nhập đồ thị. Ví dụ em tăng trọng số cạnh 3 → 2 từ 2 lên 5. Lúc này đi vòng qua 3 không còn lợi nữa. Đường đi mới là **1 → 3 → 5 → 6, độ dài 14**.

**▶ Thao tác 2:** Sửa một trọng số thành chữ, ví dụ `4 6 6` → `4 6 x`. Nhấn `Ctrl+Enter`. Chỉ vào khung đỏ.

**🎙 Lời nói:**
> Nếu input sai, chương trình không bị treo mà báo rõ lỗi ở dòng nào: "Dòng 10: x không phải số nguyên".

**▶ Thao tác 3:** Chọn lại *Ví dụ 6 đỉnh* trong ô "Ví dụ có sẵn" để khôi phục.

---

## Cảnh 4 — Dijkstra mảng và Bellman-Ford trên cùng đồ thị (≈ 1,5 phút)

**▶ Thao tác 1:** Ô *Thuật toán* → **Dijkstra (mảng)**. Bấm `→` vài lần, rồi `End`.

**🎙 Lời nói:**
> Đây là cùng thuật toán Dijkstra nhưng **không dùng heap**: mỗi lần chọn đỉnh nhỏ nhất phải duyệt cả mảng dist, tốn O(V). Tổng độ phức tạp O(V²). Khung bên phải giờ hiện các **đỉnh ứng viên** thay cho hàng đợi. Không có phần tử cũ nên chỉ còn 19 bước. Kết quả vẫn là 13.

**▶ Thao tác 2:** Ô *Thuật toán* → **Bellman-Ford**. Bấm `→` qua bước 2 (chỉ thanh "Vòng 1 / 5"), bấm **▶ Tự chạy**, tạm dừng ở **bước 14** (Vòng 2), rồi `End`.

**🎙 Lời nói:**
> Bellman-Ford là thuật toán **quy hoạch động**. Sau vòng thứ i, dist[v] là đường ngắn nhất dùng tối đa i cạnh. Vì vậy cần tối đa n − 1 vòng, mỗi vòng duyệt **tất cả** các cạnh, độ phức tạp O(V·E).
>
> Ở ví dụ này, ngay vòng 1 đã ra đủ khoảng cách. Sang vòng 2 không cạnh nào cải thiện được, nên thuật toán **dừng sớm** mà không cần chạy đủ 5 vòng. Kết quả vẫn là 13, khớp với Dijkstra.

---

## Cảnh 5 — Cạnh âm: Dijkstra sai, Bellman-Ford đúng (≈ 1,5 phút)

**▶ Thao tác 1:** Ô *Ví dụ có sẵn* → **Cạnh âm: Dijkstra sai, Bellman-Ford đúng**. Giao diện tự chọn Dijkstra (min-heap) và bật ô *Minh họa cạnh âm*.

**🎙 Lời nói:**
> Dijkstra chỉ đúng khi mọi trọng số không âm. Đồ thị này có cạnh 3 → 2 trọng số **−4**. Em bật chế độ minh họa để cho Dijkstra vẫn chạy.

| Bước | ▶ Thao tác | 🎙 Lời nói |
|---|---|---|
| 5 | `→` tới bước 5 | "Dijkstra chốt đỉnh 2 với dist = 2, vì lúc này 2 là nhỏ nhất." |
| 8 | `→` tới bước 8. **Dừng lại** | "Tới khi xét đỉnh 3, cạnh 3 → 2 cho đường 5 + (−4) = **1**, tốt hơn 2. Nhưng đỉnh 2 **đã chốt** nên bị bỏ qua. Đây chính là chỗ giả định tham lam bị phá vỡ." |
| 10 | `End`. Chỉ khung **So sánh với Bellman-Ford** | "Kết thúc. Bảng so sánh cho thấy Dijkstra **sai ở 2 đỉnh**: đỉnh 2 ra 2, đúng là 1; đỉnh 4 ra 5, đúng là 4. Đường đúng là 1 → 3 → 2 → 4, độ dài 4." |

**▶ Thao tác 2:** Bỏ dấu ô *Minh họa cạnh âm*. Chỉ khung đỏ báo lỗi.

**🎙 Lời nói:**
> Ở chế độ bình thường, chương trình **từ chối** chạy Dijkstra trên cạnh âm và gợi ý dùng Bellman-Ford.

**▶ Thao tác 3:** Ô *Thuật toán* → **Bellman-Ford**, `End`.

**🎙 Lời nói:**
> Bellman-Ford xử lý được cạnh âm và cho kết quả đúng: 0, 1, 5, 4.

---

## Cảnh 6 — Chu trình âm (≈ 0,5 phút)

**▶ Thao tác:** Ô *Ví dụ có sẵn* → **Chu trình âm (Bellman-Ford phát hiện)**. Nhấn `End`.

**🎙 Lời nói:**
> Nếu có chu trình tổng âm, ví dụ 2 → 3 → 4 → 2 có tổng 1 − 3 + 1 = −1, thì đi vòng mãi sẽ càng ngắn, nên **không tồn tại** đường đi ngắn nhất. Bellman-Ford phát hiện điều này: sau n − 1 vòng mà vẫn còn cạnh relax được thì có chu trình âm. Chu trình được tô đỏ, và output báo "Phát hiện chu trình âm".

---

## Cảnh 7 — Testcase và benchmark (≈ 1,5 phút)

**▶ Thao tác 1:** Chuyển sang VS Code, mở Explorer thư mục `3_Testcase`, mở `3_Testcase/README.md` ở chế độ Preview.

**🎙 Lời nói:**
> Bộ testcase có **44 test, chia 5 nhóm**: nhỏ, biên, đặc biệt, lớn và input không hợp lệ. Test đầu tiên của nhóm nhỏ chính là ví dụ 6 đỉnh vừa demo.
>
> Đáp án được tính bằng các thuật toán độc lập: **vét cạn** cho đồ thị tối đa 8 đỉnh, **Floyd-Warshall** cho đồ thị vừa, Bellman-Ford cho đồ thị lớn. Các nguồn này được đối chiếu chéo với nhau. Mọi test sinh bằng script có seed nên tạo lại được y hệt.

**▶ Thao tác 2:** Ở terminal thứ hai, chạy:
```
node scripts/run-tests.js
```
Chờ chạy xong (khoảng 15 giây), cuộn tới dòng tổng kết.

**🎙 Lời nói:**
> Script chạy **cả 3 thuật toán** trên toàn bộ test. Kết quả: **128 lượt đạt, 0 không đạt**. Dijkstra mảng được bỏ qua ở các đồ thị 10^5 đỉnh vì O(V²) quá chậm. Với test có cạnh âm, Dijkstra được tính là đạt khi báo lỗi đúng.
>
> Để chắc bộ test thực sự bắt được lỗi, em đã thử cố ý cài một lỗi vào heap. Kết quả có 5 test báo sai, toàn bộ nằm ở nhóm đặc biệt và nhóm lớn.

**▶ Thao tác 3:** Mở `4_Report/so-lieu/benchmark.md` (Preview).

**🎙 Lời nói:**
> Cuối cùng là đo thời gian. Với **đồ thị thưa**, bản heap nhanh hơn hẳn: ở 20 nghìn đỉnh, heap mất khoảng 32 mili giây, còn bản mảng mất hơn 1,5 giây. Với **đồ thị dày** thì ngược lại: ở 1000 đỉnh và khoảng nửa triệu cạnh, bản mảng O(V²) nhanh hơn heap. Kết quả này khớp với phân tích độ phức tạp: O((V + E) log V) so với O(V²).

*(Số liệu chính xác lấy theo file benchmark.md trên máy; nếu chạy lại, số sẽ hơi khác.)*

---

## Cảnh 8 — Kết (≈ 0,5 phút)

**▶ Thao tác:** Quay lại trình duyệt, chọn lại *Ví dụ 6 đỉnh*, nhấn `End` để hiện đường đi tím.

**🎙 Lời nói:**
> Tóm lại, sản phẩm gồm: mô phỏng từng bước Dijkstra dùng min-heap; so sánh với bản dùng mảng và Bellman-Ford; minh họa trường hợp cạnh âm; cùng bộ 44 testcase và benchmark.
>
> Hướng phát triển: thêm thuật toán A*, chạy trên bản đồ thật, và bài toán hành trình đường thư theo lịch chuyến. Hàm relax đã được tách riêng để có thể thay bằng "giờ đến sớm nhất theo lịch".
>
> Cảm ơn thầy/cô đã theo dõi.

---

## Sau khi quay

- [ ] Lưu video vào `2_VideoDemo/` (ví dụ `demo-dijkstra.mp4`). Nếu file quá lớn, đăng YouTube chế độ *Không công khai* rồi ghi link vào `2_VideoDemo/link.txt`.
- [ ] Chụp vài ảnh màn hình quan trọng (bước 6, bước 12, bước 23 của cảnh 2; bảng so sánh ở cảnh 5) vào `4_Report/hinh/` để dùng cho report.
- [ ] Ghi vào DEVLOG: đã quay video, thời lượng, công cụ quay.
