# Bộ testcase

Sinh bằng `node scripts/gen-tests.js` (trong `1_SourceCode`). Có seed nên chạy lại ra đúng các file này.
Kiểm tra bằng `node scripts/run-tests.js`.

Định dạng: xem README gốc. Đồ thị trong testcase đều **có hướng**.

**Cách chấm** (`run-tests.js`):
- Các dòng khoảng cách phải khớp chính xác.
- Dòng đường đi: chấp nhận mọi đường đi hợp lệ từ s tới t có độ dài đúng bằng dist[t] (có thể có nhiều đường ngắn nhất).
- Test có cạnh âm: Dijkstra (heap, mảng) phải báo lỗi cạnh âm; Bellman-Ford phải ra đáp án trong `.out`.
- Nhóm `khong-hop-le`: output phải đúng thông báo lỗi trong `.out`.

| Nhóm | Test | Mô tả | n / m | Nguồn đáp án | Seed |
|---|---|---|---|---|---|
| nho | 01-vi-du-6-dinh | Ví dụ thống nhất dùng trong report và video | 6 / 11 | vét cạn (+ Floyd, Bellman-Ford) | 20261018 |
| nho | 02-ngau-nhien-1 | Ngẫu nhiên n ≤ 8, trọng số 0..20 | 7 / 21 | vét cạn (+ Floyd, Bellman-Ford) | 20261019 |
| nho | 03-ngau-nhien-2 | Ngẫu nhiên n ≤ 8, trọng số 0..20 | 4 / 6 | vét cạn (+ Floyd, Bellman-Ford) | 20261020 |
| nho | 04-ngau-nhien-3 | Ngẫu nhiên n ≤ 8, trọng số 0..20 | 6 / 6 | vét cạn (+ Floyd, Bellman-Ford) | 20261021 |
| nho | 05-ngau-nhien-4 | Ngẫu nhiên n ≤ 8, trọng số 0..20 | 6 / 8 | vét cạn (+ Floyd, Bellman-Ford) | 20261022 |
| nho | 06-ngau-nhien-5 | Ngẫu nhiên n ≤ 8, trọng số 0..20 | 3 / 6 | vét cạn (+ Floyd, Bellman-Ford) | 20261023 |
| nho | 07-ngau-nhien-6 | Ngẫu nhiên n ≤ 8, trọng số 0..20 | 4 / 8 | vét cạn (+ Floyd, Bellman-Ford) | 20261024 |
| nho | 08-ngau-nhien-7 | Ngẫu nhiên n ≤ 8, trọng số 0..20 | 3 / 4 | vét cạn (+ Floyd, Bellman-Ford) | 20261025 |
| nho | 09-ngau-nhien-8 | Ngẫu nhiên n ≤ 8, trọng số 0..20 | 7 / 8 | vét cạn (+ Floyd, Bellman-Ford) | 20261026 |
| nho | 10-ngau-nhien-9 | Ngẫu nhiên n ≤ 8, trọng số 0..20 | 5 / 13 | vét cạn (+ Floyd, Bellman-Ford) | 20261027 |
| nho | 11-ngau-nhien-10 | Ngẫu nhiên n ≤ 8, trọng số 0..20 | 3 / 6 | vét cạn (+ Floyd, Bellman-Ford) | 20261028 |
| bien | 01-mot-dinh | n = 1, m = 0, s = t | 1 / 0 | vét cạn (+ Floyd, Bellman-Ford) | 20261029 |
| bien | 02-khong-canh | m = 0: chỉ tới được s | 5 / 0 | vét cạn (+ Floyd, Bellman-Ford) | 20261030 |
| bien | 03-s-bang-t | s = t, đường đi chỉ gồm s | 6 / 12 | vét cạn (+ Floyd, Bellman-Ford) | 20261031 |
| bien | 04-trong-so-0 | Mọi trọng số bằng 0 | 8 / 20 | vét cạn (+ Floyd, Bellman-Ford) | 20261032 |
| bien | 05-trong-so-max | Mọi trọng số 10^9, chuỗi 1000 đỉnh (dist tới 9.99·10^11) | 1000 / 999 | Bellman-Ford | 20261033 |
| bien | 06-khuyen-canh-song-song | Có khuyên (u → u) và nhiều cạnh song song khác trọng số | 4 / 9 | vét cạn (+ Floyd, Bellman-Ford) | 20261034 |
| bien | 07-khong-co-t | Dòng đầu chỉ có n m s (không in đường đi) | 7 / 14 | vét cạn (+ Floyd, Bellman-Ford) | 20261035 |
| bien | 08-t-khong-toi-duoc | t không tới được: dist = -1, đường đi -1 | 5 / 4 | vét cạn (+ Floyd, Bellman-Ford) | 20261036 |
| bien | 09-n-max-khong-canh | n = 10^5, m = 0 | 100000 / 0 | Bellman-Ford | 20261037 |
| dac-biet | 01-canh-am-dijkstra-sai | Cạnh âm: Dijkstra phải báo lỗi; Bellman-Ford ra 0 1 5 4 | 4 / 4 | vét cạn (+ Floyd, Bellman-Ford) | 20261038 |
| dac-biet | 02-chu-trinh-am | Chu trình âm 2 → 3 → 4 → 2 tới được từ s | 5 / 5 | Floyd-Warshall + Bellman-Ford | 20261039 |
| dac-biet | 03-chu-trinh-am-khong-toi-duoc | Có chu trình âm nhưng s không tới được: vẫn có đáp án | 6 / 6 | vét cạn (+ Floyd, Bellman-Ford) | 20261040 |
| dac-biet | 04-canh-am-khong-chu-trinh | n = 30, nhiều cạnh âm, không có chu trình âm | 30 / 90 | Floyd-Warshall + Bellman-Ford | 20261041 |
| dac-biet | 05-chu-trinh-trong-so-0 | Chu trình tổng 0 (không âm) có cạnh âm | 4 / 5 | vét cạn (+ Floyd, Bellman-Ford) | 20261042 |
| dac-biet | 06-day-du | Đồ thị đầy đủ có hướng n = 40 (1560 cạnh) | 40 / 1560 | Floyd-Warshall (+ Bellman-Ford) | 20261043 |
| dac-biet | 07-hinh-sao | Hình sao: s nối tới 49 đỉnh, không có cạnh khác | 50 / 49 | Floyd-Warshall (+ Bellman-Ford) | 20261044 |
| dac-biet | 08-nhieu-duong-bang-nhau | Lưới 6×6 mọi trọng số 1: rất nhiều đường ngắn nhất bằng nhau | 36 / 120 | Floyd-Warshall (+ Bellman-Ford) | 20261045 |
| dac-biet | 09-nhieu-phan-tu-cu | i → j (i < j) trọng số (j − i)²: dist bị cập nhật nhiều lần, nhiều phần tử cũ trong heap | 60 / 1770 | Floyd-Warshall (+ Bellman-Ford) | 20261046 |
| dac-biet | 10-mang-buu-chinh | Mạng bưu chính 1250 điểm: 3 TTKT vùng (HN, ĐN, HCM) + 63 TTKT tỉnh nối dày; 1184 bưu cục chỉ nối TTKT, không nối nhau (thưa). w = phút di chuyển | 1250 / 2978 | Bellman-Ford | 20261062 |
| lon | 01-thua-ngau-nhien | n = 10^5, m = 2·10^5 ngẫu nhiên, w ≤ 10^9 | 100000 / 200000 | Bellman-Ford | 20261047 |
| lon | 02-chuoi-trong-so-max | Chuỗi 10^5 đỉnh w = 10^9 (dist tới ≈ 10^14) + 10^5 cạnh ngược | 100000 / 199998 | Bellman-Ford | 20261048 |
| lon | 03-day | n = 450, m = 2·10^5 (gần đầy đủ) | 450 / 200000 | Bellman-Ford | 20261049 |
| lon | 04-luoi | Lưới 220×220 (48400 đỉnh, 192720 cạnh), w 1..100 | 48400 / 192720 | Bellman-Ford | 20261050 |
| khong-hop-le | 01-rong | Input rỗng | — | thông báo lỗi của parser | 20261051 |
| khong-hop-le | 02-dong-dau-thieu | Dòng đầu thiếu s | — | thông báo lỗi của parser | 20261052 |
| khong-hop-le | 03-khong-phai-so | Trọng số là chữ | — | thông báo lỗi của parser | 20261053 |
| khong-hop-le | 04-so-thuc | Trọng số là số thực | — | thông báo lỗi của parser | 20261054 |
| khong-hop-le | 05-n-bang-0 | n = 0 | — | thông báo lỗi của parser | 20261055 |
| khong-hop-le | 06-s-ngoai-pham-vi | s > n | — | thông báo lỗi của parser | 20261056 |
| khong-hop-le | 07-dinh-ngoai-pham-vi | Cạnh tới đỉnh 4 khi n = 3 | — | thông báo lỗi của parser | 20261057 |
| khong-hop-le | 08-trong-so-qua-lon | w = 10^9 + 1 | — | thông báo lỗi của parser | 20261058 |
| khong-hop-le | 09-thieu-dong-canh | Khai báo m = 3 nhưng có 2 dòng cạnh | — | thông báo lỗi của parser | 20261059 |
| khong-hop-le | 10-thua-dong-canh | Khai báo m = 1 nhưng có 2 dòng cạnh | — | thông báo lỗi của parser | 20261060 |
| khong-hop-le | 11-m-qua-lon | m = 200001 vượt giới hạn | — | thông báo lỗi của parser | 20261061 |
