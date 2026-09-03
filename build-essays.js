#!/usr/bin/env node
/**
 * Essay source-of-truth workflow
 *
 * Edit essay-1.md, essay-2.md, or essay-3.md, then:
 *   node build-essays.js          # regenerate essay.html + essay-2.html + essay-3.html
 *   node build-essays.js --pdf    # also export PDFs (Chrome headless)
 *   node build-essays.js --extract  # one-time: HTML → markdown (overwrites .md)
 *
 * Concept links in markdown: [coupling](concept:coupling)
 * Special blocks (Essay 2):
 *   ::: term-list
 *   - **Tokens** rather than objects.
 *   :::
 *   ::: cluster
 *   - dance
 *   :::
 *   ::: closing
 *   paragraph text
 *   :::
 *   ::: credit
 *   credit line
 *   :::
 *   ::: figure
 *   ![alt](path.jpg)
 *
 *   Optional caption
 *   :::
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = __dirname;

const ESSAYS = [
  {
    md: "essay-1.md",
    html: "essay.html",
    pdf: "essay-1-hybrid-intelligences-cognitive-assemblages.pdf",
    printHtml: "_print-essay-1.html",
    cover: {
      essayLabel: "Essay 1",
      title: "Hybrid Intelligences, Cognitive Assemblages, and Complex Embodiment in the Era of AI",
      byline: "Marlon Barrios Solano · July 10, 2026",
    },
  },
  {
    md: "essay-2.md",
    html: "essay-2.html",
    pdf: "essay-2-my-umwelt.pdf",
    printHtml: "_print-essay-2.html",
    cover: {
      essayLabel: "Essay 2",
      title: "My Umwelt",
      byline: "Marlon Barrios Solano, in conversation with GPT-5.5 · July 20, 2026",
    },
  },
  {
    md: "essay-3.md",
    html: "essay-3.html",
    pdf: "essay-3-ontology-knowledge-graph.pdf",
    printHtml: "_print-essay-3.html",
    cover: {
      essayLabel: "Essay 3",
      title: "Hybrid Intelligences: Ontology, Knowledge Graph, and Cognitive Assemblage",
      byline: "Marlon Barrios Solano · September 2, 2026",
    },
  },
];

const SLIDES_URL = "slides.html";

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(ROOT, file), content, "utf8");
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: stripHtmlComments(raw.trim()) };
  }
  const meta = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }
  return { meta, body: stripHtmlComments(match[2].trim()) };
}

function stripHtmlComments(text) {
  return text
    .split("\n")
    .filter((line) => !line.trim().startsWith("<!--"))
    .join("\n")
    .trim();
}

function stringifyFrontmatter(meta) {
  const lines = ["---"];
  for (const [key, val] of Object.entries(meta)) {
    lines.push(`${key}: ${val}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

function inlineMdToHtml(text) {
  let out = escapeHtml(text);
  out = out.replace(/\[([^\]]+)\]\(concept:([a-z0-9_]+)\)/gi, (_, label, id) =>
    `<a class="concept" href="network.html#${id}">${label}</a>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return out;
}

function mdToHtml(body, opts = {}) {
  const lines = body.split("\n");
  const parts = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("::: ")) {
      const blockType = line.slice(4).trim();
      i++;
      const blockLines = [];
      while (i < lines.length && lines[i].trim() !== ":::") {
        blockLines.push(lines[i]);
        i++;
      }
      i++; // skip closing :::
      parts.push(renderBlock(blockType, blockLines, opts));
      continue;
    }

    if (/^## (Bibliography|References)$/.test(line)) {
      const heading = line.slice(3).trim();
      i++;
      while (i < lines.length && lines[i].trim() === "") i++;
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s*/, ""));
        i++;
      }
      parts.push(renderBibliography(items, heading));
      continue;
    }

    if (line.startsWith("## ")) {
      const title = line.slice(3).trim();
      parts.push(`<section class="topic">\n      <h2>${escapeHtml(title)}</h2>`);
      i++;
      while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("## ") && !lines[i].startsWith(":::")) {
        const inner = lines[i].trim();
        if (inner) parts.push(`      <p>${inlineMdToHtml(inner)}</p>`);
        i++;
      }
      parts.push("    </section>");
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    parts.push(`    <p>${inlineMdToHtml(line.trim())}</p>`);
    i++;
  }

  return `\n\n${parts.join("\n\n")}\n\n  `;
}

function renderBlock(type, blockLines, opts) {
  if (type === "term-list") {
    const items = blockLines
      .filter((l) => l.trim().startsWith("- "))
      .map((l) => `      <li>${inlineMdToHtml(l.trim().slice(2))}</li>`)
      .join("\n");
    return `    <ul class="term-list">\n${items}\n    </ul>`;
  }
  if (type === "cluster") {
    const items = blockLines
      .filter((l) => l.trim().startsWith("- "))
      .map((l) => `        <li>${inlineMdToHtml(l.trim().slice(2))}</li>`)
      .join("\n");
    return `      <ul class="cluster">\n${items}\n      </ul>`;
  }
  if (type === "closing") {
    const paras = blockLines
      .filter((l) => l.trim())
      .map((l) => `      <p>${inlineMdToHtml(l.trim())}</p>`)
      .join("\n");
    return `    <div class="closing">\n${paras}\n    </div>`;
  }
  if (type === "credit") {
    const text = blockLines.filter((l) => l.trim()).join(" ");
    return `    <p class="credit">${inlineMdToHtml(text)}</p>`;
  }
  if (type === "figure") {
    const imgLine = blockLines.find((l) => l.trim().startsWith("!["));
    const imgMatch = imgLine && imgLine.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (!imgMatch) {
      return blockLines.map((l) => `    <p>${inlineMdToHtml(l)}</p>`).join("\n");
    }
    const alt = escapeHtml(imgMatch[1]);
    const src = escapeHtml(imgMatch[2]);
    const caption = blockLines
      .filter((l) => l.trim() && !l.trim().startsWith("!["))
      .map((l) => l.trim())
      .join(" ");
    const cap = caption
      ? `\n      <figcaption>${inlineMdToHtml(caption)}</figcaption>`
      : "";
    return `    <figure class="essay-hero">\n      <img src="${src}" alt="${alt}" width="1024" height="1024">${cap}\n    </figure>`;
  }
  return blockLines.map((l) => `    <p>${inlineMdToHtml(l)}</p>`).join("\n");
}

function renderBibliography(items, heading = "Bibliography") {
  const lis = items
    .map((item) => {
      let html = item.replace(/"([^"]+)"/g, "\u201C$1\u201D");
      html = escapeHtml(html);
      html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      return `        <li>${html}</li>`;
    })
    .join("\n");
  return `    <section class="bibliography" aria-labelledby="bib-heading">
      <h2 id="bib-heading">${escapeHtml(heading)}</h2>
      <ol>
${lis}
      </ol>
    </section>`;
}

function htmlInlineToMd(html) {
  return html
    .replace(/<a class="concept" href="network\.html#([a-z0-9_]+)">([\s\S]*?)<\/a>/gi, (_, id, label) =>
      `[${label.replace(/<[^>]+>/g, "")}](concept:${id})`)
    .replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<[^>]+>/g, "")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlToMd(htmlFile, metaDefaults) {
  const html = read(htmlFile);
  const articleMatch = html.match(/<article>([\s\S]*?)<\/article>/);
  if (!articleMatch) throw new Error(`No <article> in ${htmlFile}`);
  const article = articleMatch[1];

  const headerMatch = html.match(/<p class="eyebrow">([^<]*)<\/p>\s*<h1>([\s\S]*?)<\/h1>\s*<p class="meta">([\s\S]*?)<\/p>/);
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
  const footerMatch = html.match(/<footer class="page-foot">\s*([\s\S]*?)\s*<\/footer>/);

  const meta = {
    ...metaDefaults,
    title: headerMatch ? htmlInlineToMd(headerMatch[2]) : metaDefaults.title,
    pageTitle: titleMatch ? htmlInlineToMd(titleMatch[1]) : metaDefaults.pageTitle,
    eyebrow: headerMatch ? htmlInlineToMd(headerMatch[1]) : metaDefaults.eyebrow,
    author: headerMatch ? htmlInlineToMd(headerMatch[3]).replace(/ · July.*/, "") : metaDefaults.author,
    date: headerMatch && headerMatch[3].includes("July") ? headerMatch[3].match(/July[^<]*/)[0] : metaDefaults.date,
    footer: footerMatch ? htmlInlineToMd(footerMatch[1]) : metaDefaults.footer,
  };

  const parts = [];
  const blockRe = /<(p|section|ul|div)[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  const chunks = [];
  let lastIdx = 0;
  const re2 = /<(p|section class="topic"|section class="bibliography"|ul class="term-list"|ul class="cluster"|div class="closing"|p class="credit"|figure class="essay-hero")[^>]*>[\s\S]*?<\/(?:p|section|ul|div|figure)>/gi;
  while ((m = re2.exec(article)) !== null) {
    chunks.push(m[0]);
  }

  for (const chunk of chunks) {
    if (chunk.includes('class="bibliography"')) {
      const h2 = chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
      parts.push(`## ${h2 ? htmlInlineToMd(h2[1]) : "Bibliography"}`, "");
      const items = [...chunk.matchAll(/<li>([\s\S]*?)<\/li>/g)];
      items.forEach((item, idx) => {
        parts.push(`${idx + 1}. ${htmlInlineToMd(item[1])}`);
      });
      parts.push("");
      continue;
    }
    if (chunk.includes('class="topic"')) {
      const h2 = chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
      if (h2) parts.push(`## ${htmlInlineToMd(h2[1])}`, "");
      const paras = [...chunk.matchAll(/<p>([\s\S]*?)<\/p>/g)];
      for (const p of paras) parts.push(htmlInlineToMd(p[1]), "");
      continue;
    }
    if (chunk.includes('class="term-list"')) {
      parts.push("::: term-list");
      for (const li of chunk.matchAll(/<li>([\s\S]*?)<\/li>/g)) {
        parts.push(`- ${htmlInlineToMd(li[1])}`);
      }
      parts.push(":::", "");
      continue;
    }
    if (chunk.includes('class="cluster"')) {
      parts.push("::: cluster");
      for (const li of chunk.matchAll(/<li>([\s\S]*?)<\/li>/g)) {
        parts.push(`- ${htmlInlineToMd(li[1])}`);
      }
      parts.push(":::", "");
      continue;
    }
    if (chunk.includes('class="closing"')) {
      parts.push("::: closing");
      for (const p of chunk.matchAll(/<p>([\s\S]*?)<\/p>/g)) {
        parts.push(htmlInlineToMd(p[1]));
      }
      parts.push(":::", "");
      continue;
    }
    if (chunk.includes('class="credit"')) {
      const p = chunk.match(/<p[^>]*>([\s\S]*?)<\/p>/);
      if (p) {
        parts.push("::: credit");
        parts.push(htmlInlineToMd(p[1]));
        parts.push(":::", "");
      }
      continue;
    }
    if (chunk.includes("essay-hero")) {
      const img = chunk.match(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i)
        || chunk.match(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*>/i);
      const cap = chunk.match(/<figcaption>([\s\S]*?)<\/figcaption>/);
      if (img) {
        const src = img[1].includes("/") ? img[1] : img[2];
        const alt = img[1].includes("/") ? img[2] : img[1];
        parts.push("::: figure");
        parts.push(`![${htmlInlineToMd(alt)}](${src})`);
        if (cap) parts.push("", htmlInlineToMd(cap[1]));
        parts.push(":::", "");
      }
      continue;
    }
    const p = chunk.match(/<p>([\s\S]*?)<\/p>/);
    if (p) parts.push(htmlInlineToMd(p[1]), "");
  }

  return stringifyFrontmatter(meta) + parts.join("\n").trim() + "\n";
}

function updateHeader(html, meta) {
  let out = html;
  if (meta.pageTitle) {
    out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.pageTitle)}</title>`);
  }
  out = out.replace(
    /<p class="eyebrow">[\s\S]*?<\/p>\s*<h1>[\s\S]*?<\/h1>\s*<p class="meta">[\s\S]*?<\/p>/,
    `<p class="eyebrow">${escapeHtml(meta.eyebrow || "")}</p>\n    <h1>${escapeHtml(meta.title || "")}</h1>\n    <p class="meta">${escapeHtml(meta.author || "")}${meta.date ? ` · ${escapeHtml(meta.date)}` : ""}</p>`,
  );
  if (meta.footer) {
    out = out.replace(
      /<footer class="page-foot">\s*[\s\S]*?\s*<\/footer>/,
      `<footer class="page-foot">\n    ${escapeHtml(meta.footer)}\n  </footer>`,
    );
  }
  return out;
}

function buildEssay(config) {
  const { meta, body } = parseFrontmatter(read(config.md));
  const articleHtml = mdToHtml(body);
  let html = read(config.html);
  html = updateHeader(html, meta);
  html = html.replace(/<article>[\s\S]*?<\/article>/, `<article>${articleHtml}</article>`);
  write(config.html, html);
  console.log(`Wrote ${config.html} from ${config.md}`);
}

function printCoverHtml(cover) {
  return `
  <section class="print-cover" aria-hidden="true">
    <p class="project">Hybrid Intelligences</p>
    <p class="tagline">Embodied Leadership and Creativity in the Era of AI</p>
    <p class="impact">A hybrid dynamic knowledge architecture of concepts, essays, visualization, conversational AI, documentation, and program materials for embodied leadership and creativity in the era of AI.</p>
    <p class="essay-label">${cover.essayLabel}</p>
    <h1>${cover.title}</h1>
    <p class="byline">${cover.byline}</p>
    <dl class="meta-grid">
      <dt>Program</dt>
      <dd>Hybrid Intelligences · Creative B Summer · July 13–30, 2026</dd>
      <dt>Institution</dt>
      <dd>University of Florida · College of the Arts (COA)</dd>
      <dt>Partners</dt>
      <dd>Center for Arts, Migration + Entrepreneurship (CAME) · Center for Arts in Medicine (CAM) · IGNITE Engineering · Wertheim Laboratory</dd>
      <dt>Co-directors</dt>
      <dd>Marlon Barrios Solano · Erika Moore</dd>
      <dt>Conceptual network, Development &amp; ontology</dt>
      <dd>Marlon Barrios Solano</dd>
      <dt>Document type</dt>
      <dd>Program essay · PDF export from the Hybrid Intelligences site</dd>
      <dt>Related materials</dt>
      <dd>Views (radial network, chord, hive, DAG, path) · Ontology (JSON-LD / Turtle / OWL) · Conversational AI (Voice) · Creative B 2026 (Canvas, slides, highlights, lobby showcase)</dd>
    </dl>
  </section>
`;
}

const PRINT_CSS = `
    .print-cover { display: none; }
    @media print {
      .theme-btn, .header-row, .header-links { display: none !important; }
      header { display: none !important; }
      footer.page-foot { display: none !important; }
      article > p:first-of-type::first-letter {
        float: none !important;
        font-size: inherit !important;
        line-height: inherit !important;
        padding: 0 !important;
        margin: 0 !important;
        color: inherit !important;
        font-weight: inherit !important;
      }
      body {
        background: #fff !important;
        color: #202430 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      article { max-width: none !important; padding: 0 !important; }
      figure.essay-hero {
        margin: 0 0 1.25rem !important;
        border: 1px solid #c8ccd6 !important;
        background: #07080c !important;
        break-inside: avoid;
      }
      figure.essay-hero img {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        max-width: 5.8in;
        margin: 0 auto;
      }
      figure.essay-hero figcaption {
        color: #5a6070 !important;
      }
      .print-cover {
        display: block !important;
        margin: 0 0 1.75rem;
        padding: 0 0 1.35rem;
        border-bottom: 1.5px solid #c8ccd6;
      }
      .print-cover .project {
        margin: 0 0 0.2rem;
        font-family: "IBM Plex Mono", monospace;
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #a8760c;
      }
      .print-cover .tagline {
        margin: 0 0 0.85rem;
        font-family: "IBM Plex Serif", Georgia, serif;
        font-size: 1.05rem;
        line-height: 1.35;
        color: #202430;
      }
      .print-cover .impact {
        margin: 0 0 1.1rem;
        font-size: 0.88rem;
        line-height: 1.45;
        color: #5a6070;
        max-width: 38rem;
      }
      .print-cover .essay-label {
        margin: 0 0 0.35rem;
        font-family: "IBM Plex Mono", monospace;
        font-size: 0.72rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #969eb0;
      }
      .print-cover h1 {
        margin: 0 0 0.55rem;
        font-family: "IBM Plex Serif", Georgia, serif;
        font-weight: 400;
        font-size: 1.65rem;
        line-height: 1.25;
        color: #12141e;
      }
      .print-cover .byline {
        margin: 0 0 1.1rem;
        font-family: "IBM Plex Mono", monospace;
        font-size: 0.82rem;
        color: #5a6070;
      }
      .print-cover .meta-grid {
        display: grid;
        grid-template-columns: 7.5rem 1fr;
        gap: 0.35rem 0.85rem;
        font-size: 0.78rem;
        line-height: 1.4;
        color: #404650;
      }
      .print-cover .meta-grid dt {
        margin: 0;
        font-family: "IBM Plex Mono", monospace;
        font-size: 0.68rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #969eb0;
      }
      .print-cover .meta-grid dd { margin: 0; }
      a.concept, a { color: inherit !important; text-decoration: none !important; border-bottom: none !important; }
      .bibliography { break-before: page; }
    }
    @page { margin: 0.7in; }
`;

function embedLocalImages(html) {
  return html.replace(/\bsrc="([^"]+)"/g, (match, src) => {
    if (/^(https?:|data:|file:)/i.test(src)) return match;
    const filePath = path.join(ROOT, src.split("?")[0]);
    if (!fs.existsSync(filePath)) return match;
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime =
      ext === "jpg" || ext === "jpeg" ? "image/jpeg"
      : ext === "png" ? "image/png"
      : ext === "svg" ? "image/svg+xml"
      : ext === "gif" ? "image/gif"
      : ext === "webp" ? "image/webp"
      : "application/octet-stream";
    return `src="data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}"`;
  });
}

function buildPdf(config) {
  const chrome =
    process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "google-chrome";
  if (!fs.existsSync(chrome) && process.platform === "darwin") {
    console.warn(`Chrome not found at ${chrome}; skipping ${config.pdf}`);
    return;
  }

  let html = read(config.html);
  html = html.replace("<body>", '<body class="light-mode">', 1);
  html = html.replace("initTheme();", 'applyTheme("light");', 1);
  if (!html.includes(".print-cover")) {
    html = html.replace("</style>", PRINT_CSS + "\n  </style>", 1);
  }
  html = html.replace("<article>", `<article>\n${printCoverHtml(config.cover)}`, 1);
  html = embedLocalImages(html);
  write(config.printHtml, html);

  const url = `file://${path.join(ROOT, config.printHtml)}`;
  const outPath = path.join(ROOT, config.pdf);
  const result = spawnSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--virtual-time-budget=8000",
      `--print-to-pdf=${outPath}`,
      url,
    ],
    { stdio: "inherit" },
  );
  fs.unlinkSync(path.join(ROOT, config.printHtml));
  if (result.status !== 0) {
    console.error(`PDF export failed for ${config.pdf}`);
  } else {
    console.log(`Wrote ${config.pdf}`);
  }
}

function extractAll() {
  const defaults = [
    {
      pageTitle: "Hybrid Intelligences, Cognitive Assemblages, and Complex Embodiment in the Era of AI",
      eyebrow: "Essay 1",
      title: "Hybrid Intelligences, Cognitive Assemblages, and Complex Embodiment in the Era of AI",
      author: "Marlon Barrios Solano",
      date: "July 10, 2026",
      footer: "Hybrid Intelligences · University of Florida · Essay 1",
      output: "essay.html",
      pdf: "essay-1-hybrid-intelligences-cognitive-assemblages.pdf",
      otherEssay: "essay-2.html",
      otherEssayLabel: "Essay 2",
    },
    {
      pageTitle: "Hybrid Intelligences — Essay 2",
      eyebrow: "Essay 2",
      title: "My Umwelt",
      author: "Marlon Barrios Solano, in conversation with GPT-5.5",
      date: "July 20, 2026",
      footer: "Hybrid Intelligences · University of Florida · Essay 2",
      output: "essay-2.html",
      pdf: "essay-2-my-umwelt.pdf",
      otherEssay: "essay.html",
      otherEssayLabel: "Essay 1",
    },
    {
      pageTitle: "Hybrid Intelligences: Ontology, Knowledge Graph, and Cognitive Assemblage",
      eyebrow: "Essay 3",
      title: "Hybrid Intelligences: Ontology, Knowledge Graph, and Cognitive Assemblage",
      author: "Marlon Barrios Solano",
      date: "September 2, 2026",
      footer: "Hybrid Intelligences · University of Florida · Essay 3",
      output: "essay-3.html",
      pdf: "essay-3-ontology-knowledge-graph.pdf",
      otherEssay: "essay.html",
      otherEssayLabel: "Essay 1",
    },
  ];
  ESSAYS.forEach((cfg, idx) => {
    const md = htmlToMd(cfg.html, defaults[idx]);
    write(cfg.md, md);
    console.log(`Extracted ${cfg.md}`);
  });
}

function buildAll(withPdf) {
  for (const cfg of ESSAYS) {
    buildEssay(cfg);
  }
  if (withPdf) {
    for (const cfg of ESSAYS) {
      buildPdf(cfg);
    }
  }
}

const args = process.argv.slice(2);
if (args.includes("--extract")) {
  extractAll();
} else {
  buildAll(args.includes("--pdf"));
}
