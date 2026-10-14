// min-heap.js — Hàng đợi ưu tiên bằng heap nhị phân (cây nhị phân đầy đủ lưu trong mảng).
// Mỗi phần tử là { vertex, key }. Nút i có con 2i+1, 2i+2 và cha (i-1)>>1.
// Khóa bằng nhau thì đỉnh nhỏ hơn ra trước, để trace luôn tái tạo được.
// Không hỗ trợ decrease-key: Dijkstra dùng lazy deletion (đẩy bản mới, bỏ qua bản cũ khi lấy ra).

export class MinHeap {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  /** Thêm phần tử: đặt vào cuối rồi đẩy lên. O(log n) */
  push(vertex, key) {
    this.items.push({ vertex, key });
    this.#siftUp(this.items.length - 1);
  }

  /** Xem phần tử nhỏ nhất, không lấy ra. O(1) */
  peek() {
    return this.items.length ? { ...this.items[0] } : null;
  }

  /** Lấy phần tử nhỏ nhất: đưa phần tử cuối lên gốc rồi đẩy xuống. O(log n) */
  pop() {
    const a = this.items;
    if (a.length === 0) return null;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  /** Bản sao các phần tử theo thứ tự tăng dần, dùng cho trace và giao diện. O(n log n) */
  toSortedArray() {
    return this.items
      .map((x) => ({ vertex: x.vertex, key: x.key }))
      .sort((x, y) => x.key - y.key || x.vertex - y.vertex);
  }

  /** Bản sao mảng heap đúng thứ tự lưu trữ (để vẽ dạng cây nếu cần). */
  toArray() {
    return this.items.map((x) => ({ vertex: x.vertex, key: x.key }));
  }

  #less(i, j) {
    const a = this.items[i];
    const b = this.items[j];
    return a.key < b.key || (a.key === b.key && a.vertex < b.vertex);
  }

  #swap(i, j) {
    const a = this.items;
    [a[i], a[j]] = [a[j], a[i]];
  }

  #siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.#less(i, parent)) break;
      this.#swap(i, parent);
      i = parent;
    }
  }

  #siftDown(i) {
    const n = this.items.length;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let smallest = i;
      if (l < n && this.#less(l, smallest)) smallest = l;
      if (r < n && this.#less(r, smallest)) smallest = r;
      if (smallest === i) break;
      this.#swap(i, smallest);
      i = smallest;
    }
  }
}
