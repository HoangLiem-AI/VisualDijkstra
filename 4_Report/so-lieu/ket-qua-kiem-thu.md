# Kết quả kiểm thử

Chạy bằng `node scripts/run-tests.js` lúc 15:29:41 17/10/2026, Node.js v24.20.0.
Thời gian gồm cả đọc input và ghi output (hàm `solve`). "— (n lớn)": Dijkstra mảng O(V²) không chạy với n > 20000.

**Đạt: 128 — Không đạt: 0 — Bỏ qua: 4**

| Nhóm | Test | n / m | Heap | Mảng | BF |
|---|---|---|---|---|---|
| nho | 01-vi-du-6-dinh | 6 / 11 | ✓ 0.8 ms | ✓ 0.3 ms | ✓ 0.4 ms |
| nho | 02-ngau-nhien-1 | 7 / 21 | ✓ 0.6 ms | ✓ 0.1 ms | ✓ 0.1 ms |
| nho | 03-ngau-nhien-2 | 4 / 6 | ✓ 0.1 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| nho | 04-ngau-nhien-3 | 6 / 6 | ✓ 0.1 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| nho | 05-ngau-nhien-4 | 6 / 8 | ✓ 0.1 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| nho | 06-ngau-nhien-5 | 3 / 6 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| nho | 07-ngau-nhien-6 | 4 / 8 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| nho | 08-ngau-nhien-7 | 3 / 4 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| nho | 09-ngau-nhien-8 | 7 / 8 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| nho | 10-ngau-nhien-9 | 5 / 13 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| nho | 11-ngau-nhien-10 | 3 / 6 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| bien | 01-mot-dinh | 1 / 0 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| bien | 02-khong-canh | 5 / 0 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| bien | 03-s-bang-t | 6 / 12 | ✓ 0.1 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| bien | 04-trong-so-0 | 8 / 20 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.1 ms |
| bien | 05-trong-so-max | 1000 / 999 | ✓ 2.9 ms | ✓ 8.2 ms | ✓ 2.1 ms |
| bien | 06-khuyen-canh-song-song | 4 / 9 | ✓ 0.1 ms | ✓ 0.1 ms | ✓ 0.0 ms |
| bien | 07-khong-co-t | 7 / 14 | ✓ 0.1 ms | ✓ 0.0 ms | ✓ 0.1 ms |
| bien | 08-t-khong-toi-duoc | 5 / 4 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| bien | 09-n-max-khong-canh | 100000 / 0 | ✓ 17.5 ms | — (n lớn) | ✓ 20.1 ms |
| dac-biet | 01-canh-am-dijkstra-sai | 4 / 4 | ✓ 0.1 ms | ✓ 0.0 ms | ✓ 0.1 ms |
| dac-biet | 02-chu-trinh-am | 5 / 5 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.1 ms |
| dac-biet | 03-chu-trinh-am-khong-toi-duoc | 6 / 6 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| dac-biet | 04-canh-am-khong-chu-trinh | 30 / 90 | ✓ 0.1 ms | ✓ 0.1 ms | ✓ 1.2 ms |
| dac-biet | 05-chu-trinh-trong-so-0 | 4 / 5 | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| dac-biet | 06-day-du | 40 / 1560 | ✓ 3.0 ms | ✓ 2.4 ms | ✓ 3.6 ms |
| dac-biet | 07-hinh-sao | 50 / 49 | ✓ 0.2 ms | ✓ 0.2 ms | ✓ 0.1 ms |
| dac-biet | 08-nhieu-duong-bang-nhau | 36 / 120 | ✓ 0.2 ms | ✓ 0.2 ms | ✓ 0.3 ms |
| dac-biet | 09-nhieu-phan-tu-cu | 60 / 1770 | ✓ 4.2 ms | ✓ 2.5 ms | ✓ 2.4 ms |
| lon | 01-thua-ngau-nhien | 100000 / 200000 | ✓ 472.7 ms | — (n lớn) | ✓ 1578.7 ms |
| lon | 02-chuoi-trong-so-max | 100000 / 199998 | ✓ 308.4 ms | — (n lớn) | ✓ 361.4 ms |
| lon | 03-day | 450 / 200000 | ✓ 231.3 ms | ✓ 214.8 ms | ✓ 332.9 ms |
| lon | 04-luoi | 48400 / 192720 | ✓ 242.4 ms | — (n lớn) | ✓ 5075.1 ms |
| khong-hop-le | 01-rong | — | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| khong-hop-le | 02-dong-dau-thieu | — | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| khong-hop-le | 03-khong-phai-so | — | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| khong-hop-le | 04-so-thuc | — | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| khong-hop-le | 05-n-bang-0 | — | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| khong-hop-le | 06-s-ngoai-pham-vi | — | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| khong-hop-le | 07-dinh-ngoai-pham-vi | — | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| khong-hop-le | 08-trong-so-qua-lon | — | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| khong-hop-le | 09-thieu-dong-canh | — | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| khong-hop-le | 10-thua-dong-canh | — | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
| khong-hop-le | 11-m-qua-lon | — | ✓ 0.0 ms | ✓ 0.0 ms | ✓ 0.0 ms |
