// samples.js — Các đồ thị ví dụ, dùng chung cho giao diện web và script Node.
// SAMPLES[0] là ví dụ thống nhất: dùng trong report, video demo và testcase.

export const SAMPLES = [
  {
    id: 'vi-du-6-dinh',
    name: 'Ví dụ 6 đỉnh (report / video)',
    directed: true,
    // Có hướng, s = 1, t = 6. Trace có đủ các loại bước:
    // relax-ok, relax-fail (không cải thiện và v đã chốt), skip-stale.
    text: `6 11 1 6
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
`,
  },
  {
    id: 'vo-huong-5-dinh',
    name: 'Đồ thị vô hướng 5 đỉnh',
    directed: false,
    text: `5 6 1 5
1 2 2
1 3 5
2 3 1
2 4 6
3 4 2
4 5 1
`,
  },
  {
    id: 'khong-toi-duoc',
    name: 'Có đỉnh không tới được',
    directed: true,
    text: `5 4 1 5
1 2 2
2 3 3
1 3 7
4 5 1
`,
  },
  {
    id: 'canh-am',
    name: 'Có cạnh âm (Dijkstra báo lỗi)',
    directed: true,
    text: `3 3 1 3
1 2 5
2 3 -4
1 3 2
`,
  },
];
