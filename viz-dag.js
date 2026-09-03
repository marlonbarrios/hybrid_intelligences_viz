(function () {
  const {
    RELATION_TYPE_ORDER, RELATION_TYPES, VERB_COLORS, RING_COLORS,
    escapeHtml, layerTyped,
  } = HIGraph;

  let graph = null;
  let verb = "enables";
  let selected = null;
  let hovered = null;

  function triples() {
    return graph.typed.filter((t) => t.type === verb);
  }

  function syncHash() {
    const url = new URL(location.href);
    url.hash = verb === "enables" ? "" : verb;
    history.replaceState(null, "", url);
  }

  function renderPanel() {
    const panel = document.getElementById("panel");
    const rows = triples();
    const focusId = hovered || selected;
    const focus = focusId ? graph.conceptById[focusId] : null;
    const meta = RELATION_TYPES[verb];

    const verbList = RELATION_TYPE_ORDER.map((type) => {
      const n = graph.typed.filter((t) => t.type === type).length;
      return `<li><button type="button" data-verb="${type}" class="${verb === type ? "active" : ""}">
        <span class="swatch" style="background:${VERB_COLORS[type]}"></span>
        ${escapeHtml(RELATION_TYPES[type].label)}
        <span class="count">${n}</span>
      </button></li>`;
    }).join("");

    let detail = "";
    if (focus) {
      const out = rows.filter((t) => t.source === focus.id);
      const inn = rows.filter((t) => t.target === focus.id);
      const lines = [
        ...out.map((t) => `<li><button type="button" data-select="${t.target}"><span class="verb">${escapeHtml(meta.verb)}</span> ${escapeHtml(graph.conceptById[t.target].label)}</button></li>`),
        ...inn.map((t) => `<li><button type="button" data-select="${t.source}"><span class="verb">${escapeHtml(meta.inverse)}</span> ${escapeHtml(graph.conceptById[t.source].label)}</button></li>`),
      ].join("");
      detail = `
        <div class="detail">
          <h3>${escapeHtml(focus.label)}</h3>
          <div class="meta">${escapeHtml(graph.categories[focus.category]?.label || focus.category)}</div>
          <p>${escapeHtml(focus.definition)}</p>
          <div class="actions">
            ${HIGraph.viewLinksHtml(focus, { typed: graph.typed, current: "dag" })}
          </div>
        </div>
        <h2>This verb</h2>
        <ul class="hop-list">${lines || "<li class='hint'>No incident assertions.</li>"}</ul>`;
    }

    panel.innerHTML = `
      <p class="stats">${rows.length} ${escapeHtml(meta.verb)} assertions · ${new Set(rows.flatMap((t) => [t.source, t.target])).size} concepts</p>
      <p class="hint">Pick a verb. Nodes are layered from source to target. Hash: dag.html#emergesFrom</p>
      <h2>Verb</h2>
      <ul class="filter-list">${verbList}</ul>
      ${detail}`;

    panel.querySelectorAll("[data-verb]").forEach((btn) => {
      btn.addEventListener("click", () => {
        verb = btn.dataset.verb;
        selected = null;
        syncHash();
        draw();
        renderPanel();
      });
    });
    panel.querySelectorAll("[data-select]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selected = btn.dataset.select;
        draw();
        renderPanel();
      });
    });
  }

  function draw() {
    const stage = document.getElementById("stage");
    const rows = triples();
    const w = stage.clientWidth || 800;
    const h = Math.max(stage.clientHeight || 0, 560);

    if (!rows.length) {
      stage.innerHTML = `<p class="stage-empty">No assertions for ${escapeHtml(RELATION_TYPES[verb].label)}.</p>`;
      return;
    }

    const laid = layerTyped(rows);
    const cols = laid.columns;
    const padX = 28;
    const padY = 36;
    const colW = (w - padX * 2) / Math.max(cols.length, 1);
    const boxW = Math.min(168, colW - 28);
    const boxH = 36;
    const pos = {};

    cols.forEach((col, i) => {
      const usable = h - padY * 2;
      col.forEach((id, k) => {
        const t = col.length === 1 ? 0.5 : k / (col.length - 1);
        pos[id] = {
          x: padX + i * colW + (colW - boxW) / 2,
          y: padY + t * Math.max(usable - boxH, 0),
          id,
        };
      });
    });

    const focus = hovered || selected;
    const color = VERB_COLORS[verb];

    const edges = rows
      .map((t) => {
        const a = pos[t.source];
        const b = pos[t.target];
        if (!a || !b) return "";
        const on = !focus || focus === t.source || focus === t.target;
        const x1 = a.x + boxW;
        const y1 = a.y + boxH / 2;
        const x2 = b.x;
        const y2 = b.y + boxH / 2;
        const c = Math.max(24, (x2 - x1) * 0.45);
        const d = `M${x1},${y1} C${x1 + c},${y1} ${x2 - c},${y2} ${x2},${y2}`;
        return `<path class="dag-edge" data-a="${t.source}" data-b="${t.target}" d="${d}" fill="none" stroke="${color}" stroke-width="${on ? 1.7 : 0.7}" stroke-opacity="${on ? 0.9 : 0.1}" marker-end="${on ? "url(#arrow)" : ""}"/>`;
      })
      .join("");

    const nodes = laid.nodes
      .map((id) => {
        const n = graph.conceptById[id];
        const p = pos[id];
        const on = !focus || focus === id;
        const label = n.label.length > 26 ? n.label.slice(0, 24) + "…" : n.label;
        return `<g class="dag-node" data-id="${id}" style="cursor:pointer">
          <rect x="${p.x}" y="${p.y}" width="${boxW}" height="${boxH}" rx="7" fill="var(--panel)" stroke="${RING_COLORS[n.category]}" stroke-opacity="${on ? 1 : 0.25}" stroke-width="1.4"/>
          <text x="${p.x + boxW / 2}" y="${p.y + boxH / 2 + 1}" text-anchor="middle" dominant-baseline="middle" fill="${on ? "var(--text)" : "var(--muted)"}" font-family="IBM Plex Sans, sans-serif" font-size="11">${escapeHtml(label)}</text>
        </g>`;
      })
      .join("");

    stage.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Layered graph of ${RELATION_TYPES[verb].label}">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/>
        </marker>
      </defs>
      ${edges}${nodes}
    </svg>`;

    function applyFocus() {
      const focus = hovered || selected;
      stage.querySelectorAll(".dag-edge").forEach((el) => {
        const on = !focus || focus === el.dataset.a || focus === el.dataset.b;
        el.setAttribute("stroke-width", on ? "1.7" : "0.7");
        el.setAttribute("stroke-opacity", on ? "0.9" : "0.1");
        el.setAttribute("marker-end", on ? "url(#arrow)" : "");
      });
      stage.querySelectorAll(".dag-node").forEach((el) => {
        const on = !focus || focus === el.dataset.id;
        const rect = el.querySelector("rect");
        const text = el.querySelector("text");
        if (rect) rect.setAttribute("stroke-opacity", on ? "1" : "0.25");
        if (text) text.setAttribute("fill", on ? "var(--text)" : "var(--muted)");
      });
    }

    stage.querySelectorAll(".dag-node").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        hovered = el.dataset.id;
        applyFocus();
        renderPanel();
      });
      el.addEventListener("mouseleave", () => {
        hovered = null;
        applyFocus();
        renderPanel();
      });
      el.addEventListener("click", () => {
        selected = selected === el.dataset.id ? null : el.dataset.id;
        applyFocus();
        renderPanel();
      });
    });
  }

  function readHash() {
    const raw = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (!raw) return;
    const [head, tail] = raw.split("/");
    if (RELATION_TYPES[head]) {
      verb = head;
      if (tail && graph.conceptById[tail]) selected = tail;
    } else if (graph.conceptById[head]) {
      selected = head;
      const hit = graph.typed.find((t) => t.source === head || t.target === head);
      if (hit) verb = hit.type;
    }
  }

  async function init() {
    HIGraph.initTheme();
    try {
      graph = await HIGraph.load();
      readHash();
      renderPanel();
      draw();
      window.addEventListener("resize", draw);
      window.addEventListener("hi-theme", draw);
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          selected = null;
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
