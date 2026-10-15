// app.js — Nối giao diện: đọc input → gọi lõi thuật toán lấy trace → phát lại trace.
// Thuật toán chỉ chạy trong src/core; file này không tự tính dist.

import { parseInput, formatOutput, InputError } from '../core/parser.js';
import { createGraph, GraphError } from '../core/graph.js';
import { dijkstraHeap, PSEUDO_CODE } from '../core/dijkstra-heap.js';
import { SAMPLES } from '../core/samples.js';
import { GraphRenderer } from './renderer.js';
import { Player } from './player.js';
import * as panels from './panels.js';

// Giao diện chỉ mô phỏng đồ thị nhỏ; đồ thị lớn chạy bằng script Node.
const MAX_UI_N = 30;
const MAX_UI_M = 150;

const $ = (id) => document.getElementById(id);

const dom = {
  sample: $('sample'),
  input: $('input'),
  undirected: $('undirected'),
  run: $('run'),
  error: $('error'),
  output: $('output'),
  log: $('log'),
  pseudo: $('pseudo'),
  distTable: $('dist-table'),
  pq: $('pq'),
  stepType: $('step-type'),
  stepMessage: $('step-message'),
  counter: $('counter'),
  timeline: $('timeline'),
  speed: $('speed'),
  btnFirst: $('btn-first'),
  btnPrev: $('btn-prev'),
  btnPlay: $('btn-play'),
  btnNext: $('btn-next'),
  btnLast: $('btn-last'),
};

// Trạng thái của lần chạy hiện tại
let state = { input: null, graph: null, trace: [], outputText: '' };

const renderer = new GraphRenderer($('graph'));
const player = new Player(onStepChange);

/* ---------- Chạy thuật toán ---------- */

function showError(message) {
  dom.error.textContent = message;
  dom.error.hidden = false;
}

function run() {
  dom.error.hidden = true;
  player.pause();

  // 1. Đọc input
  let input;
  try {
    input = parseInput(dom.input.value);
  } catch (err) {
    if (err instanceof InputError) return showError(err.message);
    throw err;
  }
  if (input.n > MAX_UI_N || input.m > MAX_UI_M) {
    return showError(
      `Giao diện chỉ mô phỏng đồ thị tối đa ${MAX_UI_N} đỉnh, ${MAX_UI_M} cạnh. ` +
      'Đồ thị lớn hơn hãy chạy bằng script: node scripts/demo-trace.js file.in'
    );
  }

  // 2. Dựng và vẽ đồ thị
  const graph = createGraph(input.n, input.edges, { directed: !dom.undirected.checked });
  renderer.load(graph, input.s, input.t);
  state = { input, graph, trace: [], outputText: '' };

  // 3. Chạy thuật toán ở lõi, nhận trace
  try {
    const { result, trace } = dijkstraHeap(graph, input.s, { t: input.t });
    state.trace = trace;
    state.outputText = formatOutput(result, input.t);
  } catch (err) {
    if (!(err instanceof GraphError)) throw err;
    showError(err.message);
  }

  // 4. Phát lại từ bước đầu
  panels.renderLog(dom.log, state.trace, (i) => {
    player.pause();
    player.goto(i);
  });
  dom.timeline.max = Math.max(0, state.trace.length - 1);
  player.load(state.trace);
}

/* ---------- Hiển thị một bước ---------- */

function onStepChange(index) {
  const step = state.trace[index];
  const total = state.trace.length;

  dom.btnPlay.textContent = player.playing ? '⏸ Tạm dừng' : '▶ Tự chạy';
  for (const b of [dom.btnFirst, dom.btnPrev, dom.btnPlay, dom.btnNext, dom.btnLast, dom.timeline]) {
    b.disabled = total === 0;
  }

  if (!step) {
    // Không có trace (ví dụ: lỗi cạnh âm) → về trạng thái trống
    renderer.reset();
    panels.highlightLine(dom.pseudo, null);
    dom.distTable.replaceChildren();
    dom.pq.replaceChildren();
    dom.counter.textContent = 'Bước 0 / 0';
    dom.stepType.hidden = true;
    dom.stepMessage.textContent = 'Chưa có bước nào để hiển thị.';
    dom.output.textContent = '';
    return;
  }

  const { input } = state;
  renderer.show(step);
  panels.highlightLine(dom.pseudo, step.line, step.type);
  panels.renderDistTable(dom.distTable, step, input.n, input.s, input.t);
  panels.renderQueue(dom.pq, step);
  panels.updateLog(dom.log, index);

  dom.stepType.hidden = false;
  dom.stepType.textContent = panels.TYPE_LABELS[step.type] ?? step.type;
  dom.stepType.className = `badge t-${step.type}`;
  dom.stepMessage.textContent = step.message;

  dom.counter.textContent = `Bước ${index + 1} / ${total}`;
  dom.timeline.value = index;
  dom.btnPrev.disabled = dom.btnFirst.disabled = index === 0;
  dom.btnNext.disabled = dom.btnLast.disabled = index === total - 1;

  dom.output.textContent = index === total - 1
    ? state.outputText
    : '(Chạy tới bước cuối để xem output)';
  dom.output.classList.toggle('pending', index !== total - 1);
}

/* ---------- Sự kiện ---------- */

function loadSample(i) {
  const sample = SAMPLES[i];
  dom.input.value = sample.text;
  dom.undirected.checked = !sample.directed;
  run();
}

function manual(action) {
  return () => {
    player.pause();
    action();
  };
}

function setupEvents() {
  dom.sample.replaceChildren(
    ...SAMPLES.map((s, i) => new Option(s.name, String(i)))
  );
  dom.sample.addEventListener('change', () => loadSample(Number(dom.sample.value)));

  dom.run.addEventListener('click', run);
  dom.undirected.addEventListener('change', run);
  dom.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      run();
    }
  });

  dom.btnFirst.addEventListener('click', manual(() => player.first()));
  dom.btnPrev.addEventListener('click', manual(() => player.prev()));
  dom.btnNext.addEventListener('click', manual(() => player.next()));
  dom.btnLast.addEventListener('click', manual(() => player.last()));
  dom.btnPlay.addEventListener('click', () => player.toggle());
  dom.timeline.addEventListener('input', manual(() => player.goto(Number(dom.timeline.value))));

  // Thanh tốc độ: 1 (chậm) … 10 (nhanh)
  const applySpeed = () => player.setDelay(2100 - Number(dom.speed.value) * 200);
  dom.speed.addEventListener('input', applySpeed);
  applySpeed();

  $('btn-layout').addEventListener('click', () => renderer.nextLayout());
  $('btn-fit').addEventListener('click', () => renderer.fit());
  window.addEventListener('resize', () => renderer.resize());

  // Phím tắt: ← → Space Home End (không áp dụng khi đang gõ trong ô input)
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;
    const actions = {
      ArrowRight: manual(() => player.next()),
      ArrowLeft: manual(() => player.prev()),
      Home: manual(() => player.first()),
      End: manual(() => player.last()),
      ' ': () => player.toggle(),
    };
    if (actions[e.key]) {
      e.preventDefault();
      actions[e.key]();
    }
  });
}

panels.renderPseudoCode(dom.pseudo, PSEUDO_CODE);
setupEvents();
loadSample(0);
