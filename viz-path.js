(function () {
  const { RELATION_TYPES, VERB_COLORS, RING_COLORS, escapeHtml, hopsFrom } = HIGraph;

  const STARTERS = [
    { id: "body-ai-cognition", steps: ["body", "couplesWith", "ai", "mediates", "cognition"] },
    { id: "maturana-auto-enact", steps: ["maturana", "proposes", "autopoiesis", "enables", "enactivism"] },
    { id: "intelligence-coupling", steps: ["intelligence", "emergesFrom", "coupling"] },
    { id: "marlon-essay3-onto", steps: ["marlon", "proposes", "essay_3", "develops", "ontology_kb"] },
    { id: "hayles-assemblage", steps: ["hayles", "proposes", "assemblage", "emergesFrom", "coupling"] },
    { id: "enact-embodiment", steps: ["enact", "enacts", "embodiment"] },
  ];

  let graph = null;
  let trail = [];
  let starterId = STARTERS[0].id;

  function concept(id) {
    return graph.conceptById[id];
  }

  function parseSteps(steps) {
    const nodes = [];
    for (let i = 0; i < steps.length; i += 2) {
      const id = steps[i];
      const type = steps[i + 1] || null;
      if (!concept(id)) return null;
      nodes.push({ id, type: i === 0 ? null : steps[i - 1] });
    }
    return nodes;
  }

  function sentence() {
    const bits = [];
    for (let i = 0; i < trail.length; i++) {
      const n = concept(trail[i].id);
      if (i === 0) {
        bits.push(n.label);
      } else {
        const verb = RELATION_TYPES[trail[i].type]?.verb || trail[i].type;
        bits.push(verb);
        bits.push(n.label);
      }
    }
    if (!bits.length) return "";
    const s = bits[0] + bits.slice(1).reduce((acc, part, i) => {
      return acc + (i % 2 === 0 ? " " + part : " " + part);
    }, "");
    return s.charAt(0).toUpperCase() + s.slice(1) + ".";
  }

  function sentenceHtml() {
    if (!trail.length) return "";
    let html = `<strong>${escapeHtml(concept(trail[0].id).label)}</strong>`;
    for (let i = 1; i < trail.length; i++) {
      const verb = RELATION_TYPES[trail[i].type]?.verb || trail[i].type;
      html += ` <span class="verb">${escapeHtml(verb)}</span> <strong>${escapeHtml(concept(trail[i].id).label)}</strong>`;
    }
    return html + ".";
  }

  function hopsAtEnd() {
    if (!trail.length) return { out: [], inn: [] };
    const last = trail[trail.length - 1].id;
    const used = new Set(trail.map((s) => s.id));
    const { out, inn } = hopsFrom(graph, last);
    return {
      out: out.filter((t) => !used.has(t.target)),
      inn: inn.filter((t) => !used.has(t.source)),
    };
  }

  function encodeHash() {
    const parts = [];
    trail.forEach((step, i) => {
      if (i === 0) parts.push(step.id);
      else parts.push(step.type, step.id);
    });
    return parts.join(">");
  }

  function syncHash() {
    const url = new URL(location.href);
    url.hash = encodeHash();
    history.replaceState(null, "", url);
  }

  function applySteps(steps, id) {
    const parsed = parseSteps(steps);
    if (!parsed) return;
    trail = parsed;
    starterId = id || null;
    syncHash();
    renderPanel();
    draw();
  }

  function readHash() {
    const raw = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (!raw) {
      applySteps(STARTERS[0].steps, STARTERS[0].id);
      return;
    }
    const parts = raw.split(">").filter(Boolean);
    const parsed = parseSteps(parts);
    if (parsed) {
      trail = parsed;
      const match = STARTERS.find((s) => s.steps.join(">") === parts.join(">"));
      starterId = match ? match.id : null;
    } else {
      applySteps(STARTERS[0].steps, STARTERS[0].id);
    }
  }

  function starterLabel(steps) {
    const parsed = parseSteps(steps);
    if (!parsed) return steps.join(" ");
    return parsed.map((s, i) => {
      const name = concept(s.id).label;
      if (i === 0) return name;
      return RELATION_TYPES[s.type].verb + " " + name;
    }).join(" · ");
  }

  function renderPanel() {
    const panel = document.getElementById("panel");
    const last = trail[trail.length - 1];
    const hops = hopsAtEnd();
    const startBtns = STARTERS.map((s) => {
      if (!parseSteps(s.steps)) return "";
      return `<button type="button" data-starter="${s.id}" class="${starterId === s.id ? "active" : ""}">${escapeHtml(starterLabel(s.steps))}</button>`;
    }).join("");

    const outHtml = hops.out
      .map((t) => `<li><button type="button" data-hop-dir="out" data-hop-type="${t.type}" data-hop-id="${t.target}"><span class="verb">${escapeHtml(RELATION_TYPES[t.type].verb)}</span> ${escapeHtml(concept(t.target).label)}</button></li>`)
      .join("");
    const inHtml = hops.inn
      .map((t) => `<li><button type="button" data-hop-dir="in" data-hop-type="${t.type}" data-hop-id="${t.source}"><span class="verb">${escapeHtml(RELATION_TYPES[t.type].inverse)}</span> ${escapeHtml(concept(t.source).label)}</button></li>`)
      .join("");

    const typedIds = [...new Set(graph.typed.flatMap((t) => [t.source, t.target]))]
      .map((id) => concept(id))
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));

    const options = typedIds
      .map((c) => `<option value="${escapeHtml(c.label)}" data-id="${c.id}"></option>`)
      .join("");

    const n = last ? concept(last.id) : null;
    const detail = n
      ? `<div class="detail">
          <h3>${escapeHtml(n.label)}</h3>
          <div class="meta">${escapeHtml(graph.categories[n.category]?.label || n.category)}</div>
          <p>${escapeHtml(n.definition)}</p>
          <div class="actions">
            ${HIGraph.viewLinksHtml(n, { typed: graph.typed, current: "path" })}
          </div>
        </div>`
      : "";

    panel.innerHTML = `
      <p class="stats">${trail.length} concepts on this trail · ${graph.typed.length} typed hops in the seed</p>
      <p class="trail-sentence">${sentenceHtml()}</p>
      <h2>Starters</h2>
      <div class="starters">${startBtns}</div>
      <h2>Start from</h2>
      <input class="search" id="startSearch" list="concept-names" placeholder="A concept with a typed verb…">
      <datalist id="concept-names">${options}</datalist>
      ${detail}
      <h2>Continue</h2>
      <ul class="hop-list">${outHtml || inHtml ? outHtml + inHtml : "<li class='hint'>No unused typed hops from here. Choose another starter.</li>"}</ul>
      ${trail.length > 1 ? `<button type="button" class="theme-btn" id="popStep">Remove last hop</button>` : ""}`;

    panel.querySelectorAll("[data-starter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = STARTERS.find((x) => x.id === btn.dataset.starter);
        applySteps(s.steps, s.id);
      });
    });
    panel.querySelectorAll("[data-hop-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        trail = trail.concat([{ id: btn.dataset.hopId, type: btn.dataset.hopType }]);
        starterId = null;
        syncHash();
        renderPanel();
        draw();
      });
    });
    const pop = document.getElementById("popStep");
    if (pop) {
      pop.addEventListener("click", () => {
        if (trail.length > 1) {
          trail = trail.slice(0, -1);
          starterId = null;
          syncHash();
          renderPanel();
          draw();
        }
      });
    }
    const search = document.getElementById("startSearch");
    search.addEventListener("change", () => {
      const hit = typedIds.find((c) => c.label.toLowerCase() === search.value.trim().toLowerCase());
      if (hit) {
        trail = [{ id: hit.id, type: null }];
        starterId = null;
        syncHash();
        renderPanel();
        draw();
      }
    });
  }

  function draw() {
    const stage = document.getElementById("stage");
    const w = stage.clientWidth || 800;
    const h = Math.max(stage.clientHeight || 0, 420);
    const colW = 196;
    const rowH = 110;
    const cols = Math.max(1, Math.floor((w - 48) / colW));
    const boxW = 150;
    const boxH = 44;
    const rows = Math.max(1, Math.ceil(trail.length / cols));
    const usedW = Math.min(trail.length, cols) * colW;
    const originX = document.body.classList.contains("shot")
      ? Math.max(36, (w - usedW) / 2)
      : 36;
    const originY = document.body.classList.contains("shot")
      ? Math.max(48, (h - rows * rowH) / 2)
      : 48;

    const positions = trail.map((step, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        x: originX + col * colW,
        y: originY + row * rowH,
        step,
        i,
      };
    });

    const neededH = Math.max(h, 48 + Math.ceil(trail.length / cols) * rowH + 40);

    const links = [];
    for (let i = 1; i < positions.length; i++) {
      const a = positions[i - 1];
      const b = positions[i];
      const x1 = a.x + boxW;
      const y1 = a.y + boxH / 2;
      const x2 = b.x;
      const y2 = b.y + boxH / 2;
      const color = VERB_COLORS[b.step.type] || "var(--title)";
      const verb = RELATION_TYPES[b.step.type]?.verb || "";
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2 - (b.y === a.y ? 12 : 0);
      links.push(`<path d="M${x1},${y1} C${x1 + 28},${y1} ${x2 - 28},${y2} ${x2},${y2}" fill="none" stroke="${color}" stroke-width="1.6"/>
        <text x="${mx}" y="${my}" text-anchor="middle" fill="${color}" font-family="IBM Plex Mono, monospace" font-size="10">${escapeHtml(verb)}</text>`);
    }

    const nodes = positions
      .map((p) => {
        const n = concept(p.step.id);
        const label = n.label.length > 22 ? n.label.slice(0, 20) + "…" : n.label;
        return `<g>
          <rect x="${p.x}" y="${p.y}" width="${boxW}" height="${boxH}" rx="8" fill="var(--panel)" stroke="${RING_COLORS[n.category]}" stroke-width="1.5"/>
          <text x="${p.x + boxW / 2}" y="${p.y + boxH / 2 + 1}" text-anchor="middle" dominant-baseline="middle" fill="var(--text)" font-family="IBM Plex Sans, sans-serif" font-size="12">${escapeHtml(label)}</text>
        </g>`;
      })
      .join("");

    const hops = hopsAtEnd();
    const ghosts = [...hops.out.slice(0, 4), ...hops.inn.slice(0, 2)];
    let ghostSvg = "";
    if (trail.length && ghosts.length) {
      const last = positions[positions.length - 1];
      const gx = last.x;
      const gy = last.y + 78;
      ghostSvg = `<text x="${gx}" y="${gy - 18}" fill="var(--muted)" font-family="IBM Plex Mono, monospace" font-size="10">next hops</text>` +
        ghosts
          .map((t, i) => {
            const other = t.target === last.step.id ? t.source : t.target;
            const n = concept(other);
            const x = gx + (i % 3) * 160;
            const y = gy + Math.floor(i / 3) * 28;
            return `<text x="${x}" y="${y}" fill="var(--muted)" font-family="IBM Plex Sans, sans-serif" font-size="11">${escapeHtml(n.label)}</text>`;
          })
          .join("");
    }

    stage.innerHTML = `<svg viewBox="0 0 ${w} ${neededH}" width="${w}" height="${neededH}" role="img" aria-label="${escapeHtml(sentence())}">${links.join("")}${nodes}${ghostSvg}</svg>`;
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
    } catch (err) {
      document.getElementById("panel").innerHTML =
        `<p class="error">Could not load ontology.jsonld. Serve this folder over HTTP.<br>${escapeHtml(err.message)}</p>`;
    }
  }

  init();
})();
