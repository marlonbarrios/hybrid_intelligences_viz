/**
 * Shared ontology graph for the Views pages.
 * Loads ontology.jsonld — same source as the ontology browser.
 */
(function (global) {
  const RING_ORDER = [
    "program", "organization", "premise", "participant", "background", "facilitator",
    "practice", "tension", "quality", "phenomenon", "domain", "framework", "author",
  ];

  const RING_COLORS = {
    program: "#ffb860",
    organization: "#ff8c6e",
    premise: "#f4c430",
    participant: "#ffc48c",
    background: "#dca0aa",
    facilitator: "#78b2e4",
    practice: "#f09e60",
    tension: "#828a9e",
    quality: "#6ec682",
    phenomenon: "#a88ce4",
    domain: "#e48294",
    framework: "#4ec4c4",
    author: "#baa880",
  };

  const RELATION_TYPE_ORDER = [
    "couplesWith", "enables", "mediates", "cultivates", "constrains",
    "participatesIn", "critiques", "proposes", "instantiates",
    "develops", "enacts", "embodies", "emergesFrom",
  ];

  const RELATION_TYPES = {
    couplesWith:    { label: "couples with",    verb: "couples with",    inverse: "coupled with" },
    enables:        { label: "enables",         verb: "enables",         inverse: "enabled by" },
    mediates:       { label: "mediates",        verb: "mediates",        inverse: "mediated by" },
    cultivates:     { label: "cultivates",      verb: "cultivates",      inverse: "cultivated by" },
    constrains:     { label: "constrains",      verb: "constrains",      inverse: "constrained by" },
    participatesIn: { label: "participates in", verb: "participates in", inverse: "includes" },
    critiques:      { label: "critiques",       verb: "critiques",       inverse: "critiqued by" },
    proposes:       { label: "proposes",        verb: "proposes",        inverse: "proposed by" },
    instantiates:   { label: "instantiates",    verb: "instantiates",    inverse: "instantiated by" },
    develops:       { label: "develops",        verb: "develops",        inverse: "developed by" },
    enacts:         { label: "enacts",          verb: "enacts",          inverse: "enacted by" },
    embodies:       { label: "embodies",        verb: "embodies",        inverse: "embodied by" },
    emergesFrom:    { label: "emerges from",    verb: "emerges from",    inverse: "gives rise to" },
  };

  const VERB_COLORS = {
    couplesWith: "#f4c430",
    enables: "#4ec4c4",
    mediates: "#a88ce4",
    cultivates: "#6ec682",
    constrains: "#e48294",
    participatesIn: "#78b2e4",
    critiques: "#ff8c6e",
    proposes: "#baa880",
    instantiates: "#f09e60",
    develops: "#82c3ff",
    enacts: "#c9a227",
    embodies: "#dca0aa",
    emergesFrom: "#9aa3b8",
  };

  const CATEGORY_DEFS = {
    program:      { label: "Program" },
    organization: { label: "Organizations" },
    premise:      { label: "Framework" },
    participant:  { label: "Participants" },
    background:   { label: "Backgrounds" },
    facilitator:  { label: "Facilitators" },
    practice:     { label: "Practices" },
    tension:      { label: "Tensions" },
    quality:      { label: "Qualities" },
    phenomenon:   { label: "Phenomena" },
    domain:       { label: "Domains" },
    framework:    { label: "Conceptual Models" },
    author:       { label: "Authors/Artists" },
  };

  const HIVE_AXES = [
    { id: "author", label: "Authors / Artists", cats: ["author"] },
    { id: "model", label: "Conceptual Models", cats: ["premise", "framework"] },
    { id: "practice", label: "Practices", cats: ["practice"] },
  ];

  const HIVE_VERBS = ["proposes", "develops", "instantiates", "enacts"];

  function asList(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  function typesOf(entry) {
    const t = entry["@type"];
    return Array.isArray(t) ? t : t ? [t] : [];
  }

  function localId(uri) {
    if (!uri) return "";
    const hash = String(uri).split("#").pop();
    return hash.includes("/") ? hash.split("/").pop() : hash;
  }

  function categoryKeyFromUri(uri) {
    if (!uri) return "";
    const match = String(uri).match(/category\/([^/?#]+)/);
    return match ? match[1] : localId(uri);
  }

  function isCategoryEntry(entry) {
    const id = entry["@id"] || "";
    const types = typesOf(entry);
    return types.includes("hi:Category") || /category\//.test(id);
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }

  function mixHex(a, b, t) {
    const A = hexToRgb(a);
    const B = hexToRgb(b);
    const r = Math.round(A[0] + (B[0] - A[0]) * t);
    const g = Math.round(A[1] + (B[1] - A[1]) * t);
    const bch = Math.round(A[2] + (B[2] - A[2]) * t);
    return `rgb(${r},${g},${bch})`;
  }

  function parseOntology(data) {
    const graph = data["@graph"] || [];
    const categories = {};
    const concepts = [];
    const conceptById = {};
    const relatedById = {};
    let meta = {};

    for (const entry of graph) {
      const id = entry["@id"];
      const types = typesOf(entry);

      if (types.includes("owl:Ontology")) {
        meta = {
          label: entry["rdfs:label"] || entry["dc:title"],
          description: entry["dc:description"],
          nodeCount: entry["hi:nodeCount"],
          edgeCount: entry["hi:edgeCount"],
          typedEdgeCount: entry["hi:typedEdgeCount"],
          date: entry["dc:date"],
          modified: entry["dc:modified"] || entry.modified,
        };
        continue;
      }

      if (isCategoryEntry(entry)) {
        const catId = categoryKeyFromUri(id);
        categories[catId] = {
          id: catId,
          label: entry["skos:prefLabel"] || CATEGORY_DEFS[catId]?.label || catId,
        };
        continue;
      }

      if (types.includes("hi:NetworkNode") || entry["skos:definition"]) {
        const nodeId = localId(id);
        const broader = entry["skos:broader"];
        const broaderId = broader && (broader["@id"] || broader);
        const concept = {
          id: nodeId,
          label: entry["skos:prefLabel"] || nodeId,
          definition: entry["skos:definition"] || "",
          category: entry["hi:category"] || categoryKeyFromUri(broaderId),
          weight: entry["hi:weight"] ?? 1,
        };
        concepts.push(concept);
        conceptById[nodeId] = concept;
        relatedById[nodeId] = asList(entry["skos:related"]).map((r) => ({
          id: localId(r["@id"]),
          strength: r["hi:strength"] ?? null,
          relationType: r["hi:relationType"] || null,
        }));
      }
    }

    const pairSeen = new Set();
    const edges = [];
    const typed = [];
    const typedSeen = new Set();

    for (const c of concepts) {
      for (const r of relatedById[c.id] || []) {
        if (!conceptById[r.id]) continue;
        if (r.relationType && RELATION_TYPES[r.relationType]) {
          const key = `${c.id}>${r.relationType}>${r.id}`;
          if (!typedSeen.has(key)) {
            typedSeen.add(key);
            typed.push({ source: c.id, target: r.id, type: r.relationType });
          }
        }
        const a = c.id < r.id ? c.id : r.id;
        const b = c.id < r.id ? r.id : c.id;
        const pair = `${a}|${b}`;
        if (!pairSeen.has(pair)) {
          pairSeen.add(pair);
          edges.push({ a, b, strength: r.strength ?? 0.5 });
        }
      }
    }

    concepts.sort((a, b) => a.label.localeCompare(b.label));

    return {
      concepts,
      conceptById,
      categories,
      relatedById,
      edges,
      typed,
      meta,
    };
  }

  function ringMatrix(graph) {
    const n = RING_ORDER.length;
    const idx = Object.fromEntries(RING_ORDER.map((id, i) => [id, i]));
    const count = Array.from({ length: n }, () => Array(n).fill(0));
    const strength = Array.from({ length: n }, () => Array(n).fill(0));
    for (const e of graph.edges) {
      const ca = graph.conceptById[e.a]?.category;
      const cb = graph.conceptById[e.b]?.category;
      if (idx[ca] == null || idx[cb] == null) continue;
      const i = idx[ca];
      const j = idx[cb];
      count[i][j] += 1;
      strength[i][j] += e.strength || 0;
      if (i !== j) {
        count[j][i] += 1;
        strength[j][i] += e.strength || 0;
      }
    }
    return { count, strength, idx };
  }

  function axisOf(category) {
    for (const axis of HIVE_AXES) {
      if (axis.cats.includes(category)) return axis.id;
    }
    return null;
  }

  function hopsFrom(graph, id) {
    const out = [];
    const inn = [];
    for (const t of graph.typed) {
      if (t.source === id) out.push(t);
      if (t.target === id) inn.push(t);
    }
    return { out, inn };
  }

  function firstVerbFor(conceptId, typed) {
    const t = (typed || []).find((x) => x.source === conceptId || x.target === conceptId);
    return t ? t.type : null;
  }

  function viewHrefs(concept, typed) {
    const id = concept.id;
    const cat = concept.category;
    const verb = firstVerbFor(id, typed);
    return {
      network: `network.html#${id}`,
      chord: cat ? `chord.html#cat/${cat}` : "chord.html",
      hive: `hive.html#node/${id}`,
      dag: verb ? `dag.html#${verb}/${id}` : "dag.html",
      path: `path.html#${id}`,
      ontology: `ontology.html#${id}`,
    };
  }

  function viewLinksHtml(concept, opts) {
    const { typed = [], current = "" } = opts || {};
    const hrefs = viewHrefs(concept, typed);
    const items = [
      { key: "network", label: "View in network" },
      { key: "chord", label: "View in ring chord" },
      { key: "hive", label: "View in hive" },
      { key: "dag", label: "View in layered DAG" },
      { key: "path", label: "View in path walker" },
      { key: "ontology", label: "View in ontology" },
    ];
    return items
      .filter((item) => item.key !== current)
      .map((item) => `<a href="${hrefs[item.key]}">${item.label} ↗</a>`)
      .join("");
  }

  function layerTyped(triples) {
    const nodes = new Set();
    const outgoing = new Map();
    const incoming = new Map();
    for (const t of triples) {
      nodes.add(t.source);
      nodes.add(t.target);
      if (!outgoing.has(t.source)) outgoing.set(t.source, []);
      if (!incoming.has(t.target)) incoming.set(t.target, []);
      outgoing.get(t.source).push(t.target);
      incoming.get(t.target).push(t.source);
    }
    const indeg = new Map();
    for (const id of nodes) indeg.set(id, (incoming.get(id) || []).length);

    const remaining = new Set(nodes);
    const order = [];
    while (remaining.size) {
      let pick = null;
      let best = Infinity;
      for (const id of remaining) {
        const d = indeg.get(id) ?? 0;
        if (d < best) {
          best = d;
          pick = id;
        }
      }
      remaining.delete(pick);
      order.push(pick);
      for (const nxt of outgoing.get(pick) || []) {
        if (remaining.has(nxt)) indeg.set(nxt, Math.max(0, (indeg.get(nxt) || 0) - 1));
      }
    }

    const layer = new Map();
    for (const id of order) {
      let maxPred = -1;
      for (const pred of incoming.get(id) || []) {
        if (layer.has(pred)) maxPred = Math.max(maxPred, layer.get(pred));
      }
      layer.set(id, maxPred + 1);
    }
    let maxLayer = 0;
    for (const v of layer.values()) maxLayer = Math.max(maxLayer, v);
    const columns = Array.from({ length: maxLayer + 1 }, () => []);
    for (const id of nodes) columns[layer.get(id)].push(id);
    return { layer, columns, nodes: [...nodes] };
  }

  function applyTheme(mode) {
    document.body.classList.toggle("light-mode", mode === "light");
    localStorage.setItem("hi-theme", mode);
  }

  function initTheme() {
    const params = new URLSearchParams(location.search);
    if (params.has("shot")) document.body.classList.add("shot");
    const forced = params.get("theme");
    const saved = forced || localStorage.getItem("hi-theme");
    const mode = saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    applyTheme(mode);
    const btn = document.getElementById("themeBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        applyTheme(document.body.classList.contains("light-mode") ? "dark" : "light");
        window.dispatchEvent(new Event("hi-theme"));
      });
    }
  }

  let cache = null;

  async function load() {
    if (cache) return cache;
    const res = await fetch("ontology.jsonld");
    if (!res.ok) throw new Error("Could not load ontology.jsonld (" + res.status + ")");
    cache = parseOntology(await res.json());
    return cache;
  }

  global.HIGraph = {
    RING_ORDER,
    RING_COLORS,
    RELATION_TYPE_ORDER,
    RELATION_TYPES,
    VERB_COLORS,
    CATEGORY_DEFS,
    HIVE_AXES,
    HIVE_VERBS,
    escapeHtml,
    hexToRgb,
    mixHex,
    localId,
    axisOf,
    hopsFrom,
    firstVerbFor,
    viewHrefs,
    viewLinksHtml,
    layerTyped,
    ringMatrix,
    parseOntology,
    load,
    initTheme,
    applyTheme,
  };
})(window);
