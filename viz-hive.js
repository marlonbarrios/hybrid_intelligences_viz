(function () {
  const {
    HIVE_AXES, HIVE_VERBS, RELATION_TYPE_ORDER, RELATION_TYPES,
    VERB_COLORS, RING_COLORS, escapeHtml, axisOf,
  } = HIGraph;

  let graph = null;
  let verbs = new Set(HIVE_VERBS);
  let selected = null;
  let hovered = null;

  function activeTriples() {
    return graph.typed.filter((t) => {
      if (!verbs.has(t.type)) return false;
      const a = graph.conceptById[t.source];
      const b = graph.conceptById[t.target];
      return a && b && axisOf(a.category) && axisOf(b.category);
    });
  }

  function omittedCount() {
    return graph.typed.filter((t) => {
      if (!verbs.has(t.type)) return false;
      const a = graph.conceptById[t.source];
      const b = graph.conceptById[t.target];
      if (!a || !b) return true;
      return !axisOf(a.category) || !axisOf(b.category);
    }).length;
  }

  function nodesOnAxes(triples) {
    const ids = new Set();
    for (const t of triples) {
      ids.add(t.source);
      ids.add(t.target);
    }
    const byAxis = { author: [], model: [], practice: [] };
    for (const id of ids) {
      const c = graph.conceptById[id];
      const ax = axisOf(c.category);
      if (ax) byAxis[ax].push(c);
    }
    for (const ax of HIVE_AXES) {
      byAxis[ax.id].sort((a, b) => (b.weight || 0) - (a.weight || 0) || a.label.localeCompare(b.label));
    }
    return byAxis;
  }

  function syncHash() {
    const url = new URL(location.href);
    const parts = [...verbs];
    url.hash = parts.length && parts.join(",") !== HIVE_VERBS.join(",") ? parts.join(",") : "";
    history.replaceState(null, "", url);
  }

  function renderPanel() {
    const panel = document.getElementById("panel");
    const triples = activeTriples();
    const omit = omittedCount();
    const focusId = hovered || selected;
    const focus = focusId ? graph.conceptById[focusId] : null;

    const verbList = RELATION_TYPE_ORDER.map((type) => {
      const n = graph.typed.filter((t) => t.type === type).length;
      const on = verbs.has(type);
      const hive = HIVE_VERBS.includes(type);
      return `<li><button type="button" data-verb="${type}" class="${on ? "active" : ""} ${hive ? "" : ""}">
        <span class="swatch" style="background:${VERB_COLORS[type]}"></span>
        ${escapeHtml(RELATION_TYPES[type].label)}
        <span class="count">${n}</span>
      </button></li>`;
    }).join("");

    let detail = "";
    if (focus) {
      const incident = triples.filter((t) => t.source === focus.id || t.target === focus.id);
      const lines = incident
        .map((t) => {
          const other = t.source === focus.id ? t.target : t.source;
          const verb = t.source === focus.id ? RELATION_TYPES[t.type].verb : RELATION_TYPES[t.type].inverse;
          return `<li><button type="button" data-select="${other}"><span class="verb">${escapeHtml(verb)}</span> ${escapeHtml(graph.conceptById[other].label)}</button></li>`;
        })
        .join("");
      detail = `
        <div class="detail">
          <h3>${escapeHtml(focus.label)}</h3>
          <div class="meta">${escapeHtml(graph.categories[focus.category]?.label || focus.category)}</div>
          <p>${escapeHtml(focus.definition)}</p>
          <div class="actions">
            ${HIGraph.viewLinksHtml(focus, { typed: graph.typed, current: "hive" })}
          </div>
        </div>
        <h2>On this hive</h2>
        <ul class="hop-list">${lines || "<li class='hint'>No selected-verb ties on these axes.</li>"}</ul>`;
    }

    panel.innerHTML = `
      <p class="stats">${triples.length} trails on the hive${omit ? ` · ${omit} omitted (outside these rings)` : ""}</p>
      <p class="hint">Default verbs are proposes, develops, instantiates, enacts. Click a verb to toggle.</p>
      <h2>Verbs</h2>
      <ul class="filter-list">${verbList}</ul>
      ${detail}`;

    panel.querySelectorAll("[data-verb]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.verb;
        if (verbs.has(type)) {
          if (verbs.size === 1) return;
          verbs.delete(type);
        } else {
          verbs.add(type);
        }
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
    const triples = activeTriples();
    const byAxis = nodesOnAxes(triples);
    const w = stage.clientWidth || 800;
    const h = Math.max(stage.clientHeight || 0, 560);
    const padT = 56;
    const padB = 28;
    const xs = HIVE_AXES.map((_, i) => w * (0.18 + i * 0.32));
    const pos = {};

    HIVE_AXES.forEach((ax, i) => {
      const nodes = byAxis[ax.id];
      const usable = h - padT - padB;
      nodes.forEach((n, k) => {
        const t = nodes.length === 1 ? 0.5 : k / (nodes.length - 1);
        pos[n.id] = { x: xs[i], y: padT + t * usable, axis: ax.id, node: n };
      });
    });

    const focus = hovered || selected;
    const edges = triples
      .map((t) => {
        const a = pos[t.source];
        const b = pos[t.target];
        if (!a || !b) return "";
        const on = !focus || focus === t.source || focus === t.target;
        const midX = (a.x + b.x) / 2;
        const bow = a.axis === b.axis ? 36 : 0;
        const c1x = a.x + (midX - a.x) * 0.5;
        const c2x = b.x - (b.x - midX) * 0.5;
        const d = `M${a.x},${a.y} C${c1x},${a.y - bow} ${c2x},${b.y - bow} ${b.x},${b.y}`;
        return `<path class="hive-edge" data-a="${t.source}" data-b="${t.target}" d="${d}" fill="none" stroke="${VERB_COLORS[t.type]}" stroke-width="${on ? 1.6 : 0.7}" stroke-opacity="${on ? 0.85 : 0.08}" />`;
      })
      .join("");

    const axes = HIVE_AXES.map((ax, i) => {
      return `<line x1="${xs[i]}" y1="${padT - 10}" x2="${xs[i]}" y2="${h - padB + 8}" stroke="var(--border)" stroke-width="1"/>
        <text x="${xs[i]}" y="28" text-anchor="middle" fill="var(--title)" font-family="IBM Plex Mono, monospace" font-size="11">${escapeHtml(ax.label)}</text>`;
    }).join("");

    const nodes = Object.values(pos)
      .map((p) => {
        const on = !focus || focus === p.node.id;
        const color = RING_COLORS[p.node.category] || "#999";
        const label = p.node.label.length > 28 ? p.node.label.slice(0, 26) + "…" : p.node.label;
        const anchor = p.axis === "author" ? "end" : p.axis === "practice" ? "start" : "middle";
        const lx = p.axis === "author" ? p.x - 10 : p.axis === "practice" ? p.x + 10 : p.x;
        const ly = p.axis === "model" ? p.y - 10 : p.y + 4;
        return `<g class="hive-node" data-id="${p.node.id}" style="cursor:pointer">
          <circle cx="${p.x}" cy="${p.y}" r="14" fill="transparent"/>
          <circle cx="${p.x}" cy="${p.y}" r="${on ? 5.5 : 4}" fill="${color}" fill-opacity="${on ? 1 : 0.25}" stroke="var(--bg)" stroke-width="1"/>
          <text x="${lx}" y="${ly}" text-anchor="${anchor}" fill="${on ? "var(--text)" : "var(--muted)"}" font-family="IBM Plex Sans, sans-serif" font-size="11">${escapeHtml(label)}</text>
        </g>`;
      })
      .join("");

    stage.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Hive plot of authors, models, and practices">${axes}${edges}${nodes}</svg>`;

    function applyFocus() {
      const focus = hovered || selected;
      stage.querySelectorAll(".hive-edge").forEach((el) => {
        const on = !focus || focus === el.dataset.a || focus === el.dataset.b;
        el.setAttribute("stroke-width", on ? "1.6" : "0.7");
        el.setAttribute("stroke-opacity", on ? "0.85" : "0.08");
      });
      stage.querySelectorAll(".hive-node").forEach((el) => {
        const on = !focus || focus === el.dataset.id;
        const circle = el.querySelector("circle:last-of-type");
        const text = el.querySelector("text");
        if (circle) {
          circle.setAttribute("r", on ? "5.5" : "4");
          circle.setAttribute("fill-opacity", on ? "1" : "0.25");
        }
        if (text) text.setAttribute("fill", on ? "var(--text)" : "var(--muted)");
      });
    }

    stage.querySelectorAll(".hive-node").forEach((el) => {
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

  function ensureNodeVisible(id) {
    const c = graph.conceptById[id];
    if (!c || !axisOf(c.category)) return;
    const useful = graph.typed.filter((t) => {
      if (t.source !== id && t.target !== id) return false;
      const other = graph.conceptById[t.source === id ? t.target : t.source];
      return other && axisOf(other.category);
    });
    if (!useful.length) return;
    if (!useful.some((t) => verbs.has(t.type))) {
      useful.forEach((t) => verbs.add(t.type));
    }
  }

  function readHash() {
    const raw = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (!raw) return;
    let verbStr = raw;
    let nodeId = null;
    const nodeAt = raw.indexOf("node/");
    if (nodeAt >= 0) {
      nodeId = raw.slice(nodeAt + 5).split(/[&,]/)[0];
      verbStr = raw.slice(0, nodeAt).replace(/[&,]+$/, "");
    }
    const parts = verbStr.split(",").filter((t) => RELATION_TYPES[t]);
    if (parts.length) verbs = new Set(parts);
    if (nodeId && graph.conceptById[nodeId]) {
      selected = nodeId;
      ensureNodeVisible(nodeId);
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
