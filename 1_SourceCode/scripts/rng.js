// rng.js — Sinh số ngẫu nhiên có seed (mulberry32) để testcase và benchmark tái tạo được.
// Không dùng LCG kiểu `seed % k`: các bit thấp có chu kỳ ngắn, các lần chọn liên tiếp phụ thuộc nhau
// (xem DEVLOG, Nhật ký lỗi #3).

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; // [0, 1)
  };
}

/** Bộ sinh với các hàm tiện ích. */
export function makeRandom(seed) {
  const next = mulberry32(seed);
  return {
    next,
    /** Số nguyên trong [lo, hi] */
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    /** Xáo trộn mảng tại chỗ (Fisher–Yates) */
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  };
}
