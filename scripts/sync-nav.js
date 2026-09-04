#!/usr/bin/env node
/**
 * Ensure main header nav lists Videos immediately after all essay links.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ESSAYS_LINE = '        <a href="essays.html">Essays</a>';
const VIDEOS_LINE = '        <a href="videos.html">Videos</a>';

function isEssayNavLine(line) {
  return (
    /href="essays\.html"/.test(line) ||
    /href="essay(-\d+)?\.html"/.test(line) ||
    /href="essay\.html"/.test(line) ||
    (/\.pdf"/.test(line) && /download/.test(line))
  );
}

function fixHeaderLinks(html) {
  const re = /(<(?:div|nav)[^>]*class="header-links"[^>]*>\s*)([\s\S]*?)(\s*<\/(?:div|nav)>)/;
  const match = html.match(re);
  if (!match) return html;

  const [full, open, inner, close] = match;
  const lines = inner.split("\n").filter((l) => l.trim());
  const navLines = lines.filter((l) => l.includes("<a href=") || l.includes("<button"));

  let filtered = navLines.filter((l) => !l.includes('href="videos.html"'));

  if (!filtered.some((l) => l.includes('href="essays.html"'))) {
    const aboutIdx = filtered.findIndex((l) => l.includes('href="about.html"'));
    const at = aboutIdx >= 0 ? aboutIdx + 1 : 0;
    filtered.splice(at, 0, ESSAYS_LINE);
  }

  let insertAt = 0;
  filtered.forEach((line, i) => {
    if (isEssayNavLine(line)) insertAt = i + 1;
  });
  if (insertAt === 0) {
    const essaysIdx = filtered.findIndex((l) => l.includes('href="essays.html"'));
    insertAt = essaysIdx >= 0 ? essaysIdx + 1 : filtered.length;
  }

  if (!filtered.some((l) => l.includes('href="videos.html"'))) {
    filtered.splice(insertAt, 0, VIDEOS_LINE);
  }

  const rebuilt = open + filtered.join("\n") + close;
  return html.replace(full, rebuilt);
}

let changed = 0;
for (const name of fs.readdirSync(ROOT)) {
  if (!name.endsWith(".html")) continue;
  const file = path.join(ROOT, name);
  const before = fs.readFileSync(file, "utf8");
  const after = fixHeaderLinks(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
    console.log("Updated", name);
  }
}
console.log(`Done. Updated ${changed} HTML files.`);
