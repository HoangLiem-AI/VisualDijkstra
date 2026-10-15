// panels.js — Các bảng bên cạnh đồ thị: pseudo-code, bảng dist/prev, hàng đợi, nhật ký bước.
// Chỉ hiển thị dữ liệu có sẵn trong bước trace, không tính lại thuật toán.

const fmt = (x) => (x === Infinity ? '∞' : String(x));

export const TYPE_LABELS = {
  init: 'Khởi tạo',
  extract: 'Lấy ra & chốt',
  'skip-stale': 'Bỏ qua phần tử cũ',
  'relax-ok': 'Relax: cập nhật',
  'relax-fail': 'Relax: giữ nguyên',
  done: 'Kết thúc',
  round: 'Vòng lặp',
  'negative-cycle': 'Chu trình âm',
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* ---------- Pseudo-code ---------- */

export function renderPseudoCode(container, lines) {
  container.replaceChildren(
    ...lines.map((text, i) => {
      const li = el('li');
      li.dataset.line = i + 1;
      // Tách phần chú thích sau dấu ▷ để hiển thị màu nhạt, bỏ khoảng trắng căn lề
      const [code, comment] = text.split('▷');
      const body = el('span', 'code', code.trimEnd());
      if (comment) body.append(el('span', 'comment', `  ▷ ${comment.trim()}`));
      li.append(el('span', 'ln', String(i + 1)), body);
      return li;
    })
  );
}

/** Tô sáng dòng đang chạy; màu theo loại bước. line = null để bỏ tô. */
export function highlightLine(container, line, type) {
  for (const li of container.children) {
    li.className = Number(li.dataset.line) === line ? `active t-${type}` : '';
  }
}

/* ---------- Bảng dist / prev ---------- */

export function renderDistTable(table, step, n, s, t) {
  const head = el('tr');
  for (const h of ['Đỉnh', 'dist', 'prev', 'Trạng thái']) head.append(el('th', '', h));

  const rows = [head];
  for (let i = 1; i <= n; i++) {
    let status = 'chưa thăm';
    let cls = 'st-idle';
    if (step.finalized[i]) [status, cls] = ['đã chốt', 'st-final'];
    else if (step.dist[i] !== Infinity) [status, cls] = ['tạm thời', 'st-frontier'];

    const tr = el('tr', cls);
    if (i === step.current) tr.classList.add('row-current');
    if (step.edge && step.edge.v === i) tr.classList.add(step.type === 'relax-ok' ? 'row-ok' : 'row-fail');

    const tag = (i === s ? ' (s)' : '') + (i === t ? ' (t)' : '');
    tr.append(
      el('td', 'vertex', `${i}${tag}`),
      el('td', 'num', fmt(step.dist[i])),
      el('td', 'num', step.prev[i] === null ? '–' : String(step.prev[i])),
      el('td', 'status', status)
    );
    rows.push(tr);
  }
  table.replaceChildren(...rows);
}

/* ---------- Hàng đợi ưu tiên / ứng viên / vòng lặp ---------- */

// Tiêu đề và chú thích của khung này, tùy thuật toán (ALGORITHMS[id].queue)
export const QUEUE_INFO = {
  heap: {
    title: 'Hàng đợi ưu tiên (min-heap, sắp tăng dần)',
    hint: 'Phần tử gạch ngang là bản cũ (lazy deletion), sẽ bị bỏ qua khi lấy ra.',
  },
  array: {
    title: 'Đỉnh ứng viên (chưa chốt, dist < ∞)',
    hint: 'Không có hàng đợi: mỗi lần chọn phải duyệt cả mảng dist, O(V), để tìm đỉnh nhỏ nhất.',
  },
  rounds: {
    title: 'Vòng lặp',
    hint: 'Mỗi vòng duyệt toàn bộ cạnh. Sau vòng i, dist[v] đúng với mọi đường đi dùng ≤ i cạnh.',
  },
};

/** Bellman-Ford: hiển thị vòng hiện tại trên tổng n − 1 vòng. */
export function renderRounds(container, step) {
  const box = el('div', 'rounds');
  const label = step.round === 0 ? 'Chưa bắt đầu vòng nào' : `Vòng ${step.round} / ${step.maxRound}`;
  const bar = el('div', 'bar');
  const fill = el('i');
  fill.style.width = step.maxRound ? `${(100 * step.round) / step.maxRound}%` : '100%';
  bar.append(fill);
  box.append(el('span', 'round-label', label), bar);
  container.replaceChildren(box);
}

/** Hiển thị các phần tử trong heap (hoặc các đỉnh ứng viên), sắp tăng dần. Phần tử cũ bị gạch ngang. */
export function renderQueue(container, step) {
  if (step.pq.length === 0) {
    container.replaceChildren(el('span', 'pq-empty', '∅ rỗng'));
    return;
  }
  container.replaceChildren(
    ...step.pq.map((item, k) => {
      const stale = step.finalized[item.vertex] || item.key > step.dist[item.vertex];
      const chip = el('span', 'chip');
      if (k === 0) chip.classList.add('top');
      if (stale) chip.classList.add('stale');
      chip.title = stale ? 'Phần tử cũ: sẽ bị bỏ qua khi lấy ra' : `Đỉnh ${item.vertex}, khóa ${item.key}`;
      chip.append(el('b', '', String(item.vertex)), el('span', '', `: ${item.key}`));
      return chip;
    })
  );
}

/* ---------- Nhật ký các bước ---------- */

export function renderLog(container, trace, onSelect) {
  container.replaceChildren(
    ...trace.map((step, i) => {
      const li = el('li', `t-${step.type}`);
      li.append(el('span', 'log-no', `#${i + 1}`), el('span', 'log-msg', step.message));
      li.addEventListener('click', () => onSelect(i));
      return li;
    })
  );
}

/** Chỉ hiện các bước đã chạy tới; cuộn để bước hiện tại luôn nhìn thấy. */
export function updateLog(container, index) {
  const items = container.children;
  for (let i = 0; i < items.length; i++) {
    items[i].classList.toggle('future', i > index);
    items[i].classList.toggle('active', i === index);
  }
  const li = items[index];
  if (!li) return;
  // Cuộn trong khung log, không cuộn cả trang
  if (li.offsetTop < container.scrollTop) container.scrollTop = li.offsetTop;
  else if (li.offsetTop + li.offsetHeight > container.scrollTop + container.clientHeight) {
    container.scrollTop = li.offsetTop + li.offsetHeight - container.clientHeight;
  }
}

/* ---------- So sánh Dijkstra với Bellman-Ford (minh họa cạnh âm) ---------- */

/**
 * @param mine kết quả Dijkstra, bf kết quả Bellman-Ford (cùng đồ thị, cùng s)
 */
export function renderCompare(container, mine, bf, n, name, t) {
  if (bf.negativeCycle) {
    container.replaceChildren(
      el('p', 'compare-summary bad',
        `Bellman-Ford phát hiện chu trình âm (${[...bf.cycle, bf.cycle[0]].join(' → ')}): ` +
        'không tồn tại đường đi ngắn nhất, nên mọi kết quả của Dijkstra đều vô nghĩa.')
    );
    return;
  }

  let wrong = 0;
  const head = el('tr');
  for (const h of ['Đỉnh', name, 'Bellman-Ford', '']) head.append(el('th', '', h));
  const rows = [head];
  for (let v = 1; v <= n; v++) {
    const a = mine.dist[v];
    const b = bf.dist[v];
    const same = a === b;
    if (!same) wrong++;
    const tr = el('tr', same ? '' : 'diff');
    tr.append(el('td', '', String(v)), el('td', '', fmt(a)), el('td', '', fmt(b)), el('td', '', same ? '✓' : '✗'));
    rows.push(tr);
  }

  const summary = wrong
    ? el('p', 'compare-summary bad', `${name} sai ở ${wrong} đỉnh.`)
    : el('p', 'compare-summary good', `Lần này ${name} vẫn ra đúng, nhưng với cạnh âm thì không có gì đảm bảo.`);
  const table = el('table', 'compare-table');
  table.append(...rows);

  const parts = [summary, table];
  if (t !== null) {
    const paths = el('div', 'compare-paths');
    const show = (r) => (r.path ? `${r.path.join(' → ')} (${r.dist[t]})` : 'không có');
    paths.append(el('div', '', `${name}: ${show(mine)}`), el('div', '', `Bellman-Ford: ${show(bf)}`));
    parts.push(paths);
  }
  container.replaceChildren(...parts);
}
