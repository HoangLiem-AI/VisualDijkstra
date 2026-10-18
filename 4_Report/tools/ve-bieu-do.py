# ve-bieu-do.py — Vẽ biểu đồ benchmark từ 4_Report/so-lieu/benchmark.csv.
# Cách dùng (thư mục gốc dự án):  python 4_Report/tools/ve-bieu-do.py
# Kết quả: 4_Report/hinh/bd-thua.png, bd-day.png

import csv
import sys

sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
rows = list(csv.DictReader(open(ROOT / 'so-lieu' / 'benchmark.csv', encoding='utf-8')))

SERIES = [
    ('dijkstra-heap', 'Dijkstra (min-heap)', '#2563eb', 'o'),
    ('dijkstra-array', 'Dijkstra (mảng)', '#ea580c', 's'),
    ('bellman-ford', 'Bellman-Ford', '#16a34a', '^'),
]

plt.rcParams.update({'font.family': 'Times New Roman', 'font.size': 12})


def draw(family, title, out, log):
    data = [r for r in rows if r['ho_do_thi'] == family]
    fig, ax = plt.subplots(figsize=(7, 4.2), dpi=200)
    for key, label, color, marker in SERIES:
        pts = [(int(r['n']), float(r[key])) for r in data if r[key]]
        ax.plot([p[0] for p in pts], [p[1] for p in pts], marker=marker, color=color, label=label, linewidth=1.8)
    if log:
        ax.set_xscale('log')
        ax.set_yscale('log')
    ax.set_xlabel('Số đỉnh n')
    ax.set_ylabel('Thời gian (ms)' + (' — thang log' if log else ''))
    ax.set_title(title)
    ax.grid(True, which='both', alpha=0.3)
    ax.legend()
    fig.tight_layout()
    fig.savefig(ROOT / 'hinh' / out)
    print('Đã ghi', ROOT / 'hinh' / out)


draw('thua', 'Đồ thị thưa (m = 4n)', 'bd-thua.png', log=True)
draw('day', 'Đồ thị dày (m ≈ n²/2)', 'bd-day.png', log=False)
