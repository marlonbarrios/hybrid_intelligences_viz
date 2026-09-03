(function () {
  const { RING_ORDER, RING_COLORS, CATEGORY_DEFS, escapeHtml, ringMatrix } = HIGraph;

  let graph = null;
  let matrix = null;
  let selected = null;
  let hovered = null;

  function catLabel(id) {
    return graph.categories[id]?.label || CATEGORY_DEFS[id]?.label || id;
  }

  function nodeCount(cat) {
    return graph.concepts.filter((c) => c.category === cat).length;
  }

  function partners(catIndex) {
    const rows = [];
    for (let j = 0; j < RING_ORDER.length; j++) {
      const n = matrix.count[catIndex][j];
      if (!n) continue;
      rows.push({
        id: RING_ORDER[j],
        label: catLabel(RING_ORDER[j]),
        count: n,
        within: j === catIndex,
      });
    }
    rows.sort((a, b) => b.count - a.count);
    return rows;
  }

  function syncHash() {
    const url = new URL(location.href);
    url.hash = selected ? selected : "";
    history.replaceState(null, "", url);
  }

  function renderPanel() {
    const panel = document.getElementById("panel");
    const focus = hovered || selected;
    const idx = focus ? RING_ORDER.indexOf(focus) : -1;
    const rows = idx >= 0 ? partners(idx) : [];
    const between = graph.edges.length;
    const withinTotal = RING_ORDER.reduce((n, _, i) => n + matrix.count[i][i], 0);

    let detail = "";
    if (focus && idx >= 0) {
      const parts = rows
        .map((r) => {
          const href = r.within ? `network.html#cat/${r.id}` : `network.html#cat/${focus}`;
          return `<li><a href="${href}">${escapeHtml(r.label)}${r.within ? " (within)" : ""}</a><span class="count">${r.count}</span></li>`;
        })
        .join("");
      detail = `
        <div class="detail">
          <h3>${escapeHtml(catLabel(focus))}</h3>
          <div class="meta">${nodeCount(focus)} concepts</div>
          <p>Incident weighted ties, collapsed to rings.</p>
          <div class="actions">
            <a href="network.html#cat/${focus}">View in network ↗</a>
            <a href="ontology.html#cat/${focus}">View in ontology ↗</a>
            <a href="hive.html">View in hive ↗</a>
            <a href="dag.html">View in layered DAG ↗</a>
            <a href="path.html">View in path walker ↗</a>
          </div>
        </div>
        <h2>Partners</h2>
        <ul class="pair-list">${parts}</ul>`;
    }

    const list = RING_ORDER.map((id) => {
      const i = RING_ORDER.indexOf(id);
      const incident = matrix.count[i].reduce((a, b) => a + b, 0);
      const active = selected === id ? "active" : "";
      return `<li><button type="button" data-cat="${id}" class="${active}">
        <span class="swatch" style="background:${RING_COLORS[id]}"></span>
        ${escapeHtml(catLabel(id))}
        <span class="count">${incident}</span>
      </button></li>`;
    }).join("");

    panel.innerHTML = `
      <p class="stats">${between} unique ties · ${withinTotal} within a ring</p>
      <p class="hint">Hover a ribbon or a ring. Click a category to pin it. Esc clears.</p>
      <h2>Rings</h2>
      <ul class="filter-list">${list}</ul>
      ${detail}`;

    panel.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selected = selected === btn.dataset.cat ? null : btn.dataset.cat;
        syncHash();
        draw();
        renderPanel();
      });
    });
  }

  function polar(cx, cy, r, a) {
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  function ribbonPath(cx, cy, r, a0, a1, b0, b1) {
    const [x0, y0] = polar(cx, cy, r, a0);
    const [x1, y1] = polar(cx, cy, r, a1);
    const [x2, y2] = polar(cx, cy, r, b0);
    const [x3, y3] = polar(cx, cy, r, b1);
    const sweepA = a1 > a0 ? 1 : 0;
    const sweepB = b1 > b0 ? 1 : 0;
    return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 0 ${sweepA} ${x1.toFixed(2)},${y1.toFixed(2)} Q${cx},${cy} ${x2.toFixed(2)},${y2.toFixed(2)} A${r},${r} 0 0 ${sweepB} ${x3.toFixed(2)},${y3.toFixed(2)} Q${cx},${cy} ${x0.toFixed(2)},${y0.toFixed(2)} Z`;
  }

  function layout() {
    const n = RING_ORDER.length;
    const flow = RING_ORDER.map((_, i) => matrix.count[i].reduce((a, b) => a + b, 0) || 1);
    const total = flow.reduce((a, b) => a + b, 0);
    const gap = 0.045;
    const usable = Math.PI * 2 - n * gap;
    const start = [];
    const end = [];
    let a = -Math.PI / 2;
    for (let i = 0; i < n; i++) {
      const span = (flow[i] / total) * usable;
      start[i] = a;
      end[i] = a + span;
      a = end[i] + gap;
    }

    const groups = RING_ORDER.map((_, i) => {
      const span = end[i] - start[i];
      const row = matrix.count[i];
      const rowSum = row.reduce((s, v) => s + v, 0) || 1;
      const g = [];
      let cursor = start[i];
      for (let j = 0; j < n; j++) {
        const sl = (row[j] / rowSum) * span;
        g.push({ a0: cursor, a1: cursor + sl });
        cursor += sl;
      }
      return g;
    });

    return { start, end, groups };
  }

  function draw() {
    const stage = document.getElementById("stage");
    const w = stage.clientWidth || 800;
    const h = Math.max(stage.clientHeight || 0, 520);
    const cx = w / 2;
    const cy = h / 2 + 8;
    const outer = Math.min(w, h) * 0.38;
    const inner = outer - 18;
    const { start, end, groups } = layout();
    const focus = hovered || selected;

    const ribbons = [];
    for (let i = 0; i < RING_ORDER.length; i++) {
      for (let j = i + 1; j < RING_ORDER.length; j++) {
        const n = matrix.count[i][j];
        if (!n) continue;
        const gij = groups[i][j];
        const gji = groups[j][i];
        const on = !focus || focus === RING_ORDER[i] || focus === RING_ORDER[j];
        ribbons.push({
          i, j, n,
          d: ribbonPath(cx, cy, inner, gij.a0, gij.a1, gji.a0, gji.a1),
          color: HIGraph.mixHex(RING_COLORS[RING_ORDER[i]], RING_COLORS[RING_ORDER[j]], 0.5),
          on,
        });
      }
    }
    ribbons.sort((a, b) => a.n - b.n);

    const arcs = RING_ORDER.map((id, i) => {
      const r = outer;
      const [x0, y0] = polar(cx, cy, r, start[i]);
      const [x1, y1] = polar(cx, cy, r, end[i]);
      const large = end[i] - start[i] > Math.PI ? 1 : 0;
      const mid = (start[i] + end[i]) / 2;
      const [lx, ly] = polar(cx, cy, r + 22, mid);
      return { id, i, d: `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}`, lx, ly, mid };
    });

    const ribbonSvg = ribbons
      .map((rb) => {
        const opacity = focus ? (rb.on ? 0.72 : 0.04) : 0.28;
        return `<path class="ribbon" data-a="${RING_ORDER[rb.i]}" data-b="${RING_ORDER[rb.j]}" d="${rb.d}" fill="${rb.color}" fill-opacity="${opacity}" stroke="none" style="cursor:pointer"></path>`;
      })
      .join("");

    const arcSvg = arcs
      .map((arc) => {
        const on = !focus || focus === arc.id;
        return `<path class="arc" data-cat="${arc.id}" d="${arc.d}" fill="none" stroke="${RING_COLORS[arc.id]}" stroke-width="${on ? 14 : 8}" stroke-opacity="${on ? 1 : 0.25}" stroke-linecap="butt" style="cursor:pointer"></path>
          <text class="arc-label" data-cat="${arc.id}" x="${arc.lx}" y="${arc.ly}" text-anchor="middle" dominant-baseline="middle" fill="${on ? "var(--text)" : "var(--muted)"}" font-family="IBM Plex Mono, monospace" font-size="10">${escapeHtml(catLabel(arc.id))}</text>`;
      })
      .join("");

    stage.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Chord diagram of relations among thirteen ontology rings">${ribbonSvg}${arcSvg}</svg>`;

    function applyFocus() {
      const focus = hovered || selected;
      stage.querySelectorAll(".ribbon").forEach((el) => {
        const on = !focus || focus === el.dataset.a || focus === el.dataset.b;
        el.setAttribute("fill-opacity", focus ? (on ? "0.72" : "0.04") : "0.28");
      });
      stage.querySelectorAll(".arc").forEach((el) => {
        const on = !focus || focus === el.dataset.cat;
        el.setAttribute("stroke-width", on ? "14" : "8");
        el.setAttribute("stroke-opacity", on ? "1" : "0.25");
      });
      stage.querySelectorAll(".arc-label").forEach((el) => {
        const on = !focus || focus === el.dataset.cat;
        el.setAttribute("fill", on ? "var(--text)" : "var(--muted)");
      });
    }

    stage.querySelectorAll(".ribbon").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        hovered = el.dataset.a;
        applyFocus();
        renderPanel();
      });
      el.addEventListener("mouseleave", () => {
        hovered = null;
        applyFocus();
        renderPanel();
      });
      el.addEventListener("click", () => {
        selected = selected === el.dataset.a ? null : el.dataset.a;
        syncHash();
        applyFocus();
        renderPanel();
      });
    });
    stage.querySelectorAll(".arc").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        hovered = el.dataset.cat;
        applyFocus();
        renderPanel();
      });
      el.addEventListener("mouseleave", () => {
        hovered = null;
        applyFocus();
        renderPanel();
      });
      el.addEventListener("click", () => {
        selected = selected === el.dataset.cat ? null : el.dataset.cat;
        syncHash();
        applyFocus();
        renderPanel();
      });
    });
  }

  function readHash() {
    const raw = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (raw.startsWith("cat/")) {
      const id = raw.slice(4);
      if (RING_ORDER.includes(id)) selected = id;
    } else if (RING_ORDER.includes(raw)) {
      selected = raw;
    }
  }

  async function init() {
    HIGraph.initTheme();
    try {
      graph = await HIGraph.load();
      matrix = ringMatrix(graph);
      readHash();
      renderPanel();
      draw();
      window.addEventListener("resize", draw);
      window.addEventListener("hi-theme", draw);
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && selected) {
          selected = null;
          syncHash();
          draw();
          renderPanel();
        }
      });
    } catch (err) {
      document.getElementById("panel").innerHTML =
        `<p class="error">Could not load ontology.jsonld. Serve this folder over HTTP.<br>${escapeHtml(err.message)}</p>`;
    }
  }

  init();
})();
