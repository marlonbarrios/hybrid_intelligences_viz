# Hybrid Intelligences

**Conceptual network visualization** by [Marlon Barrios Solano](https://marlonbarrios.github.io/)

Interactive map for **Hybrid Intelligences: Embodied Creative Leadership in the Era of AI** — a Creative B program at the University of Florida (CAME · CAM · IGNITE · Wertheim Laboratory · July 13–30, 2026).

**[Open visualization →](index.html)**

![Hybrid Intelligences conceptual network — dark theme, node detail panel](hybrid-network-screenshot.png)

---

## Description

Concepts, authors, frameworks, practices, domains, and facilitators from the program are placed on concentric rings and connected by weighted edges. Hover the legend to focus a category; click any node to read its description and follow outbound links. The graph uses soft physics—nodes drift, collide, and spring back when released.

Categories: **Program · Premise · Framework · Qualities · Phenomena · Domains · Practices · Facilitators · Authors · Tensions**

---

## Controls

| Input | Action |
|-------|--------|
| **Hover legend** | Highlight one category (crossfade in/out) |
| **Click node** | Select; detail panel at bottom left |
| **Drag node** | Reposition temporarily |
| **A** | Animate — cycle categories every 4 seconds |
| **R** | Reset layout |
| **T** | Dark / light theme |

---

## Local development

Serve the folder over HTTP:

```bash
git clone https://github.com/marlonbarrios/hybrid_intelligences_viz.git
cd hybrid_intelligences_viz
python3 -m http.server 8000
```

Open [http://localhost:8000/](http://localhost:8000/)

Or use the **Live Server** extension in VS Code / Cursor on `index.html`.

---

## Files

| File | Role |
|------|------|
| `index.html` | Page shell, fonts, theme background |
| `hybrid-network.js` | Nodes, edges, layout, draw loop, interaction |
| `hybrid-network-screenshot.png` | README preview image |

---

## Credits

- **Conceptual network:** Marlon Barrios Solano  
- **Program:** co-directed with Erika Moore; CAME, CAM, IGNITE, Wertheim Lab — UF College of the Arts  
- **Built with:** [p5.js](https://p5js.org/)

---

## License

MIT License

Copyright (c) 2024 Marlon Barrios Solano

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
