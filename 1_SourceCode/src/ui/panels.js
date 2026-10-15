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

/* ---------- Hàng đợi ưu tiên ---------- */

/** Hiển thị các phần tử trong heap, sắp tăng dần. Phần tử cũ (lazy deletion) bị gạch ngang. */
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
