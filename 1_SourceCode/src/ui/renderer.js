// renderer.js — Vẽ đồ thị bằng Cytoscape.js và tô màu theo một bước trace.
// Cytoscape được nạp qua thẻ <script> (CDN) nên dùng biến toàn cục window.cytoscape.

import { buildPath } from '../core/graph.js';

const fmt = (x) => (x === Infinity ? '∞' : String(x));

// Màu dùng chung với chú thích trong style.css
const C = {
  idle: '#e5e7eb', idleBorder: '#9ca3af',
  frontier: '#dbeafe', frontierBorder: '#3b82f6',
  finalized: '#bbf7d0', finalizedBorder: '#16a34a',
  current: '#fed7aa', currentBorder: '#ea580c',
  edge: '#a8b0bd', tree: '#3b82f6', ok: '#16a34a', fail: '#dc2626', path: '#7c3aed',
};

const STYLE = [
  {
    selector: 'node',
    style: {
      width: 50, height: 50,
      'background-color': C.idle,
      'border-width': 2, 'border-color': C.idleBorder,
      label: 'data(display)',
      'text-wrap': 'wrap', 'text-valign': 'center', 'text-halign': 'center',
      'font-size': 13, 'font-weight': 600, color: '#111827',
      'line-height': 1.15,
    },
  },
  { selector: 'node.source', style: { 'border-style': 'double', 'border-width': 6 } },
  { selector: 'node.target', style: { 'border-style': 'dashed', 'border-width': 3 } },
  { selector: 'node.frontier', style: { 'background-color': C.frontier, 'border-color': C.frontierBorder } },
  { selector: 'node.finalized', style: { 'background-color': C.finalized, 'border-color': C.finalizedBorder } },
  {
    selector: 'node.current',
    style: { 'background-color': C.current, 'border-color': C.currentBorder, 'border-width': 4, width: 58, height: 58 },
  },
  {
    selector: 'edge',
    style: {
      width: 2,
      'line-color': C.edge, 'target-arrow-color': C.edge,
      'target-arrow-shape': 'triangle', 'arrow-scale': 1.1,
      'curve-style': 'bezier',
      label: 'data(w)', 'font-size': 12, color: '#374151',
      'text-background-color': '#ffffff', 'text-background-opacity': 1, 'text-background-padding': 2,
      'text-background-shape': 'roundrectangle',
    },
  },
  { selector: 'edge.undirected', style: { 'target-arrow-shape': 'none' } },
  { selector: 'edge.tree', style: { width: 3.5, 'line-color': C.tree, 'target-arrow-color': C.tree } },
  { selector: 'edge.path', style: { width: 6, 'line-color': C.path, 'target-arrow-color': C.path, 'z-index': 9 } },
  {
    selector: 'edge.relax-ok',
    style: { width: 6, 'line-color': C.ok, 'target-arrow-color': C.ok, 'z-index': 10, color: C.ok },
  },
  {
    selector: 'edge.relax-fail',
    style: { width: 5, 'line-color': C.fail, 'target-arrow-color': C.fail, 'line-style': 'dashed', 'z-index': 10, color: C.fail },
  },
];

const LAYOUTS = ['breadthfirst', 'circle', 'cose'];

export class GraphRenderer {
  constructor(container) {
    this.cy = window.cytoscape({
      container,
      style: STYLE,
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    });
    this.layoutIndex = 0;
    this.treeEdge = new Map(); // "u-v" → id cạnh nhẹ nhất từ u tới v (để tô cây đường đi)
  }

  /** Vẽ đồ thị mới (chưa tô màu theo bước nào). */
  load(graph, s, t) {
    this.graph = graph;
    this.s = s;
    this.t = t;
    this.treeEdge.clear();

    const nodes = [];
    for (let i = 1; i <= graph.n; i++) {
      const classes = [i === s ? 'source' : '', i === t ? 'target' : ''].join(' ');
      nodes.push({ group: 'nodes', data: { id: `n${i}`, display: `${i}\n∞` }, classes });
    }

    const edges = graph.edges.map((e) => ({
      group: 'edges',
      data: { id: `e${e.id}`, source: `n${e.u}`, target: `n${e.v}`, w: e.w },
      classes: graph.directed ? '' : 'undirected',
    }));

    // Với cạnh song song, prev[v] = u ứng với cạnh nhẹ nhất u→v
    const remember = (u, v, e) => {
      const key = `${u}-${v}`;
      const old = this.treeEdge.get(key);
      if (old === undefined || graph.edges[old].w > e.w) this.treeEdge.set(key, e.id);
    };
    for (const e of graph.edges) {
      remember(e.u, e.v, e);
      if (!graph.directed) remember(e.v, e.u, e);
    }

    this.cy.elements().remove();
    this.cy.add([...nodes, ...edges]);
    this.layoutIndex = 0;
    this.runLayout();
  }

  /** Đổi sang kiểu bố cục kế tiếp (cây theo tầng → vòng tròn → lực đẩy). */
  nextLayout() {
    this.layoutIndex = (this.layoutIndex + 1) % LAYOUTS.length;
    this.runLayout();
  }

  runLayout() {
    const name = LAYOUTS[this.layoutIndex];
    const options = { name, padding: 30, animate: false, fit: true };
    if (name === 'breadthfirst') Object.assign(options, { roots: `#n${this.s}`, directed: true, spacingFactor: 1.15 });
    if (name === 'cose') Object.assign(options, { randomize: false, nodeRepulsion: 9000, idealEdgeLength: 90 });
    this.cy.layout(options).run();
  }

  fit() {
    this.cy.fit(undefined, 30);
  }

  resize() {
    this.cy.resize();
  }

  /** Tô màu đồ thị theo một bước trace. */
  show(step) {
    const { cy, graph } = this;
    cy.batch(() => {
      cy.elements().removeClass('frontier finalized current tree path relax-ok relax-fail');

      // Đỉnh: nhãn "số đỉnh / dist", màu theo trạng thái
      for (let i = 1; i <= graph.n; i++) {
        const node = cy.getElementById(`n${i}`);
        node.data('display', `${i}\n${fmt(step.dist[i])}`);
        if (step.finalized[i]) node.addClass('finalized');
        else if (step.dist[i] !== Infinity) node.addClass('frontier');
      }
      if (step.current !== null) cy.getElementById(`n${step.current}`).addClass('current');

      // Cạnh prev[v] → v: cây đường đi ngắn nhất hiện tại
      for (let v = 1; v <= graph.n; v++) {
        const u = step.prev[v];
        if (u === null) continue;
        const id = this.treeEdge.get(`${u}-${v}`);
        if (id !== undefined) cy.getElementById(`e${id}`).addClass('tree');
      }

      // Bước kết thúc: tô đường đi s → t
      if (step.type === 'done' && this.t !== null) {
        const path = buildPath(step.prev, step.dist, this.s, this.t) || [];
        for (let k = 0; k + 1 < path.length; k++) {
          const id = this.treeEdge.get(`${path[k]}-${path[k + 1]}`);
          if (id !== undefined) cy.getElementById(`e${id}`).addClass('path');
        }
      }

      // Cạnh đang xét
      if (step.edge) {
        const cls = step.type === 'relax-ok' ? 'relax-ok' : 'relax-fail';
        cy.getElementById(`e${step.edge.id}`).addClass(cls);
      }
    });
  }

  /** Về trạng thái chưa chạy: mọi đỉnh ∞, không tô màu. */
  reset() {
    this.cy.batch(() => {
      this.cy.elements().removeClass('frontier finalized current tree path relax-ok relax-fail');
      this.cy.nodes().forEach((node) => node.data('display', `${node.id().slice(1)}\n∞`));
    });
  }
}
