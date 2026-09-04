      const canvas = document.getElementById("videoNetworkCanvas");
      if (!canvas || !graph.nodes.length) return;

      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      let width = 0;
      let height = 0;
      let hovered = null;
      let pinned = null;
      let images = {};
      let raf = 0;
      let time = 0;

      const adjacency = new Map();
      graph.nodes.forEach((n) => adjacency.set(n.id, new Set()));
      graph.edges.forEach((e) => {
        adjacency.get(e.source)?.add(e.target);
        adjacency.get(e.target)?.add(e.source);
      });

      const videoCount = graph.nodes.filter((n) => n.type === "video").length;
      const conceptCount = graph.nodes.filter((n) => n.type === "concept").length;
      const THUMB_W = videoCount > 45 ? 56 : videoCount > 28 ? 68 : 80;
      const THUMB_H = Math.round(THUMB_W * 9 / 16);
      const THUMB_HOVER_SCALE = 4;

      function readPalette() {
        const style = getComputedStyle(document.body);
        return {
          hub: style.getPropertyValue("--net-hub").trim() || "#f4c430",
          video: style.getPropertyValue("--net-video").trim() || "#82c3ff",
          concept: style.getPropertyValue("--net-concept").trim() || "#4ec4c4",
          edge: style.getPropertyValue("--net-edge").trim() || "rgba(150,158,176,0.35)",
          text: style.getPropertyValue("--net-label").trim() || style.getPropertyValue("--text").trim() || "#e8eaef",
        };
      }

      let palette = readPalette();

      function focusNeighbors(node) {
        const set = new Set([node.id]);
        const neighbors = adjacency.get(node.id);
        if (neighbors) neighbors.forEach((id) => set.add(id));
        return set;
      }

      function focusedNode() {
        return pinned || hovered;
      }

      function isNodeVisible(node) {
        const focus = focusedNode();
        if (!focus) return true;
        return focusNeighbors(focus).has(node.id);
      }

      function isEdgeVisible(edge) {
        const a = graph.nodes.find((n) => n.id === edge.source);
        const b = graph.nodes.find((n) => n.id === edge.target);
        if (!a || !b) return false;
        if (!isNodeVisible(a) || !isNodeVisible(b)) return false;
        const focus = focusedNode();
        if (!focus) {
          if (a.type === "video" && b.type === "video") return true;
          if (a.type === "hub" || b.type === "hub") {
            return a.type === "video" || b.type === "video";
          }
          return (a.type === "video" && b.type === "concept") || (b.type === "video" && a.type === "concept");
        }
        const visible = focusNeighbors(focus);
        return visible.has(edge.source) && visible.has(edge.target);
      }

      function nodeOpacity(node) {
        const focus = focusedNode();
        if (!focus) {
          if (node.type === "concept") return 0.78;
          return 1;
        }
        if (node.id === focus.id) return 1;
        return adjacency.get(focus.id)?.has(node.id) ? 0.95 : 0;
      }

      function nodeRadius(node) {
        if (node.type === "hub") return 28;
        if (node.type === "concept") {
          if (conceptCount > 120) return 6;
          if (conceptCount > 60) return 8;
          return 10;
        }
        return 0;
      }

      function thumbScale(node) {
        if (node.type !== "video") return 1;
        return hovered && hovered.id === node.id ? THUMB_HOVER_SCALE : 1;
      }

      function videoRect(node) {
        const scale = thumbScale(node);
        const w = THUMB_W * scale;
        const h = THUMB_H * scale;
        const pad = hovered && hovered.id === node.id ? 2 : 0;
        return {
          x: node.x - w / 2 - pad,
          y: node.y - h / 2 - pad,
          w: w + pad * 2,
          h: h + pad * 2,
          innerW: w,
          innerH: h,
          pad,
          scale,
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
        const base = Math.min(width, height);
        const rings = videos.length > 45 ? 3 : videos.length > 22 ? 2 : 1;
        const perRing = Math.ceil(videos.length / rings);
        videos.forEach((node, i) => {
          const ring = Math.min(Math.floor(i / perRing), rings - 1);
          const idxInRing = i - ring * perRing;
          const nInRing = ring === rings - 1 ? videos.length - ring * perRing : perRing;
          const angle = (idxInRing / Math.max(nInRing, 1)) * Math.PI * 2 - Math.PI / 2 + ring * 0.1;
          const r = base * (0.2 + ring * 0.11);
          node.x = width / 2 + Math.cos(angle) * r;
          node.y = height / 2 + Math.sin(angle) * r;
          node.hx = node.x;
          node.hy = node.y;
          node.phase = i * 0.73 + ring * 1.7;
          node.amp = 3.2 + (i % 6) * 0.55;
          node.vx = 0;
          node.vy = 0;
        });
        concepts.forEach((node, i) => {
          const linkedVideoIds = graph.edges
            .filter((e) => e.kind === "concept" && e.target === node.id)
            .map((e) => e.source);
          const parents = linkedVideoIds
            .map((id) => graph.nodes.find((n) => n.id === id))
            .filter(Boolean);
          if (parents.length) {
            const cx = parents.reduce((s, p) => s + p.hx, 0) / parents.length;
            const cy = parents.reduce((s, p) => s + p.hy, 0) / parents.length;
            const angle = Math.atan2(cy - height / 2, cx - width / 2);
            const outward = 28 + (i % 3) * 6;
            node.hx = cx + Math.cos(angle) * outward;
            node.hy = cy + Math.sin(angle) * outward;
          } else {
            const angle = (i / Math.max(concepts.length, 1)) * Math.PI * 2;
            const r = base * 0.44;
            node.hx = width / 2 + Math.cos(angle) * r;
            node.hy = height / 2 + Math.sin(angle) * r;
          }
          node.x = node.hx;
          node.y = node.hy;
          node.phase = i * 0.51 + 0.3;
          node.amp = 2 + (i % 5) * 0.35;
          node.vx = 0;
          node.vy = 0;
        });
      }

      function layoutFocusConcepts(focus) {
        if (!focus) return;
        const conceptIds = [...(adjacency.get(focus.id) || [])].filter((id) => {
          const n = graph.nodes.find((node) => node.id === id);
          return n && n.type === "concept";
        });
        conceptIds.forEach((id, i) => {
          const node = graph.nodes.find((n) => n.id === id);
          if (!node) return;
          const angle = (i / Math.max(conceptIds.length, 1)) * Math.PI * 2 - Math.PI / 2;
          const r = focus.type === "video" ? 64 : 48;
          node.x = focus.x + Math.cos(angle) * r;
          node.y = focus.y + Math.sin(angle) * r;
          node.vx = 0;
          node.vy = 0;
        });
      }

      function resize() {
        const rect = canvas.getBoundingClientRect();
        width = Math.max(rect.width, 320);
        height = Math.max(rect.height, 480);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initLayout();
        if (pinned) layoutFocusConcepts(pinned);
      }

      function loadImages() {
        graph.nodes.filter((n) => n.poster).forEach((node) => {
          const img = new Image();
          img.src = node.poster;
          img.onload = () => {
            images[node.id] = img;
            draw();
          };
          images[node.id] = img;
        });
      }

      function edgeRest(edge, a, b) {
        if (a.type === "hub" || b.type === "hub") return 112;
        if (a.type === "video" && b.type === "video") {
          return 128 + Math.min(edge.shared || 1, 4) * 18;
        }
        return 64;
      }

      function simulate() {
        time += 0.011;
        const focus = focusedNode();
        const damping = focus ? 0.9 : 0.875;
        const maxSpeed = focus ? 1.6 : 0.65;
        const conceptMaxSpeed = 0.45;
        const anchorK = focus ? 0.024 : 0.016;
        const conceptAnchorK = anchorK * 1.15;
        const repulsion = focus ? 1400 : 1100;
        const conceptRepulsion = focus ? 780 : 520;
        const springK = focus ? 0.013 : 0.008;
        const minVideoDist = Math.max(THUMB_W * THUMB_HOVER_SCALE, THUMB_H * THUMB_HOVER_SCALE) + 12;
        const active = graph.nodes.filter((n) => isNodeVisible(n));
        const videos = active.filter((n) => n.type === "video");
        const concepts = active.filter((n) => n.type === "concept");

        videos.forEach((node) => {
          const pin = focus && focus.id === node.id;
          const amp = pin ? node.amp * 0.25 : node.amp;
          const tx = node.hx + Math.sin(time * 0.62 + node.phase) * amp;
          const ty = node.hy + Math.cos(time * 0.48 + node.phase * 1.15) * amp * 0.9;
          node.vx += (tx - node.x) * anchorK;
          node.vy += (ty - node.y) * anchorK;
        });

        concepts.forEach((node) => {
          const tx = node.hx + Math.sin(time * 0.55 + node.phase) * node.amp;
          const ty = node.hy + Math.cos(time * 0.42 + node.phase * 1.1) * node.amp * 0.85;
          node.vx += (tx - node.x) * conceptAnchorK;
          node.vy += (ty - node.y) * conceptAnchorK;
        });

        for (let i = 0; i < videos.length; i++) {
          for (let j = i + 1; j < videos.length; j++) {
            const a = videos[i];
            const b = videos[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let dist = Math.hypot(dx, dy) || 0.01;
            if (dist > minVideoDist * 2.2) continue;
            const push = repulsion / (dist * dist);
            const fx = (dx / dist) * push;
            const fy = (dy / dist) * push;
            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }

        graph.edges.forEach((edge) => {
          if (!isEdgeVisible(edge)) return;
          const a = graph.nodes.find((n) => n.id === edge.source);
          const b = graph.nodes.find((n) => n.id === edge.target);
          if (!a || !b) return;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          const rest = edgeRest(edge, a, b);
          const k = a.type === "video" && b.type === "video" ? springK * 0.85 : springK;
          const force = (dist - rest) * k;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (!a.fixed) { a.vx += fx; a.vy += fy; }
          if (!b.fixed) { b.vx -= fx; b.vy -= fy; }
        });

        for (let i = 0; i < concepts.length; i++) {
          for (let j = i + 1; j < concepts.length; j++) {
            const a = concepts[i];
            const b = concepts[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let dist = Math.hypot(dx, dy) || 0.01;
            if (!focus && dist > 48) continue;
            const force = conceptRepulsion / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }

        graph.nodes.forEach((node) => {
          if (node.fixed) return;
          if (!isNodeVisible(node)) {
            node.vx = 0;
            node.vy = 0;
            return;
          }
          node.vx *= damping;
          node.vy *= damping;
          const cap = node.type === "concept" ? conceptMaxSpeed : maxSpeed;
          const speed = Math.hypot(node.vx, node.vy);
          if (speed > cap) {
            node.vx = (node.vx / speed) * cap;
            node.vy = (node.vy / speed) * cap;
          }
          node.x += node.vx;
          node.y += node.vy;
          const hoverScale = node.type === "video" && hovered && hovered.id === node.id ? THUMB_HOVER_SCALE : 1;
          const margin = node.type === "video"
            ? (Math.max(THUMB_W, THUMB_H) * hoverScale) / 2 + 14
            : nodeRadius(node) + 10;
          const labelRoom = node.type === "video" ? 28 : 18;
          node.x = Math.max(margin, Math.min(width - margin, node.x));
          node.y = Math.max(margin, Math.min(height - margin - labelRoom, node.y));
        });
      }

      function pickNode(x, y) {
        const videos = graph.nodes
          .filter((n) => n.type === "video" && isNodeVisible(n))
          .slice()
          .sort((a, b) => thumbScale(b) - thumbScale(a));
        for (const node of videos) {
          const rect = videoRect(node);
          if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
            return node;
          }
        }
        for (let i = graph.nodes.length - 1; i >= 0; i--) {
          const node = graph.nodes[i];
          if (!isNodeVisible(node) || node.type === "video") continue;
          const r = nodeHitRadius(node);
          if (Math.hypot(x - node.x, y - node.y) <= r) return node;
        }
        return null;
      }

      function wrapLabelPx(text, maxPx, font) {
        ctx.font = font;
        const words = String(text).split(/\s+/);
        const lines = [];
        let line = "";
        words.forEach((word) => {
          const next = line ? `${line} ${word}` : word;
          if (ctx.measureText(next).width > maxPx && line) {
            lines.push(line);
            line = word;
          } else {
            line = next;
          }
        });
        if (line) lines.push(line);
        return lines;
      }

      function truncateLabelPx(text, maxPx, font) {
        ctx.font = font;
        const s = String(text);
        if (ctx.measureText(s).width <= maxPx) return s;
        let cut = s;
        while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxPx) {
          cut = cut.slice(0, -1);
        }
        return `${cut}…`;
      }

      function formatConceptLabel(text) {
        return String(text)
          .replace(/\n/g, " ")
          .replace(/_/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }

      function drawLabelHalo(text, x, y) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = document.body.classList.contains("light-mode")
          ? "rgba(255,253,248,0.92)"
          : "rgba(14,16,24,0.92)";
        ctx.strokeText(text, x, y);
        ctx.fillStyle = palette.text;
        ctx.fillText(text, x, y);
      }

      function drawVideo(node) {
        const rect = videoRect(node);
        const isHover = hovered && hovered.id === node.id;
        const ix = rect.x + rect.pad;
        const iy = rect.y + rect.pad;
        const iw = rect.innerW;
        const ih = rect.innerH;
        ctx.save();
        ctx.globalAlpha = nodeOpacity(node);
        if (isHover) {
          ctx.shadowColor = "rgba(0,0,0,0.42)";
          ctx.shadowBlur = 18;
          ctx.shadowOffsetY = 6;
        }
        ctx.fillStyle = "#07080c";
        roundRect(rect.x, rect.y, rect.w, rect.h, 6);
        ctx.fill();
        if (images[node.id] && images[node.id].complete) {
          ctx.save();
          roundRect(ix, iy, iw, ih, 4);
          ctx.clip();
          drawCoverImage(images[node.id], ix, iy, iw, ih);
          ctx.restore();
        } else {
          ctx.fillStyle = palette.video;
          ctx.globalAlpha = 0.35 * nodeOpacity(node);
          roundRect(ix, iy, iw, ih, 4);
          ctx.fill();
        }
        ctx.globalAlpha = nodeOpacity(node);
        ctx.lineWidth = isHover ? 2.5 : 1.5;
        ctx.strokeStyle = isHover ? palette.hub : "rgba(255,255,255,0.28)";
        roundRect(ix, iy, iw, ih, 4);
        ctx.stroke();
        ctx.restore();

        const label = formatConceptLabel(node.fullLabel || node.label);
        const fontSize = videoCount > 50 ? 6 : videoCount > 30 ? 7 : 8;
        const font = `600 ${fontSize}px "IBM Plex Mono", monospace`;
        const labelMaxW = Math.max(rect.w + 8, THUMB_W);
        ctx.font = font;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const labelY = rect.y + rect.h + 5;
        wrapLabelPx(label, labelMaxW, font)
          .slice(0, isHover ? 3 : 2)
          .forEach((line, i) => {
            drawLabelHalo(truncateLabelPx(line, labelMaxW, font), node.x, labelY + i * (fontSize + 2));
          });
      }

      function draw() {
        palette = readPalette();
        ctx.clearRect(0, 0, width, height);
        const focus = focusedNode();

        graph.edges.forEach((edge) => {
          if (!isEdgeVisible(edge)) return;
          const a = graph.nodes.find((n) => n.id === edge.source);
          const b = graph.nodes.find((n) => n.id === edge.target);
          if (!a || !b) return;
          const isRelated = a.type === "video" && b.type === "video";
          const isConceptLink =
            (a.type === "video" && b.type === "concept") || (b.type === "video" && a.type === "concept");
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          if (isRelated && !focus) {
            ctx.strokeStyle = palette.video;
            ctx.globalAlpha = 0.22;
            ctx.lineWidth = 0.75;
          } else if (isConceptLink && !focus) {
            ctx.strokeStyle = palette.concept;
            ctx.globalAlpha = 0.16;
            ctx.lineWidth = 0.65;
          } else {
            ctx.strokeStyle = focus ? palette.hub : palette.edge;
            ctx.globalAlpha = focus ? 0.75 : 0.4;
            ctx.lineWidth = focus && (focus.id === a.id || focus.id === b.id) ? 2.5 : 1;
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        });

        graph.nodes.forEach((node) => {
          if (!isNodeVisible(node) || node.type === "video") return;
          const opacity = nodeOpacity(node);
          if (opacity <= 0) return;
          const isHover = focus && focus.id === node.id;
          const r = nodeRadius(node);
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + (isHover ? 4 : 0), 0, Math.PI * 2);
          ctx.fillStyle = node.type === "hub" ? palette.hub : palette.concept;
          ctx.globalAlpha = (node.type === "concept" ? 0.88 : 1) * opacity;
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

          if (node.type === "concept") {
            const label = formatConceptLabel(node.label);
            const fontSize = conceptCount > 120 ? 6 : conceptCount > 70 ? 7 : 8;
            const font = `500 ${fontSize}px "IBM Plex Mono", monospace`;
            const labelMaxW = Math.max(48, r * 8);
            ctx.font = font;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            const labelY = node.y + r + 3;
            wrapLabelPx(label, labelMaxW, font)
              .slice(0, isHover ? 3 : 2)
              .forEach((line, i) => {
                drawLabelHalo(truncateLabelPx(line, labelMaxW, font), node.x, labelY + i * (fontSize + 2));
              });
          }
          ctx.restore();
        });

        graph.nodes
          .filter((n) => n.type === "video" && isNodeVisible(n))
          .sort((a, b) => thumbScale(a) - thumbScale(b))
          .forEach((node) => drawVideo(node));
      }

      let lastFocusId = null;

      function onFocusChange() {
        const focus = focusedNode();
        const id = focus ? focus.id : null;
        if (id === lastFocusId) return;
        lastFocusId = id;
        if (focus) layoutFocusConcepts(focus);
      }

      function loop() {
        onFocusChange();
        simulate();
        draw();
        raf = requestAnimationFrame(loop);
      }

      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        hovered = pickNode(e.clientX - rect.left, e.clientY - rect.top);
        canvas.style.cursor = hovered && hovered.url ? "pointer" : "default";
      });
      canvas.addEventListener("mouseleave", () => {
        hovered = null;
      });
      canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const node = pickNode(e.clientX - rect.left, e.clientY - rect.top);
        if (node && node.type === "video" && node.url) {
          window.location.href = node.url;
          return;
        }
        if (node) {
          pinned = pinned && pinned.id === node.id ? null : node;
          if (pinned) layoutFocusConcepts(pinned);
          return;
        }
        pinned = null;
      });
      canvas.addEventListener("touchstart", (e) => {
        const t = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const node = pickNode(t.clientX - rect.left, t.clientY - rect.top);
        if (node) {
          pinned = node;
          layoutFocusConcepts(pinned);
          e.preventDefault();
        }
      }, { passive: false });

      window.addEventListener("resize", () => {
        resize();
      });

      resize();
      loadImages();
      loop();
