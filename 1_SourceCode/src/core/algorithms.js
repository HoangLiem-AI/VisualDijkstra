// algorithms.js — Danh mục các thuật toán, để giao diện và script chọn theo id.

import { dijkstraHeap, PSEUDO_CODE as HEAP_CODE } from './dijkstra-heap.js';
import { dijkstraArray, PSEUDO_CODE as ARRAY_CODE } from './dijkstra-array.js';
import { bellmanFord, PSEUDO_CODE as BF_CODE } from './bellman-ford.js';

export const ALGORITHMS = {
  'dijkstra-heap': {
    id: 'dijkstra-heap',
    name: 'Dijkstra (min-heap)',
    complexity: 'O((V + E) log V)',
    run: dijkstraHeap,
    pseudo: HEAP_CODE,
    queue: 'heap',          // trường pq của trace là nội dung min-heap
    acceptsNegative: false, // chỉ chạy với cạnh âm khi bật chế độ minh họa
  },
  'dijkstra-array': {
    id: 'dijkstra-array',
    name: 'Dijkstra (mảng)',
    complexity: 'O(V² + E)',
    run: dijkstraArray,
    pseudo: ARRAY_CODE,
    queue: 'array',         // trường pq là các đỉnh ứng viên
    acceptsNegative: false,
  },
  'bellman-ford': {
    id: 'bellman-ford',
    name: 'Bellman-Ford (quy hoạch động)',
    complexity: 'O(V · E)',
    run: bellmanFord,
    pseudo: BF_CODE,
    queue: 'rounds',        // không có hàng đợi; hiển thị số vòng
    acceptsNegative: true,
  },
};
