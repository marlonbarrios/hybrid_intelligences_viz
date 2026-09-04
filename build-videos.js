#!/usr/bin/env node
/**
 * Video publishing workflow
 *
 * Edit videos.json, add transcript via ingest-video.js, then:
 *   node build-videos.js
 *
 * Generates videos.html (hub) and video-{id}.html for each entry.
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const MANIFEST = path.join(ROOT, "videos.json");

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
}

function loadTranscript(relPath) {
  if (!relPath) return null;
  const file = path.join(ROOT, relPath);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function sharedStyles() {
  return `    :root {
      --bg: #0e1018;
      --panel: #12141e;
      --border: #323848;
      --title: #f4c430;
      --text: #e8eaef;
      --muted: #969eb0;
      --link: #82c3ff;
      --hover: #1a1e2a;
      --accent: rgba(244, 196, 48, 0.12);
    }
    body.light-mode {
      --bg: #fffdf8;
      --panel: #ffffff;
      --border: #d2d6e0;
      --title: #a8760c;
      --text: #202430;
      --muted: #5a6070;
      --link: #125599;
      --hover: #f5f3ee;
      --accent: rgba(168, 118, 12, 0.1);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(ellipse 90% 55% at 12% -10%, rgba(244, 196, 48, 0.07), transparent 55%),
        radial-gradient(ellipse 70% 45% at 100% 0%, rgba(78, 196, 196, 0.05), transparent 50%),
        var(--bg);
      color: var(--text);
      font-family: "IBM Plex Sans", system-ui, sans-serif;
      line-height: 1.5;
    }
    a { color: var(--link); text-decoration: none; }
    a:hover { text-decoration: underline; }
    header {
      padding: 1.25rem 1.5rem 1rem;
      border-bottom: 1px solid var(--border);
      background: color-mix(in srgb, var(--panel) 88%, transparent);
      backdrop-filter: blur(8px);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    header .eyebrow {
      margin: 0 0 0.4rem;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }
    header h1 {
      margin: 0 0 0.45rem;
      font-family: "IBM Plex Mono", monospace;
      font-weight: 300;
      font-size: clamp(0.95rem, 2.4vw, 1.15rem);
      line-height: 1.4;
      color: var(--title);
      max-width: 48rem;
    }
    header .meta {
      margin: 0;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.78rem;
      color: var(--muted);
    }
    .brand-row { display: flex; align-items: flex-start; gap: 0.85rem; }
    .site-logo { flex-shrink: 0; display: block; line-height: 0; text-decoration: none; }
    .site-logo:hover { opacity: 0.88; text-decoration: none; }
    .site-logo img { display: block; height: 88px; width: auto; }
    .brand-copy { min-width: 0; }
    .header-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1.25rem;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.85rem;
    }
    .header-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1rem;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.78rem;
      align-items: center;
    }
    .header-links a { display: inline-flex; align-items: center; }
    .gh-icon {
      display: inline-block;
      width: 0.92em;
      height: 0.92em;
      margin-right: 0.28em;
      vertical-align: -0.12em;
      background: currentColor;
      -webkit-mask: url("github-mark.svg") center / contain no-repeat;
      mask: url("github-mark.svg") center / contain no-repeat;
    }
    .theme-btn {
      border: 1px solid var(--border);
      background: var(--panel);
      color: var(--muted);
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.72rem;
      padding: 0.35rem 0.55rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .theme-btn:hover { color: var(--title); border-color: var(--title); }
    main {
      max-width: 56rem;
      margin: 0 auto;
      padding: 1.75rem 1.5rem 3.5rem;
    }
    footer.page-foot {
      max-width: 56rem;
      margin: 0 auto;
      padding: 0 1.5rem 3rem;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.75rem;
      color: var(--muted);
    }`;
}

function headerNav() {
  const links = [
    ["index.html", "← Home"],
    ["about.html", "About"],
    ["essays.html", "Essays"],
    ["videos.html", "Videos"],
    ["ontology.html", "Ontology"],
    ["views.html", "Views"],
    ["voice.html", "Voice"],
    ["image.html", "Image"],
    ["mini-pod.html", "Mini-pod"],
    ["enact.html", "Enact"],
    ["creative-b.html", "Creative B"],
    ["scan-qr.html", "Scan QR Code"],
  ];
  const items = links.map(([href, label]) => `<a href="${href}">${label}</a>`).join("\n        ");
  return `      <div class="header-links">
        ${items}
        <a href="https://github.com/marlonbarrios/hybrid_intelligences_viz" target="_blank" rel="noopener noreferrer"><span class="gh-icon" aria-hidden="true"></span>GitHub ↗</a>
      </div>
      <button type="button" class="theme-btn" id="themeBtn" aria-label="Toggle theme">Theme</button>`;
}

function themeScript() {
  return `  <script>
    function applyTheme(mode) {
      document.body.classList.toggle("light-mode", mode === "light");
      localStorage.setItem("hi-theme", mode);
    }
    function initTheme() {
      const saved = localStorage.getItem("hi-theme");
      const mode = saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      applyTheme(mode);
      document.getElementById("themeBtn").addEventListener("click", () => {
        applyTheme(document.body.classList.contains("light-mode") ? "dark" : "light");
      });
    }
    initTheme();
  </script>`;
}

function networkNodeId(videoId) {
  return `video_${videoId.replace(/-/g, "_")}`;
}

/** Fallback ontology links when ingest has not matched concepts yet. */
const VIDEO_FALLBACK_CONCEPTS = {
  "hayles-integrated-cognition": [
    { conceptId: "hayles", label: "Katherine Hayles" },
    { conceptId: "assemblage", label: "Assemblage" },
    { conceptId: "posthumanism", label: "Posthumanism" },
    { conceptId: "llm", label: "LLM" },
    { conceptId: "coupling", label: "Coupling" },
  ],
  "hayles-bacteria-ai": [
    { conceptId: "hayles", label: "Katherine Hayles" },
    { conceptId: "assemblage", label: "Assemblage" },
    { conceptId: "umwelt", label: "Umwelt" },
    { conceptId: "llm", label: "LLM" },
    { conceptId: "symbiosis", label: "Symbiosis" },
  ],
  "clark-experience-machine": [
    { conceptId: "clark", label: "Andy Clark" },
    { conceptId: "active_inference", label: "Active Inference" },
    { conceptId: "friston", label: "Karl Friston" },
    { conceptId: "embodied", label: "Embodied" },
    { conceptId: "consciousness", label: "Consciousness" },
  ],
};

function videoConcepts(video, transcript) {
  if (transcript && transcript.matched && transcript.matched.length) {
    return transcript.matched.slice(0, 6);
  }
  return VIDEO_FALLBACK_CONCEPTS[video.id] || [];
}

function buildNetworkGraphData(videos) {
  const nodes = [
    {
      id: "hi_videos",
      label: "Videos",
      type: "hub",
      url: "videos.html",
    },
  ];
  const edges = [];
  const conceptSeen = new Set();

  for (const video of videos) {
    const nodeId = networkNodeId(video.id);
    const transcript = loadTranscript(video.transcript);
    const concepts = videoConcepts(video, transcript);
    const shortLabel = String(video.speaker || video.title)
      .split("—")[0]
      .trim()
      .split(" ")
      .slice(-1)[0];

    nodes.push({
      id: nodeId,
      label: shortLabel,
      fullLabel: video.title,
      type: "video",
      poster: video.poster || null,
      url: `video-${video.id}.html`,
      speaker: video.speaker || "",
    });
    edges.push({ source: "hi_videos", target: nodeId });

    for (const concept of concepts) {
      const cid = concept.conceptId;
      if (!conceptSeen.has(cid)) {
        conceptSeen.add(cid);
        nodes.push({
          id: cid,
          label: concept.label || cid.replace(/_/g, " "),
          type: "concept",
          url: `network.html#${cid}`,
        });
      }
      edges.push({ source: nodeId, target: cid });
    }
  }

  return { nodes, edges };
}

function networkVizScript(graphJson) {
  return `  <script>
    (function () {
      const graph = ${graphJson};
      const canvas = document.getElementById("videoNetworkCanvas");
      if (!canvas || !graph.nodes.length) return;

      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      let width = 0;
      let height = 0;
      let hovered = null;
      let images = {};
      let raf = 0;

      const THUMB_W = 92;
      const THUMB_H = Math.round(THUMB_W * 9 / 16);

      const palette = {
        hub: getComputedStyle(document.documentElement).getPropertyValue("--net-hub").trim() || "#f4c430",
        video: getComputedStyle(document.documentElement).getPropertyValue("--net-video").trim() || "#82c3ff",
        concept: getComputedStyle(document.documentElement).getPropertyValue("--net-concept").trim() || "#4ec4c4",
        edge: getComputedStyle(document.documentElement).getPropertyValue("--net-edge").trim() || "rgba(150,158,176,0.35)",
        text: getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#e8eaef",
      };

      function nodeRadius(node) {
        if (node.type === "hub") return 34;
        if (node.type === "concept") return 22;
        return 0;
      }

      function videoPad(node) {
        return hovered && hovered.id === node.id ? 3 : 0;
      }

      function videoRect(node) {
        const pad = videoPad(node);
        const w = THUMB_W + pad * 2;
        const h = THUMB_H + pad * 2;
        return {
          x: node.x - w / 2,
          y: node.y - h / 2,
          w,
          h,
          innerW: THUMB_W,
          innerH: THUMB_H,
          pad,
        };
      }

      function nodeHitRadius(node) {
        if (node.type === "video") {
          const rect = videoRect(node);
          return Math.max(rect.w, rect.h) / 2 + 4;
        }
        return nodeRadius(node) + 4;
      }

      function roundRect(x, y, w, h, rad) {
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, rad);
          return;
        }
        const r = Math.min(rad, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }

      function drawCoverImage(img, x, y, w, h) {
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        if (!iw || !ih) return;
        const ir = iw / ih;
        const tr = w / h;
        let sx = 0;
        let sy = 0;
        let sw = iw;
        let sh = ih;
        if (ir > tr) {
          sw = ih * tr;
          sx = (iw - sw) / 2;
        } else {
          sh = iw / tr;
          sy = (ih - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
      }

      function initLayout() {
        const hub = graph.nodes.find((n) => n.id === "hi_videos");
        if (hub) {
          hub.x = width / 2;
          hub.y = height / 2;
          hub.vx = 0;
          hub.vy = 0;
          hub.fixed = true;
        }
        const videos = graph.nodes.filter((n) => n.type === "video");
        const concepts = graph.nodes.filter((n) => n.type === "concept");
        videos.forEach((node, i) => {
          const angle = (i / videos.length) * Math.PI * 2 - Math.PI / 2;
          const r = Math.min(width, height) * 0.32;
          node.x = width / 2 + Math.cos(angle) * r;
          node.y = height / 2 + Math.sin(angle) * r;
          node.vx = 0;
          node.vy = 0;
        });
        concepts.forEach((node, i) => {
          const angle = (i / Math.max(concepts.length, 1)) * Math.PI * 2;
          const r = Math.min(width, height) * 0.47;
          node.x = width / 2 + Math.cos(angle) * r;
          node.y = height / 2 + Math.sin(angle) * r;
          node.vx = 0;
          node.vy = 0;
        });
      }

      function resize() {
        const rect = canvas.getBoundingClientRect();
        width = Math.max(rect.width, 320);
        height = Math.max(rect.height, 440);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initLayout();
      }

      function loadImages() {
        graph.nodes.filter((n) => n.poster).forEach((node) => {
          const img = new Image();
          img.src = node.poster;
          img.onload = () => { images[node.id] = img; draw(); };
          images[node.id] = img;
        });
      }

      function simulate() {
        const damping = 0.86;
        const repulsion = 5200;
        const spring = 0.018;
        const restHub = 145;
        const restVideoConcept = 115;

        for (let i = 0; i < graph.nodes.length; i++) {
          for (let j = i + 1; j < graph.nodes.length; j++) {
            const a = graph.nodes[i];
            const b = graph.nodes[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let dist = Math.hypot(dx, dy) || 0.01;
            const force = repulsion / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (!a.fixed) { a.vx -= fx; a.vy -= fy; }
            if (!b.fixed) { b.vx += fx; b.vy += fy; }
          }
        }

        graph.edges.forEach((edge) => {
          const a = graph.nodes.find((n) => n.id === edge.source);
          const b = graph.nodes.find((n) => n.id === edge.target);
          if (!a || !b) return;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          const rest = a.type === "hub" || b.type === "hub" ? restHub : restVideoConcept;
          const force = (dist - rest) * spring;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (!a.fixed) { a.vx += fx; a.vy += fy; }
          if (!b.fixed) { b.vx -= fx; b.vy -= fy; }
        });

        graph.nodes.forEach((node) => {
          if (node.fixed) return;
          node.vx *= damping;
          node.vy *= damping;
          node.x += node.vx;
          node.y += node.vy;
          const margin = node.type === "video"
            ? Math.max(THUMB_W, THUMB_H) / 2 + 16
            : nodeRadius(node) + 10;
          const labelRoom = node.type === "video" ? 28 : 18;
          node.x = Math.max(margin, Math.min(width - margin, node.x));
          node.y = Math.max(margin, Math.min(height - margin - labelRoom, node.y));
        });
      }

      function pickNode(x, y) {
        for (let i = graph.nodes.length - 1; i >= 0; i--) {
          const node = graph.nodes[i];
          if (node.type === "video") {
            const rect = videoRect(node);
            if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
              return node;
            }
            continue;
          }
          const r = nodeHitRadius(node);
          if (Math.hypot(x - node.x, y - node.y) <= r) return node;
        }
        return null;
      }

      function wrapLabel(text, max) {
        const words = String(text).split(/\\s+/);
        const lines = [];
        let line = "";
        words.forEach((word) => {
          const next = line ? line + " " + word : word;
          if (next.length > max && line) {
            lines.push(line);
            line = word;
          } else {
            line = next;
          }
        });
        if (line) lines.push(line);
        return lines.slice(0, 2);
      }

      function draw() {
        ctx.clearRect(0, 0, width, height);
        graph.edges.forEach((edge) => {
          const a = graph.nodes.find((n) => n.id === edge.source);
          const b = graph.nodes.find((n) => n.id === edge.target);
          if (!a || !b) return;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = palette.edge;
          ctx.lineWidth = hovered && (hovered.id === a.id || hovered.id === b.id) ? 2 : 1;
          ctx.stroke();
        });

        graph.nodes.forEach((node) => {
          const isHover = hovered && hovered.id === node.id;

          if (node.type === "video") {
            const rect = videoRect(node);
            const ix = rect.x + rect.pad;
            const iy = rect.y + rect.pad;
            ctx.save();
            ctx.fillStyle = "#07080c";
            roundRect(rect.x, rect.y, rect.w, rect.h, 6);
            ctx.fill();
            if (images[node.id] && images[node.id].complete) {
              ctx.save();
              roundRect(ix, iy, THUMB_W, THUMB_H, 4);
              ctx.clip();
              drawCoverImage(images[node.id], ix, iy, THUMB_W, THUMB_H);
              ctx.restore();
            } else {
              ctx.fillStyle = palette.video;
              ctx.globalAlpha = 0.35;
              roundRect(ix, iy, THUMB_W, THUMB_H, 4);
              ctx.fill();
              ctx.globalAlpha = 1;
            }
            ctx.lineWidth = isHover ? 2.5 : 1.5;
            ctx.strokeStyle = isHover ? palette.hub : "rgba(255,255,255,0.28)";
            roundRect(ix, iy, THUMB_W, THUMB_H, 4);
            ctx.stroke();
            ctx.fillStyle = palette.text;
            ctx.font = '500 10px "IBM Plex Mono", monospace';
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            const labelY = rect.y + rect.h + 5;
            wrapLabel(node.fullLabel || node.label, 22).forEach((line, i) => {
              ctx.fillText(line, node.x, labelY + i * 10);
            });
            ctx.restore();
            return;
          }

          const r = nodeRadius(node);
          ctx.save();
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + (isHover ? 4 : 0), 0, Math.PI * 2);
          ctx.fillStyle = node.type === "hub" ? palette.hub : palette.concept;
          ctx.globalAlpha = node.type === "concept" ? 0.88 : 1;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.lineWidth = isHover ? 3 : 2;
          ctx.strokeStyle = isHover ? palette.hub : "rgba(255,255,255,0.15)";
          ctx.stroke();

          if (node.type === "hub") {
            ctx.fillStyle = "#0e1018";
            ctx.font = '600 11px "IBM Plex Mono", monospace';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("VIDEOS", node.x, node.y);
          }

          ctx.fillStyle = palette.text;
          ctx.font = '500 10px "IBM Plex Mono", monospace';
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          const labelY = node.y + r + 6;
          wrapLabel(node.label, 18).forEach((line, i) => {
            ctx.fillText(line, node.x, labelY + i * 10);
          });
          ctx.restore();
        });
      }

      function loop() {
        simulate();
        draw();
        raf = requestAnimationFrame(loop);
      }

      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        hovered = pickNode(e.clientX - rect.left, e.clientY - rect.top);
        canvas.style.cursor = hovered && hovered.url ? "pointer" : "default";
      });
      canvas.addEventListener("mouseleave", () => { hovered = null; });
      canvas.addEventListener("click", () => {
        if (hovered && hovered.url) window.location.href = hovered.url;
      });
      window.addEventListener("resize", () => { resize(); });

      resize();
      loadImages();
      loop();
    })();
  </script>`;
}

function voiceTalkHref(video) {
  const id = networkNodeId(video.id);
  const name = encodeURIComponent(String(video.title || video.id).replace(/\n/g, " "));
  return `voice.html?talk=${encodeURIComponent(id)}&name=${name}`;
}

function renderCardConcepts(matched) {
  if (!matched || !matched.length) return "";
  const chips = matched
    .slice(0, 5)
    .map((m) => {
      const label = escapeHtml(m.label || m.conceptId);
      const id = escapeHtml(m.conceptId);
      return `<a class="concept-chip" href="network.html#${id}">${label}</a>`;
    })
    .join("");
  return `<div class="card-concepts">${chips}</div>`;
}

function renderConcepts(matched, videoId, talkHref) {
  const talk = `<p class="talk-row"><a class="talk-link" href="${escapeHtml(talkHref)}">Talk about this</a></p>`;
  const hasIngest = matched && matched.length && matched.some((m) => m.score != null);
  if (matched && matched.length) {
    const chips = matched
      .map((m) => {
        const label = escapeHtml(m.label || m.conceptId);
        const id = escapeHtml(m.conceptId);
        return `<a class="concept-chip" href="network.html#${id}">${label}</a>`;
      })
      .join("\n        ");
    const hint = hasIngest
      ? `<p class="hint">Matched from the speech against the Hybrid Intelligences ontology.</p>`
      : `<p class="hint">Ontology links from the network graph — run ingest for speech-matched concepts.</p>`;
    return `
    ${talk}
    <section class="concepts" aria-labelledby="concepts-heading">
      <h2 id="concepts-heading">Concepts in this video</h2>
      ${hint}
      <div class="concept-list">
        ${chips}
      </div>
    </section>`;
  }
  return `
    ${talk}
    <section class="concepts pending" aria-labelledby="concepts-heading">
      <h2 id="concepts-heading">Ontology</h2>
      <p class="hint">Concept matching runs after ingest. Voice can still discuss the video from its ontology entry and transcript when available.</p>
    </section>`;
}

function hubBadge(transcript) {
  const conceptCount = transcript && transcript.matched ? transcript.matched.length : 0;
  if (conceptCount) {
    return `<span class="badge">${conceptCount} concepts</span>`;
  }
  return `<span class="badge muted">Not ingested</span>`;
}

function youtubeEmbedId(url) {
  if (!url) return null;
  const match = String(url).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

function renderPlayer(video) {
  const ytId = youtubeEmbedId(video.youtube);
  if (ytId) {
    return `<div class="player">
      <iframe src="https://www.youtube.com/embed/${ytId}" title="${escapeHtml(video.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>
    <p class="watch-external"><a href="${escapeHtml(video.youtube)}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></p>`;
  }
  const poster = video.poster ? ` poster="${escapeHtml(video.poster)}"` : "";
  if (!video.src) {
    return `<p class="hint">No video source configured.</p>`;
  }
  return `<div class="player">
      <video controls playsinline preload="metadata"${poster}>
        <source src="${escapeHtml(video.src)}" type="video/mp4">
        Your browser does not support the video tag.
        <a href="${escapeHtml(video.src)}">Download video</a>
      </video>
    </div>`;
}

function buildVideoPage(video, transcript) {
  const title = escapeHtml(video.title);
  const speaker = video.speaker ? escapeHtml(video.speaker) : "";
  const date = video.date ? escapeHtml(video.date) : "";
  const meta = [speaker, date].filter(Boolean).join(" · ");
  const caption = video.caption ? `<p class="caption">${escapeHtml(video.caption)}</p>` : "";
  const credit = video.credit ? `<p class="credit">${escapeHtml(video.credit)}</p>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hybrid Intelligences — ${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500&family=IBM+Plex+Serif:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
  <style>
${sharedStyles()}
    .player { width: 100%; aspect-ratio: 16 / 9; background: #000; border: 1px solid var(--border); overflow: hidden; }
    .player iframe, .player video { display: block; width: 100%; height: 100%; object-fit: contain; background: #000; border: 0; }
    .watch-external { margin: 0.65rem 0 0; font-family: "IBM Plex Mono", monospace; font-size: 0.78rem; }
    .caption { margin: 1rem 0 0; max-width: 42rem; font-size: 0.95rem; color: var(--muted); line-height: 1.55; }
    .credit { margin: 0.55rem 0 0; font-family: "IBM Plex Mono", monospace; font-size: 0.78rem; color: var(--muted); }
    .concepts { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
    .concepts h2 {
      margin: 0 0 0.5rem;
      font-family: "IBM Plex Mono", monospace;
      font-weight: 400;
      font-size: 0.85rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--title);
    }
    .hint { margin: 0 0 1rem; font-size: 0.88rem; color: var(--muted); }
    .concept-list { display: flex; flex-wrap: wrap; gap: 0.45rem; }
    .concept-chip {
      display: inline-block;
      padding: 0.35rem 0.65rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.72rem;
      color: var(--link);
      background: var(--accent);
      text-decoration: none;
    }
    .concept-chip:hover { border-color: var(--title); text-decoration: none; }
    .talk-row { margin: 1.25rem 0 0; }
    .talk-link {
      display: inline-block;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.78rem;
      color: var(--link);
      text-decoration: none;
    }
    .talk-link:hover { text-decoration: underline; }
    .back { display: inline-block; margin-bottom: 1.25rem; font-family: "IBM Plex Mono", monospace; font-size: 0.78rem; }
    code { font-family: "IBM Plex Mono", monospace; font-size: 0.85em; }
  </style>
</head>
<body>
  <header>
    <div class="brand-row">
      <a class="site-logo" href="index.html" aria-label="Hybrid Intelligences home">
        <img src="logo.png" alt="Hybrid Intelligences">
      </a>
      <div class="brand-copy">
        <p class="eyebrow">Videos</p>
        <h1>${title}</h1>
        ${meta ? `<p class="meta">${meta}</p>` : ""}
      </div>
    </div>
    <div class="header-row">
${headerNav()}
    </div>
  </header>
  <main>
    <a class="back" href="videos.html">← All videos</a>
    ${renderPlayer(video)}
    ${caption}
    ${credit}
    ${renderConcepts(videoConcepts(video, transcript), video.id, voiceTalkHref(video))}
  </main>
  <footer class="page-foot">Hybrid Intelligences · University of Florida · ${title}</footer>
${themeScript()}
</body>
</html>
`;
}

function buildHub(videos) {
  const graph = buildNetworkGraphData(videos);
  const graphJson = JSON.stringify(graph).replace(/</g, "\\u003c");

  const cards = videos
    .map((v, index) => {
      const transcript = loadTranscript(v.transcript);
      const badge = hubBadge(transcript);
      const poster = v.poster
        ? `<img src="${escapeHtml(v.poster)}" width="1280" height="720" alt="" loading="${index === 0 ? "eager" : "lazy"}">`
        : `<span class="placeholder">Video</span>`;
      const meta = [v.speaker, v.date].filter(Boolean).map(escapeHtml).join(" · ");
      const talkHref = voiceTalkHref(v);
      const conceptStrip = renderCardConcepts(videoConcepts(v, transcript));
      const featured = index === 0 ? " featured" : "";
      const caption = v.caption
        ? `<p class="card-caption">${escapeHtml(v.caption)}</p>`
        : "";
      return `      <article class="card${featured}">
        <a class="card-main" href="video-${escapeHtml(v.id)}.html">
          <span class="shot">
            ${poster}
            <span class="play-ring" aria-hidden="true"></span>
          </span>
          <span class="copy">
            <span class="speaker-tag">${escapeHtml(v.speaker || "Video")}</span>
            ${badge}
            <h2>${escapeHtml(v.title)}</h2>
            <p class="meta-line">${meta}</p>
            ${caption}
          </span>
        </a>
        <div class="card-foot">
          <a class="talk-link" href="${escapeHtml(talkHref)}">Talk about this</a>
          ${conceptStrip}
        </div>
      </article>`;
    })
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hybrid Intelligences — Videos</title>
  <meta name="description" content="Reels curated by Marlon Barrios Solano — content feeds the Hybrid Intelligences ontology.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
${sharedStyles()}
    :root {
      --net-hub: #f4c430;
      --net-video: #82c3ff;
      --net-concept: #4ec4c4;
      --net-edge: rgba(150, 158, 176, 0.35);
    }
    main.videos-main {
      max-width: 72rem;
      margin: 0 auto;
      padding: 1.75rem 1.5rem 3.5rem;
    }
    footer.page-foot { max-width: 72rem; }
    .lede {
      max-width: 44rem;
      margin: 1.1rem 0 1.75rem;
      font-size: 0.95rem;
      line-height: 1.5;
      color: var(--muted);
    }
    .lede p { margin: 0 0 0.5rem; }
    .section-head { margin-bottom: 0.75rem; }
    .section-head h2 {
      margin: 0 0 0.2rem;
      font-family: "IBM Plex Mono", monospace;
      font-weight: 400;
      font-size: 0.82rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--title);
    }
    .section-head p {
      margin: 0;
      max-width: 44rem;
      font-size: 0.84rem;
      color: var(--muted);
      line-height: 1.42;
    }
    .network-section {
      margin-bottom: 2.5rem;
      padding: 1.35rem 1.35rem 0.85rem;
      border: 1px solid var(--border);
      background:
        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(244, 196, 48, 0.06), transparent 60%),
        var(--panel);
      border-radius: 12px;
    }
    .network-section .section-head { margin-bottom: 0.55rem; }
    .network-wrap {
      position: relative;
      margin-top: 0.35rem;
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      background: color-mix(in srgb, var(--bg) 92%, transparent);
    }
    #videoNetworkCanvas {
      display: block;
      width: 100%;
      height: min(70vh, 580px);
      min-height: 460px;
    }
    .network-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem 1rem;
      padding: 0.5rem 1rem 0.65rem;
      border-top: 1px solid var(--border);
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.68rem;
      color: var(--muted);
    }
    .legend-item { display: inline-flex; align-items: center; gap: 0.4rem; }
    .legend-dot {
      width: 0.65rem;
      height: 0.65rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-dot.hub { background: var(--net-hub); }
    .legend-dot.video {
      width: 1.15rem;
      height: 0.65rem;
      border-radius: 2px;
      background: var(--net-video);
    }
    .legend-dot.concept { background: var(--net-concept); }
    .reels-section { margin-top: 0.5rem; }
    .reels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
      gap: 1.35rem;
    }
    .card {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border);
      background: var(--panel);
      color: inherit;
      overflow: hidden;
      border-radius: 10px;
      transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
    }
    .card:hover {
      border-color: var(--title);
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
    }
    .card.featured {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    }
    @media (max-width: 720px) {
      .card.featured { grid-template-columns: 1fr; }
    }
    .card-main {
      display: flex;
      flex-direction: column;
      flex: 1;
      text-decoration: none;
      color: inherit;
      min-height: 0;
    }
    .card.featured .card-main { flex-direction: row; }
    @media (max-width: 720px) {
      .card.featured .card-main { flex-direction: column; }
    }
    .card-main:hover { text-decoration: none; }
    .card-foot {
      padding: 0.65rem 1.1rem 0.85rem;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }
    .card.featured .card-foot { grid-column: 1 / -1; }
    .card-foot .talk-link {
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.72rem;
      color: var(--link);
      text-decoration: none;
    }
    .card-foot .talk-link:hover { text-decoration: underline; }
    .card-concepts { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .card-concepts .concept-chip {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.62rem;
      color: var(--link);
      background: var(--accent);
      text-decoration: none;
    }
    .card-concepts .concept-chip:hover { border-color: var(--title); text-decoration: none; }
    .shot {
      display: block;
      position: relative;
      aspect-ratio: 16 / 9;
      background: #07080c;
      overflow: hidden;
      flex-shrink: 0;
    }
    .card.featured .shot {
      aspect-ratio: 16 / 9;
      flex: 1 1 52%;
      min-width: min(100%, 20rem);
      max-width: 36rem;
    }
    .shot img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform 0.35s ease;
    }
    .card:hover .shot img { transform: scale(1.04); }
    .shot::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 45%, rgba(0, 0, 0, 0.55) 100%);
      pointer-events: none;
    }
    .play-ring {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 3rem;
      height: 3rem;
      margin: -1.5rem 0 0 -1.5rem;
      border: 2px solid rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      opacity: 0.85;
      transition: transform 0.2s, opacity 0.2s;
      pointer-events: none;
    }
    .play-ring::after {
      content: "";
      position: absolute;
      left: 1.15rem;
      top: 0.85rem;
      border-style: solid;
      border-width: 0.65rem 0 0.65rem 1rem;
      border-color: transparent transparent transparent rgba(255, 255, 255, 0.9);
    }
    .card:hover .play-ring { transform: scale(1.08); opacity: 1; }
    .shot .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.78rem;
      color: var(--muted);
    }
    .copy { padding: 1rem 1.15rem 1.15rem; display: flex; flex-direction: column; justify-content: center; }
    .speaker-tag {
      display: inline-block;
      margin-bottom: 0.5rem;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.62rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--title);
    }
    .badge {
      display: inline-block;
      margin-bottom: 0.45rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.65rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: var(--accent);
      color: var(--title);
    }
    .badge.muted { background: transparent; border: 1px solid var(--border); color: var(--muted); }
    .copy h2 {
      margin: 0 0 0.35rem;
      font-family: "IBM Plex Mono", monospace;
      font-weight: 400;
      font-size: 0.92rem;
      line-height: 1.45;
      color: var(--text);
    }
    .meta-line {
      margin: 0;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.72rem;
      color: var(--muted);
    }
    .card-caption {
      margin: 0.65rem 0 0;
      font-size: 0.82rem;
      line-height: 1.55;
      color: var(--muted);
    }
    code { font-size: 0.9em; }
  </style>
</head>
<body>
  <header>
    <div class="brand-row">
      <a class="site-logo" href="index.html" aria-label="Hybrid Intelligences home">
        <img src="logo.png" alt="Hybrid Intelligences">
      </a>
      <div class="brand-copy">
        <p class="eyebrow">Videos</p>
        <h1>Videos</h1>
        <p class="meta">Reels curated by Marlon Barrios Solano</p>
      </div>
    </div>
    <div class="header-row">
${headerNav()}
    </div>
  </header>
  <main class="videos-main">
    <section class="network-section" aria-labelledby="video-network-heading">
      <div class="section-head">
        <h2 id="video-network-heading">Video network</h2>
        <p>Each reel links to ontology concepts it develops — shared nodes show where the talks overlap. Click a thumbnail node or concept to open it.</p>
      </div>
      <div class="network-wrap">
        <canvas id="videoNetworkCanvas" role="img" aria-label="Network visualization of video reels and ontology concepts"></canvas>
        <div class="network-legend">
          <span class="legend-item"><span class="legend-dot hub"></span> Videos hub</span>
          <span class="legend-item"><span class="legend-dot video"></span> Reel (16:9 thumbnail)</span>
          <span class="legend-item"><span class="legend-dot concept"></span> Ontology concept</span>
        </div>
      </div>
    </section>

    <div class="lede">
      <p>Reels curated by <a href="https://marlonbarrios.github.io/">Marlon Barrios Solano</a>. Their content feeds the <a href="ontology.html">ontology</a>.</p>
    </div>

    <section class="reels-section" aria-labelledby="reels-heading">
      <div class="section-head">
        <h2 id="reels-heading">Reels</h2>
        <p>Watch, then use Voice to talk through what each reel contributes to the graph.</p>
      </div>
      <div class="reels-grid">
${cards}
      </div>
    </section>
  </main>
  <footer class="page-foot">Hybrid Intelligences · University of Florida · Videos</footer>
${themeScript()}
${networkVizScript(graphJson)}
</body>
</html>
`;
}

function main() {
  const { videos } = loadManifest();
  if (!videos || !videos.length) {
    console.error("videos.json has no entries.");
    process.exit(1);
  }

  fs.writeFileSync(path.join(ROOT, "videos.html"), buildHub(videos));
  console.log("Wrote videos.html");

  for (const video of videos) {
    const transcript = loadTranscript(video.transcript);
    fs.writeFileSync(
      path.join(ROOT, `video-${video.id}.html`),
      buildVideoPage(video, transcript)
    );
    console.log(`Wrote video-${video.id}.html`);
  }

  const legacy = videos[0];
  fs.writeFileSync(
    path.join(ROOT, "video.html"),
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=video-${escapeHtml(legacy.id)}.html">
  <link rel="canonical" href="video-${escapeHtml(legacy.id)}.html">
  <title>Redirecting…</title>
</head>
<body><p><a href="video-${escapeHtml(legacy.id)}.html">Continue to video</a></p></body>
</html>`
  );
  console.log("Wrote video.html (redirect)");
}

main();
