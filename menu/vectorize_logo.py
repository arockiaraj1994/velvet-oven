#!/usr/bin/env python3
"""Trace the white logo lockup into an inline SVG path.

The logo ships as a PNG with a soft glow baked into its alpha. Embedding that as
a base64 data URI works in Chrome but is blocked by some HTML preview sandboxes,
and it rasterises the mark. Marching squares over a thresholded alpha channel
gives a single vector path instead, which is both sandbox proof and crisp at any
print size.

Writes logo-lockup.svgpath (the "d" attribute) and logo-lockup.svg (a preview).
"""
import pathlib
from PIL import Image

SRC = "logo-lockup.png"
ALPHA_CUT = 128       # drops the glow, keeps the solid mark
EPSILON = 0.35         # Douglas-Peucker tolerance, in source pixels

img = Image.open(SRC).convert("RGBA")
W, H = img.size
alpha = img.split()[3].tobytes()

def solid(x, y):
    return alpha[y * W + x] > ALPHA_CUT

# ---- marching squares -> undirected graph of half-integer lattice points ----
# Cell (x, y) has corners (x,y) (x+1,y) (x+1,y+1) (x,y+1). Contour vertices sit
# on cell edge midpoints, stored doubled so they stay integral and hashable.
CASES = {
    1:  [("L", "B")],
    2:  [("B", "R")],
    3:  [("L", "R")],
    4:  [("T", "R")],
    5:  [("T", "L"), ("B", "R")],
    6:  [("T", "B")],
    7:  [("T", "L")],
    8:  [("T", "L")],
    9:  [("T", "B")],
    10: [("T", "R"), ("L", "B")],
    11: [("T", "R")],
    12: [("L", "R")],
    13: [("B", "R")],
    14: [("L", "B")],
}

adj = {}

def link(a, b):
    adj.setdefault(a, []).append(b)
    adj.setdefault(b, []).append(a)

for y in range(H - 1):
    row = y * W
    nxt = row + W
    for x in range(W - 1):
        case = ((alpha[row + x] > ALPHA_CUT) << 3) \
             | ((alpha[row + x + 1] > ALPHA_CUT) << 2) \
             | ((alpha[nxt + x + 1] > ALPHA_CUT) << 1) \
             | (alpha[nxt + x] > ALPHA_CUT)
        segs = CASES.get(case)
        if not segs:
            continue
        pt = {
            "T": (2 * x + 1, 2 * y),
            "R": (2 * x + 2, 2 * y + 1),
            "B": (2 * x + 1, 2 * y + 2),
            "L": (2 * x, 2 * y + 1),
        }
        for a, b in segs:
            link(pt[a], pt[b])

# ---- walk the graph into closed loops ----
loops = []
seen = set()
for start in adj:
    if start in seen:
        continue
    loop = []
    cur, prev = start, None
    while cur is not None and cur not in seen:
        seen.add(cur)
        loop.append(cur)
        nxt = None
        for cand in adj[cur]:
            if cand != prev and cand not in seen:
                nxt = cand
                break
        prev, cur = cur, nxt
    if len(loop) >= 8:
        loops.append(loop)

# ---- Douglas-Peucker ----
def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    ax, ay = pts[0]
    bx, by = pts[-1]
    dx, dy = bx - ax, by - ay
    norm = (dx * dx + dy * dy) ** 0.5
    worst, idx = -1.0, 0
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        if norm == 0:
            d = ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
        else:
            d = abs(dy * px - dx * py + bx * ay - by * ax) / norm
        if d > worst:
            worst, idx = d, i
    if worst <= eps:
        return [pts[0], pts[-1]]
    return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)

def fmt(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return s if s else "0"

parts = []
for loop in loops:
    pts = [(x / 2.0, y / 2.0) for x, y in loop]
    pts.append(pts[0])
    simple = rdp(pts, EPSILON)
    if len(simple) < 4:
        continue
    d = "M" + " ".join(f"{fmt(x)},{fmt(y)}" for x, y in simple[:-1]) + "Z"
    parts.append(d)

path = "".join(parts)
pathlib.Path("logo-lockup.svgpath").write_text(path)
pathlib.Path("logo-lockup.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">'
    f'<path fill="#f5f0e8" fill-rule="evenodd" d="{path}"/></svg>'
)
print(f"{len(loops)} loops, path {len(path)/1024:.1f} KB, viewBox 0 0 {W} {H}")
