(function (global) {
  function pdfSafe(text) {
    return String(text)
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013/g, "-")
      .replace(/\u2014/g, "--")
      .replace(/\u2026/g, "...")
      .replace(/\u00A0/g, " ")
      .replace(/\u00B7/g, "-")
      .replace(/[^\x20-\x7E]/g, "?");
  }

  function pdfString(text) {
    return "(" + pdfSafe(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)") + ")";
  }

  function wrapWords(text, maxChars) {
    const raw = pdfSafe(text).replace(/\s+/g, " ").trim();
    if (!raw) return [];
    const words = raw.split(" ");
    const lines = [];
    let cur = "";
    for (const word of words) {
      const next = cur ? cur + " " + word : word;
      if (next.length > maxChars && cur) {
        lines.push(cur);
        cur = word;
      } else {
        cur = next;
      }
      while (cur.length > maxChars) {
        lines.push(cur.slice(0, maxChars));
        cur = cur.slice(maxChars);
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function buildCardPdf(opts) {
    const layer = opts.layer || "Card";
    const conceptLabel = opts.conceptLabel || "";
    const conceptCategory = opts.conceptCategory || "";
    const conceptDefinition = opts.conceptDefinition || "";
    const body = opts.body || "";
    const meta = opts.meta || "";
    const stamp = opts.stamp || "";

    const left = 54;
    const floor = 56;
    const startY = 730;
    const pages = [];
    let ops = [];
    let y = startY;

    function flushPage() {
      if (ops.length) pages.push(ops);
      ops = [];
      y = startY;
    }

    function writeLine(text, size, bold, gap) {
      if (!text) return;
      if (y - gap < floor) flushPage();
      ops.push("BT");
      ops.push("/" + (bold ? "F2" : "F1") + " " + size + " Tf");
      ops.push(left + " " + y + " Td");
      ops.push(pdfString(text) + " Tj");
      ops.push("ET");
      y -= gap;
    }

    writeLine("Hybrid Intelligences", 16, true, 20);
    writeLine(layer, 11, false, 16);
    if (conceptLabel) writeLine(conceptLabel, 13, true, 16);
    if (conceptCategory) writeLine(conceptCategory, 10, false, 14);
    if (meta) writeLine(meta, 10, false, 14);
    if (stamp) writeLine(stamp, 9, false, 14);
    ops.push(left + " " + y + " m");
    ops.push("558 " + y + " l S");
    y -= 18;
    if (conceptDefinition) {
      wrapWords(conceptDefinition, 92).slice(0, 6).forEach((line) => writeLine(line, 9, false, 12));
      y -= 6;
    }
    wrapWords(body, 88).forEach((line) => writeLine(line, 12, false, 16));
    flushPage();

    const count = pages.length;
    const footer = "Hybrid Intelligences · University of Florida · " + layer;
    const streams = pages.map((pageOps, i) =>
      pageOps
        .concat([
          "BT",
          "/F1 8 Tf",
          left + " 40 Td",
          pdfString(footer) + " Tj",
          "ET",
          "BT",
          "/F1 8 Tf",
          "520 40 Td",
          pdfString(i + 1 + " / " + count) + " Tj",
          "ET",
        ])
        .join("\n")
    );

    const obj = [];
    obj[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    obj[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
    obj[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
    let next = 5;
    const kids = [];
    streams.forEach((stream) => {
      const pageNum = next;
      const contentNum = next + 1;
      kids.push(pageNum + " 0 R");
      obj[pageNum] =
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents " +
        contentNum +
        " 0 R >>";
      obj[contentNum] = "<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream";
      next += 2;
    });
    obj[2] = "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + streams.length + " >>";

    let out = "%PDF-1.4\n";
    const offsets = [0];
    for (let i = 1; i < next; i++) {
      offsets[i] = out.length;
      out += i + " 0 obj\n" + obj[i] + "\nendobj\n";
    }
    const xrefPos = out.length;
    out += "xref\n0 " + next + "\n0000000000 65535 f \n";
    for (let i = 1; i < next; i++) {
      out += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    }
    out += "trailer\n<< /Size " + next + " /Root 1 0 R >>\nstartxref\n" + xrefPos + "\n%%EOF\n";
    return out;
  }

  function downloadPdf(opts) {
    const body = String(opts.body || "").trim();
    if (!body) throw new Error("Nothing to save yet.");
    const when = new Date();
    const stamp = when.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
    const fileStamp = when.toISOString().slice(0, 10);
    const slug = String(opts.slug || opts.conceptId || opts.layer || "card")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "card";
    const pdf = buildCardPdf(Object.assign({}, opts, { stamp }));
    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hybrid-intelligences-" + slug + "-" + fileStamp + ".pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  function loadHtml2Canvas() {
    return new Promise(function (resolve, reject) {
      if (global.html2canvas) return resolve(global.html2canvas);
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
      s.async = true;
      s.onload = function () {
        if (global.html2canvas) resolve(global.html2canvas);
        else reject(new Error("Could not load image export."));
      };
      s.onerror = function () {
        reject(new Error("Could not load image export."));
      };
      document.head.appendChild(s);
    });
  }

  async function downloadPng(element, filename) {
    if (!element) throw new Error("Nothing to capture.");
    const html2canvas = await loadHtml2Canvas();
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: Math.min(2, global.devicePixelRatio || 1.5),
      useCORS: true,
    });
    const blob = await new Promise(function (resolve, reject) {
      canvas.toBlob(function (b) {
        if (b) resolve(b);
        else reject(new Error("Could not create image."));
      }, "image/png");
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "hybrid-intelligences-card.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  global.HiCardExport = {
    buildCardPdf,
    downloadPdf,
    downloadPng,
    loadHtml2Canvas,
  };
})(window);
