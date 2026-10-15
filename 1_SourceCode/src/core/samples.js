// samples.js — Các đồ thị ví dụ, dùng chung cho giao diện web và script Node.
// SAMPLES[0] là ví dụ thống nhất: dùng trong report, video demo và testcase.
// Trường tùy chọn: algorithm (thuật toán nên chọn khi nạp ví dụ), demoNegative (bật minh họa cạnh âm),
// layout (bố cục vẽ: breadthfirst | circle | cose).

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
    id: 'canh-am-dijkstra-sai',
    name: 'Cạnh âm: Dijkstra sai, Bellman-Ford đúng',
    directed: true,
    algorithm: 'dijkstra-heap',
    demoNegative: true,
    // Dijkstra chốt đỉnh 2 với dist = 2 quá sớm; đường 1 → 3 → 2 dài 5 + (−4) = 1 tốt hơn
    // nhưng tới khi xét 3→2 thì 2 đã chốt. Kết quả đúng: dist = 0 1 5 4.
    text: `4 4 1 4
1 2 2
1 3 5
3 2 -4
2 4 3
`,
  },
  {
    id: 'chu-trinh-am',
    name: 'Chu trình âm (Bellman-Ford phát hiện)',
    directed: true,
    algorithm: 'bellman-ford',
    layout: 'circle', // bố cục cây xếp các đỉnh thẳng hàng, che mất chu trình
    // Chu trình 2 → 3 → 4 → 2 có tổng 1 + (−3) + 1 = −1
    text: `5 5 1 5
1 2 4
2 3 1
3 4 -3
4 2 1
4 5 2
`,
  },
];
