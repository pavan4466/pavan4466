import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { color as C, line as L, font, size as Z, space, motion } from "./design-tokens.mjs";
import {
  profile,
  aboutFacts,
  experience,
  projects,
  toolkit,
  certifications,
  achievements,
  openTo,
  milestones,
} from "./content.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "assets");
const DATA = path.join(ROOT, "data", "contributions.json");
const W = Z.sheet;

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function baseStyle(extra = "") {
  const delay = (step) => `${(motion.stagger * step).toFixed(2)}s`;
  return `
    text { font-family: ${font.sans}; }
    .nums { font-variant-numeric: tabular-nums; }
    .rise { animation: rise ${motion.rise} ${motion.ease} both; }
    .d1 { animation-delay: ${delay(1)}; } .d2 { animation-delay: ${delay(2)}; }
    .d3 { animation-delay: ${delay(3)}; } .d4 { animation-delay: ${delay(4)}; }
    .d5 { animation-delay: ${delay(5)}; } .d6 { animation-delay: ${delay(6)}; }
    .pulse { animation: pulse ${motion.pulse} ${motion.ease} infinite; }
    .draw { animation: draw ${motion.draw} ${motion.ease} both; }
    .slide { animation: slide ${motion.slide} ${motion.ease} both; }
    .grow { animation: grow ${motion.grow} ${motion.ease} both; }
    .countup { animation: countUp ${motion.countUp} ${motion.ease} both; }
    .shimmer { animation: shimmer ${motion.shimmer} linear infinite; }
    @keyframes rise { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes draw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
    @keyframes slide { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes grow { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); transform-origin: left; } }
    @keyframes countUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shimmer {
      0% { opacity: 0.3; }
      50% { opacity: 1; }
      100% { opacity: 0.3; }
    }
    ${extra}
    @media (prefers-reduced-motion: reduce) {
      .rise, .pulse, .draw, .slide, .grow, .countup, .shimmer {
        animation: none !important; opacity: 1 !important; transform: none !important;
      }
      .scan { display: none !important; }
    }
  `;
}

function svgDoc({ width = W, height, title, desc, body, extraStyle = "" }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="sheet-title sheet-desc">
<title id="sheet-title">${esc(title)}</title>
<desc id="sheet-desc">${esc(desc)}</desc>
<style>${baseStyle(extraStyle)}</style>
<rect width="${width}" height="${height}" fill="${C.ink}"/>
${body}
</svg>
`;
}

function text(x, y, value, opts = {}) {
  const {
    size = Z.body,
    fill = C.bone,
    weight = 400,
    anchor = "start",
    opacity = 1,
    spacing = 0,
    cls = "",
  } = opts;
  const attrs = [
    `x="${x}"`,
    `y="${y}"`,
    `font-size="${size}"`,
    `font-weight="${weight}"`,
    `fill="${fill}"`,
    `text-anchor="${anchor}"`,
    spacing ? `letter-spacing="${spacing}"` : "",
    opacity !== 1 ? `opacity="${opacity}"` : "",
    cls ? `class="${cls}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<text ${attrs}>${esc(value)}</text>`;
}

function textLines(x, y, lines, opts = {}) {
  const lineHeight = opts.lineHeight ?? 30;
  return lines.map((line, i) => text(x, y + i * lineHeight, line, opts)).join("\n");
}

function micro(x, y, value, opts = {}) {
  return text(x, y, String(value).toUpperCase(), {
    size: Z.micro,
    fill: C.muted,
    spacing: 1.1,
    ...opts,
  });
}

function rule(x1, y, x2, opacity = L.hair) {
  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${C.bone}" stroke-opacity="${opacity}" stroke-width="1"/>`;
}

function vrule(x, y1, y2, opacity = L.hair) {
  return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${C.bone}" stroke-opacity="${opacity}" stroke-width="1"/>`;
}

function accentBar(x, y, width = 96, height = 3) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${C.accent}"/>`;
}

function panel(x, y, width, height, fill = C.panel) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
}

function statsRow(y) {
  return profile.stats
    .map((stat, i) => {
      const x = 64 + i * 188;
      return `${i > 0 ? vrule(x - 30, y - 34, y + 32) : ""}
${text(x, y, stat.value, { size: 46, weight: 700, cls: "nums" })}
${text(x, y + 24, stat.label, { size: Z.label, fill: C.muted })}`;
    })
    .join("\n");
}

function dashPath(length) {
  return `stroke-dasharray="${length}" stroke-dashoffset="${length}"`;
}

function drawLine(x1, y1, x2, y2, color = C.bone, opacity = L.structural, delay = 0, cls = "draw") {
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const style = `animation-delay: ${delay}s;`;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1" ${dashPath(length)} style="${style}" class="${cls}"/>`;
}

function drawRect(x, y, width, height, color = C.bone, opacity = L.structural, delay = 0, cls = "draw") {
  const perimeter = 2 * (width + height);
  const style = `animation-delay: ${delay}s;`;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1" ${dashPath(perimeter)} style="${style}" class="${cls}"/>`;
}

function growBar(x, y, width, height, color = C.accent, delay = 0, cls = "grow") {
  const style = `animation-delay: ${delay}s; transform-origin: left;`;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color}" style="${style}" class="${cls}"/>`;
}

function countUpText(x, y, value, opts = {}, delay = 0, cls = "countup") {
  const style = `animation-delay: ${delay}s;`;
  return text(x, y, value, { ...opts, style, cls: `${opts.cls ? opts.cls + " " : ""}${cls}` });
}

const portraitBase64 = fs
  .readFileSync(path.join(ASSETS, "portrait.jpg"))
  .toString("base64");

function hero() {
  const height = 600;
  const body = `
<defs>
  <filter id="duotone" color-interpolation-filters="sRGB">
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer>
      <feFuncR type="linear" slope="0.871" intercept="0.039"/>
      <feFuncG type="linear" slope="0.780" intercept="0.106"/>
      <feFuncB type="linear" slope="0.651" intercept="0.180"/>
    </feComponentTransfer>
    <animate attributeName="values" dur="8s" repeatCount="indefinite"
      values="0; 0.3; 0; 0.3; 0"
      keyTimes="0; 0.25; 0.5; 0.75; 1"
      calcMode="spline"
      keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"/>
  </filter>
  <clipPath id="photoClip"><rect x="756" y="88" width="364" height="394"/></clipPath>
</defs>
<rect x="0" y="0" width="8" height="${height}" fill="${C.accent}"/>
${micro(64, 44, "Portfolio / profile")}
${micro(1136, 44, `${profile.location} · ${profile.coordinates}`, { anchor: "end" })}
${drawLine(64, 64, 1136, 64, C.bone, L.structural, 0.2)}

<g class="rise">
  ${text(64, 132, `${profile.role.toUpperCase()} · SQL · POWER BI · PYTHON`, { size: 16, fill: C.muted, spacing: 0.4 })}
  ${text(58, 252, profile.displayName.toUpperCase(), { size: 118, weight: 700, spacing: -4 })}
  ${text(64, 318, profile.displayName2.toUpperCase(), { size: 54, weight: 700, spacing: -1 })}
</g>
<g class="rise d1">
  ${textLines(64, 378, profile.claim, { size: 28, lineHeight: 34 })}
</g>
<g class="rise d2">
  ${micro(64, 452, profile.availability, { fill: C.accent, spacing: 1.2 })}
  ${statsRow(512)}
</g>

<g class="rise d2">
  ${panel(740, 72, 396, 470)}
  <rect x="740" y="72" width="396" height="4" fill="${C.accent}"/>
  <image href="data:image/jpeg;base64,${portraitBase64}" x="756" y="88" width="364" height="394" preserveAspectRatio="xMidYMid slice" filter="url(#duotone)" clip-path="url(#photoClip)"/>
  ${drawRect(756, 88, 364, 394, C.bone, L.structural, 0.8)}
  ${vrule(728, 88, 482, L.hair)}
  <line x1="722" y1="88" x2="734" y2="88" stroke="${C.bone}" stroke-opacity="${L.structural}"/>
  <line x1="722" y1="482" x2="734" y2="482" stroke="${C.bone}" stroke-opacity="${L.structural}"/>
  ${micro(756, 512, "Vinjamuri Pavan Mallesh", { fill: C.bone, spacing: 0.8 })}
  ${text(756, 530, `${profile.role} · Hyderabad, India`, { size: 12.5, fill: C.muted })}
</g>

${drawLine(64, 556, 1136, 556, C.bone, L.structural, 1.0)}
${vrule(540, 556, 600)}
${vrule(800, 556, 600)}
${vrule(990, 556, 600)}
${micro(64, 582, "Subject / profile 2026", { spacing: 0.9 })}
${micro(560, 582, `Sheet 00 / ${String(SHEET_TOTAL).padStart(2, "0")}`, { spacing: 0.9 })}
${micro(820, 582, "Rev 2026-10", { spacing: 0.9 })}
${micro(1010, 582, "Blueprint", { spacing: 0.9 })}
`;
  return svgDoc({
    height,
    title: "Pavan Mallesh Vinjamuri — data analyst profile blueprint",
    desc: `${profile.name}, data analyst in Hyderabad. ${profile.claim.join(" ")} Four analytics projects, three roles across analytics, outreach, and data preparation, CGPA 8.2 out of 10. Open to Data Analyst and BI Analyst roles.`,
    body,
  });
}

const titleSheets = [
  {
    file: "title-01-about.svg",
    num: "01",
    title: "About",
    claim: "An analyst trained on messy, real-world data.",
    desc: "Section 01, About: an analyst trained on messy, real-world data.",
  },
  {
    file: "title-02-field-log.svg",
    num: "02",
    title: "Field log",
    claim: "Three roles, each with something to show.",
    desc: "Section 02, Field log: three roles, each with proof.",
  },
  {
    file: "title-03-work.svg",
    num: "03",
    title: "Selected work",
    claim: "Three shipped projects. One in build.",
    desc: "Section 03, Selected work: three shipped projects and one in build.",
  },
  {
    file: "title-04-toolkit.svg",
    num: "04",
    title: "Toolkit",
    claim: "SQL first. Then the tools that explain it.",
    desc: "Section 04, Toolkit: SQL first, then the tools that explain it.",
  },
  {
    file: "title-05-build-log.svg",
    num: "05",
    title: "Build log",
    claim: "Twelve months of activity, plotted from live data.",
    desc: "Section 05, Build log: twelve months of GitHub activity plotted from live data.",
  },
  {
    file: "title-06-credentials.svg",
    num: "06",
    title: "Credentials",
    claim: "Certified, recommended, and still building.",
    desc: "Section 06, Credentials: certified, recommended, and still building.",
  },
  {
    file: "title-07-connect.svg",
    num: "07",
    title: "Connect",
    claim: "Open to analyst roles across data and business.",
    desc: "Section 07, Connect: open to analyst roles across data and business.",
  },
];

const SHEET_TOTAL = titleSheets.length + 1;

function titleSheet(item) {
  const height = 110;
  const body = `
${micro(1136, 34, `Sheet ${item.num} / ${String(SHEET_TOTAL).padStart(2, "0")}`, { anchor: "end", spacing: 0.9 })}
<g class="rise">
  ${text(64, 86, item.num, { size: Z.sectionNumber, weight: 700, fill: C.accent, cls: "nums" })}
  ${text(152, 82, item.title, { size: Z.section, weight: 700 })}
</g>
<g class="rise d1">
  ${text(1136, 76, item.claim, { size: 16, fill: C.muted, anchor: "end" })}
</g>
<g class="rise d2">
  ${growBar(64, 98, 88, 3, C.accent, 0.3)}
</g>
`;
  return svgDoc({
    height,
    title: `${item.num} ${item.title} — ${item.claim}`,
    desc: item.desc,
    body,
  });
}

function about() {
  const height = 480;
  const body = `
<g class="rise">
  ${text(64, 74, "I like the messy part:", { size: 34, weight: 700 })}
  ${text(64, 114, "cleaning until the pattern shows.", { size: 34, weight: 700 })}
</g>
<g class="rise d1">
  ${textLines(64, 170, wrap(profile.summary[0], 68), { size: 19, lineHeight: 30, fill: C.bone })}
</g>
<g class="rise d2">
  ${textLines(64, 292, wrap(profile.summary[1], 68), { size: 19, lineHeight: 30, fill: C.bone })}
</g>
<g class="rise d3">
  ${micro(64, 414, "Focus", { spacing: 1.1 })}
  ${text(64, 438, profile.focus, { size: 15, fill: C.bone })}
</g>

<g class="rise d2">
  ${panel(792, 40, 344, 368)}
  <rect x="792" y="40" width="344" height="4" fill="${C.accent}"/>
  ${micro(816, 76, "Subject record", { spacing: 1 })}
  ${aboutFactRows()}
</g>
`;
  return svgDoc({
    height,
    title: "About Pavan Mallesh Vinjamuri",
    desc: "Aspiring data analyst with hands-on experience in SQL, Python, Power BI, Tableau and Excel. Education: B.Tech CSE in Data Science at St. Ann's College of Engineering and Technology, graduating 2026, CGPA 8.2. Based in Hyderabad, open to analyst roles.",
    body,
  });
}

function aboutFactRows() {
  const rows = [];
  let y = 112;
  aboutFacts.forEach((fact, index) => {
    rows.push(micro(816, y, fact.label, { spacing: 1 }));
    rows.push(
      text(816, y + 22, fact.value, {
        size: 15.5,
        fill: fact.accent ? C.accent : C.bone,
        weight: 600,
      }),
    );
    if (fact.note) {
      rows.push(text(816, y + 42, fact.note, { size: Z.micro, fill: C.muted }));
    }
    if (index < aboutFacts.length - 1) {
      rows.push(rule(816, y + (fact.note ? 62 : 42), 1112, L.hair));
    }
    y += fact.note ? 76 : 56;
  });
  return rows.join("\n");
}

function fieldLog() {
  let cursor = 108;
  const rows = experience
    .map((entry, index) => {
      const top = cursor;
      const periodColor = entry.current ? C.accent : C.bone;
      let bulletY = top + 82;
      const bullets = entry.bullets
        .map((bullet) => {
          const lines = wrap(bullet, 64);
          const markup = textLines(248, bulletY, lines, {
            size: Z.bullet,
            lineHeight: 25,
            fill: C.bone,
          });
          bulletY += lines.length * 25 + 8;
          return markup;
        })
        .join("\n");
      const bulletsBottom = bulletY - 8;
      cursor = bulletsBottom + 52;
      return `<g class="rise d${Math.min(index + 1, 4)}">
  ${text(64, top + 26, entry.period, { size: 14, fill: periodColor, weight: 600 })}
  ${text(64, top + 48, entry.place, { size: 12.5, fill: C.muted })}
  ${text(248, top + 26, entry.role, { size: 27, weight: 700 })}
  ${text(248, top + 52, entry.company, { size: 16, fill: C.muted })}
  ${bullets}
  ${micro(820, top + 26, entry.proofLabel, { spacing: 1 })}
  ${text(820, top + 58, entry.proof, { size: 20, weight: 600 })}
  ${text(820, top + 84, entry.proofNote, { size: 13, fill: C.muted })}
  ${index < experience.length - 1 ? rule(64, bulletsBottom + 24, 1136, L.hair) : ""}
</g>`;
    })
    .join("\n");
  const footerY = cursor - 18;
  const height = footerY + 52;
  const body = `
${text(64, 64, "Analytics, reporting, and data preparation — in the order it happened.", { size: 19, fill: C.muted })}
${rule(64, 88, 1136)}
${vrule(220, 108, footerY - 22)}
${rows}
${rule(64, footerY, 1136, L.hair)}
${micro(64, footerY + 22, "Source / resume · roles and outcomes as listed", { spacing: 0.9 })}
`;
  return svgDoc({
    height,
    title: "Field log — experience",
    desc: "Three roles: Campus Mantri at GeeksforGeeks from January 2026, Data Analytics Intern at SmartBridge from December 2025 to March 2026, and Intern at AIMERS from May to July 2024. Proof points include a Letter of Recommendation, three or more KPI dashboards, and over one thousand records analyzed.",
    body,
  });
}

function projectSheet(project) {
  const height = 400;
  const right = projectFinding(project);
  const bullets = project.bullets.flatMap((bullet) => wrap(bullet, 66));
  const body = `
${micro(64, 40, `Project ${project.number} / 04`, { spacing: 1 })}
${micro(1136, 40, project.meta, { anchor: "end", spacing: 0.8 })}
${text(64, 88, project.title, { size: 40, weight: 700 })}
${rule(64, 110, 1136, L.structural)}

${micro(64, 144, "Goal", { spacing: 1 })}
${textLines(64, 174, wrap(project.goal, 46), { size: 22, fill: C.bone, lineHeight: 28 })}

${micro(64, 244, "What I did", { spacing: 1 })}
${textLines(64, 272, bullets, { size: Z.bullet, fill: C.bone, lineHeight: 25 })}

${panel(736, 40, 400, 300)}
<rect x="736" y="40" width="400" height="4" fill="${C.accent}"/>
${right}

${rule(64, 368, 1136, L.hair)}
${micro(64, 388, "Stack", { spacing: 1 })}
${text(124, 388, project.stack.join(" · "), { size: Z.micro, fill: C.muted })}
${micro(
  1136,
  388,
  project.repo ? `Repository / ${project.repoLabel}` : "Status / in build",
  { anchor: "end", spacing: 0.8, fill: project.repo ? C.muted : C.accent },
)}
`;
  return svgDoc({
    height,
    title: `${project.title} — project ${project.number}`,
    desc: `${project.title}. ${project.goal} ${project.bullets.join(" ")} Stack: ${project.stack.join(", ")}.`,
    body,
  });
}

function projectFinding(project) {
  if (project.findingType === "bar") {
    const barWidth = (352 * project.findingValue) / 100;
    return `
${micro(760, 72, "Finding", { spacing: 1 })}
${countUpText(760, 140, `~${project.findingValue}%`, { size: 64, weight: 700, fill: C.accent, cls: "nums" }, 0.5)}
${textLines(760, 172, wrap(project.findingLabel, 46), { size: 15, fill: C.bone, lineHeight: 21, cls: "slide", style: "animation-delay: 0.6s;" })}
<rect x="760" y="226" width="352" height="10" fill="${C.panelHigh}"/>
${growBar(760, 226, barWidth, 10, C.accent, 0.7)}
${text(760, 252, "0", { size: 10.5, fill: C.dim })}
${text(1112, 252, "100%", { size: 10.5, fill: C.dim, anchor: "end" })}
${text(760, 286, "Share of price variance explained", { size: 12, fill: C.muted, cls: "slide", style: "animation-delay: 0.8s;" })}
`;
  }
  if (project.findingType === "leaders") {
    return `
${micro(760, 72, "Finding / genre leaders", { spacing: 1 })}
${project.leaders
  .map((leader, index) => {
    const y = 120 + index * 60;
    const delay = 0.5 + index * 0.1;
    return `${text(760, y, leader.label, { size: Z.micro, fill: C.muted, spacing: 0.8, cls: "slide", style: `animation-delay: ${delay}s;` })}
${text(760, y + 26, leader.value, { size: 26, weight: 600, cls: "slide", style: `animation-delay: ${delay + 0.05}s;` })}
${index < project.leaders.length - 1 ? drawLine(760, y + 42, 1112, y + 42, C.bone, L.hair, delay + 0.1) : ""}`;
  })
  .join("\n")}
${text(760, 306, "Three outcomes, three different leaders.", { size: 12, fill: C.muted, cls: "slide", style: "animation-delay: 0.8s;" })}
`;
  }
  if (project.findingType === "schema") {
    return `
${micro(760, 72, "Relationship map", { spacing: 1 })}
${drawRect(812, 92, 248, 34, C.bone, L.hair, 0.4)}
${text(936, 114, "COUNTRY", { size: 13, fill: C.bone, anchor: "middle", spacing: 1, cls: "slide", style: "animation-delay: 0.5s;" })}
${drawLine(936, 126, 936, 150, C.bone, L.hair, 0.5)}
${drawLine(856, 150, 1016, 150, C.bone, L.hair, 0.55)}
${schemaNode(786, 168, "ENERGY", 0.6)}
${schemaNode(946, 168, "EMISSIONS", 0.65)}
${schemaNode(786, 222, "GDP", 0.7)}
${schemaNode(946, 222, "POPULATION", 0.75)}
${drawLine(856, 150, 856, 168, C.bone, L.hair, 0.55)}
${drawLine(1016, 150, 1016, 168, C.bone, L.hair, 0.55)}
${drawLine(856, 202, 856, 222, C.bone, L.hair, 0.7)}
${drawLine(1016, 202, 1016, 222, C.bone, L.hair, 0.7)}
${textLines(760, 288, wrap("Country-level joins across energy, emissions, GDP, and population.", 54), { size: 12, fill: C.muted, lineHeight: 16, cls: "slide", style: "animation-delay: 0.8s;" })}
`;
  }
  return `
${micro(760, 72, "Workflow", { spacing: 1 })}
${pipelineNode(760, 100, "RAW DATA", false, 0.4)}
${pipelineNode(760, 152, "CLEAN + TRANSFORM", false, 0.5)}
${pipelineNode(760, 204, "SQL MODEL", false, 0.6)}
${pipelineNode(760, 256, "POWER BI REPORT", true, 0.7)}
${drawRect(1004, 300, 108, 26, C.accent, 1, 0.8)}
${text(1058, 317, "IN BUILD", { size: 11, fill: C.accent, anchor: "middle", spacing: 1.2, cls: "pulse", style: "animation-delay: 0.9s;" })}
`;
}

function schemaNode(x, y, label, delay = 0) {
  return `${drawRect(x, y, 140, 34, C.bone, L.structural, delay)}
${text(x + 70, y + 21, label, { size: 11.5, fill: C.bone, anchor: "middle", spacing: 0.8, cls: "slide", style: `animation-delay: ${delay + 0.1}s;` })}`;
}

function pipelineNode(x, y, label, accent = false, delay = 0) {
  const next = y + 34;
  return `${drawRect(x, y, 352, 34, accent ? C.accent : C.bone, accent ? 1 : L.hair, delay)}
${text(x + 18, y + 22, label, { size: 12, fill: accent ? C.accent : C.bone, spacing: 0.9, cls: "slide", style: `animation-delay: ${delay + 0.1}s;` })}
${drawLine(x + 176, next, x + 176, next + 18, C.bone, L.hair, delay + 0.15)}`;
}

function toolkitSheet() {
  const height = 520;
  const rows = toolkit
    .map((group, index) => {
      const top = 150 + index * 80;
      const toolLines = group.tools.length > 4
        ? [group.tools.slice(0, 3).join(" / "), group.tools.slice(3).join(" / ")]
        : [group.tools.join(" / ")];
      const delay = 0.3 + index * 0.12;
      return `<g class="rise d${Math.min(index + 1, 4)}" style="animation-delay: ${delay}s;">
  ${growBar(213, top + 2, 6, 6, C.accent, delay)}
  ${text(64, top + 8, group.category, { size: 24, weight: 700, cls: "slide", style: `animation-delay: ${delay + 0.1}s;` })}
  ${textLines(248, top + 8, toolLines, { size: 20, weight: 600, lineHeight: 26, cls: "slide", style: `animation-delay: ${delay + 0.15}s;` })}
  ${textLines(680, top + 8, wrap(group.note, 54), { size: 15, fill: C.muted, lineHeight: 21, cls: "slide", style: `animation-delay: ${delay + 0.2}s;` })}
</g>`;
    })
    .join("\n");
  const body = `
${text(64, 64, "Four groups. One job: make the data explain itself.", { size: 19, fill: C.muted, cls: "slide" })}
${drawLine(64, 88, 1136, 88, C.bone, L.structural, 0.2)}
${micro(64, 124, "Group", { spacing: 1, cls: "slide", style: "animation-delay: 0.3s;" })}
${micro(248, 124, "Tools", { spacing: 1, cls: "slide", style: "animation-delay: 0.3s;" })}
${micro(680, 124, "Where I use it", { spacing: 1, cls: "slide", style: "animation-delay: 0.3s;" })}
${drawLine(216, 150, 216, 588, C.bone, L.hair, 0.4)}
${rows}
${drawLine(64, 470, 1136, 470, C.bone, L.hair, 0.9)}
${text(64, 496, "Primary stack: SQL and Power BI. Python for cleaning and EDA; Tableau and Excel for reporting.", { size: 15, fill: C.muted, cls: "slide", style: "animation-delay: 1.0s;" })}
`;
  return svgDoc({
    height,
    title: "Toolkit — SQL, Power BI, Python, Tableau",
    desc: "Toolkit groups: Query, with SQL and MySQL for joins and aggregations; BI, with Power BI, Tableau and Excel for KPI dashboards and reporting; Python, with pandas, NumPy, Matplotlib, Seaborn and BeautifulSoup for cleaning and EDA; Workflow, with ETL, data modeling and KPI reporting.",
    body,
  });
}

function getContributionData() {
  if (!fs.existsSync(DATA)) {
    throw new Error(`Missing ${DATA}. Run scripts/fetch-contributions.mjs first.`);
  }
  return JSON.parse(fs.readFileSync(DATA, "utf8"));
}

function contributionStats(data) {
  const days = data.weeks.flatMap((week) => week.contributionDays);
  let active = 0;
  let longest = 0;
  let run = 0;
  let busiest = { count: 0, date: "" };
  for (const day of days) {
    if (day.contributionCount > 0) {
      active += 1;
      run += 1;
      longest = Math.max(longest, run);
      if (day.contributionCount > busiest.count) {
        busiest = { count: day.contributionCount, date: day.date };
      }
    } else {
      run = 0;
    }
  }
  return { total: data.totalContributions, active, longest, busiest };
}

function formatDate(iso) {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function monthLabels(weeks) {
  const labels = [];
  let lastMonth = "";
  let lastX = -100;
  weeks.forEach((week, index) => {
    const first = week.contributionDays.find((day) => day.date);
    if (!first) return;
    const month = new Date(`${first.date}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const x = 96 + index * 14;
    if (month !== lastMonth && x - lastX > 34) {
      labels.push({ x, month });
      lastX = x;
      lastMonth = month;
    }
  });
  return labels;
}

function levelColor(count) {
  if (count === 0) return C.empty;
  if (count <= 2) return C.heatLow;
  if (count <= 4) return C.heatMid;
  if (count <= 6) return C.heatHigh;
  return C.accent;
}

function buildLog() {
  const height = 560;
  const data = getContributionData();
  const stats = contributionStats(data);
  const weeks = data.weeks.slice(-53);
  const gridX = 96;
  const gridY = 120;
  const step = 14;
  const cell = 11;
  const gridWidth = weeks.length * step - (step - cell);
  const months = monthLabels(weeks);
  const cells = [];
  
  // Find streak cells and busiest day for animations
  const busiestDate = stats.busiest.date;
  const streakDates = new Set();
  let currentStreak = 0;
  let maxStreak = 0;
  const allDays = weeks.flatMap(w => w.contributionDays);
  allDays.forEach(day => {
    if (day.contributionCount > 0) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        streakDates.clear();
        for (let i = 0; i < currentStreak; i++) {
          const idx = allDays.indexOf(day) - i;
          if (idx >= 0) streakDates.add(allDays[idx].date);
        }
      }
    } else {
      currentStreak = 0;
    }
  });

  weeks.forEach((week, col) => {
    week.contributionDays.forEach((day) => {
      const row = day.weekday;
      if (row < 0 || row > 6) return;
      const x = gridX + col * step;
      const y = gridY + row * step;
      const fill = levelColor(day.contributionCount);
      const isBusiest = day.date === busiestDate;
      const isStreak = streakDates.has(day.date) && day.contributionCount > 0;
      const delay = (col * 7 + row) * 0.008; // Staggered entrance
      const pulseClass = isBusiest ? ' class="pulse"' : isStreak ? ' class="shimmer"' : '';
      cells.push(
        `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${fill}"${pulseClass} style="animation-delay: ${delay.toFixed(3)}s;"/>`,
      );
    });
  });
  
  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""]
    .map((label, row) =>
      label
        ? text(64, gridY + row * step + 9, label, { size: 10.5, fill: C.muted })
        : "",
    )
    .join("\n");
  const monthText = months
    .map((label) => text(label.x, 108, label.month, { size: 11, fill: C.muted }))
    .join("\n");
  const timelineY = 420;
  const timelineX1 = 96;
  const timelineX2 = 1136;
  const milestoneMarkup = milestones
    .map((item, idx) => {
      const x = Math.round(timelineX1 + (timelineX2 - timelineX1) * item.x);
      const above = item.side === "up";
      const anchor = x < 180 ? "start" : x > 1060 ? "end" : "middle";
      const lines = wrap(item.label, 30);
      const labelY = above ? 382 : 444;
      const dateY = above ? 364 : 466;
      const markerDelay = 1.2 + idx * 0.15;
      return `<line x1="${x}" y1="${timelineY - 7}" x2="${x}" y2="${timelineY + 7}" stroke="${C.accent}" stroke-width="2" class="grow" style="animation-delay: ${markerDelay}s; transform-origin: center;"/>
<circle cx="${x}" cy="${timelineY}" r="6" fill="${C.accent}" class="pulse" style="animation-delay: ${markerDelay + 0.3}s;"/>
${text(x, dateY, item.date, { size: 11, fill: C.accent, anchor, spacing: 0.7, cls: "slide", style: `animation-delay: ${markerDelay + 0.1}s;` })}
${textLines(x, labelY, lines, { size: 13, fill: C.bone, anchor, lineHeight: 17, cls: "slide", style: `animation-delay: ${markerDelay + 0.2}s;` })}`;
    })
    .join("\n");
  
  const yearNumbers = [
    { label: "contributions", value: String(stats.total), x: 904, y: 196, delay: 0.8 },
    { label: "active days", value: String(stats.active), x: 1024, y: 196, delay: 0.9 },
    { label: "day longest streak", value: String(stats.longest), x: 904, y: 286, delay: 1.0 },
    { label: `busiest · ${formatDate(stats.busiest.date).replace(/ \d{4}$/, "")}`, value: String(stats.busiest.count), x: 1024, y: 286, delay: 1.1 },
  ];
  
  const yearNumbersMarkup = yearNumbers.map(n => 
    `${countUpText(n.x, n.y, n.value, { size: 42, weight: 700, cls: "nums" }, n.delay)}
${text(n.x, n.y + 20, n.label, { size: 12.5, fill: C.muted, cls: "slide", style: `animation-delay: ${n.delay + 0.1}s;` })}`
  ).join("\n");

  const body = `
${text(64, 64, "Every cell is a day from the last 12 months of GitHub activity.", { size: 19, fill: C.muted })}
${drawLine(64, 88, 1136, 88, C.bone, L.structural, 0.3)}

${monthText}
${dayLabels}
${cells.join("\n")}
${micro(96, 246, "Less", { spacing: 1 })}
${[0, 2, 4, 7].map((level, i) => `<rect x="${144 + i * 18}" y="236" width="11" height="11" fill="${levelColor(level)}"/>`).join("")}
${micro(234, 246, "More", { spacing: 1 })}

<g class="rise d1">
  ${panel(880, 110, 256, 220)}
  ${micro(904, 138, "Year in numbers", { spacing: 1 })}
  ${yearNumbersMarkup}
  ${drawLine(904, 238, 1112, 238, C.bone, L.hair, 1.1)}
</g>

${micro(96, 310, "Project timeline", { spacing: 1 })}
${drawLine(timelineX1, timelineY, timelineX2, timelineY, C.bone, L.structural, 1.0)}
${milestoneMarkup}

${rule(64, 510, 1136, L.hair)}
${micro(64, 536, "Source / GitHub contribution calendar · refreshed daily by Actions", { spacing: 0.8 })}
<g class="scan">
  <rect x="${gridX}" y="${gridY - 6}" width="1.5" height="110" fill="${C.accent}" opacity="0.9"/>
  <polygon points="${gridX - 4},${gridY - 2} ${gridX + 4},${gridY - 2} ${gridX},${gridY + 4}" fill="${C.accent}"/>
</g>
`;
  return svgDoc({
    height,
    title: "Build log — last 12 months of GitHub activity",
    desc: `GitHub contribution calendar for the last 12 months: ${stats.total} contributions, ${stats.active} active days, longest streak ${stats.longest} days, busiest day ${stats.busiest.count} contributions on ${formatDate(stats.busiest.date)}. Project timeline from February to October 2026.`,
    body,
    extraStyle: `
      .scan { animation: scan ${motion.scan} linear infinite; }
      @keyframes scan { from { transform: translateX(0); } to { transform: translateX(${gridWidth}px); } }
    `,
  });
}

function credentialsSheet() {
  const height = 520;
  const rows = certifications
    .map((cert, index) => {
      const y = 112 + index * 64;
      const delay = 0.3 + index * 0.08;
      return `<g class="rise d${Math.min(index + 1, 4)}" style="animation-delay: ${delay}s;">
  ${growBar(64, y - 9, 6, 6, C.accent, delay)}
  ${text(88, y, cert.name, { size: 21, weight: 600, cls: "slide", style: `animation-delay: ${delay + 0.1}s;` })}
  ${text(88, y + 21, cert.group, { size: 12.5, fill: C.muted, cls: "slide", style: `animation-delay: ${delay + 0.15}s;` })}
  ${drawLine(64, y + 36, 736, y + 36, C.bone, L.hair, delay + 0.2)}
</g>`;
    })
    .join("\n");
  const body = `
${micro(64, 64, "Certification register", { spacing: 1 })}
${rule(64, 82, 736, L.structural)}
${rows}
${rule(64, 436, 736, L.hair)}
${micro(64, 458, "Source / certificates as issued", { spacing: 0.9 })}

<g class="rise d2">
  ${panel(792, 40, 344, 440)}
  ${drawRect(792, 40, 344, 4, C.accent, 1, 0.4)}
  ${micro(816, 76, "Record", { spacing: 1 })}
  ${countUpText(816, 140, achievements[0].value, { size: 64, weight: 700, cls: "nums" }, 0.5)}
  ${text(816, 166, achievements[0].label, { size: 14, fill: C.bone, cls: "slide", style: "animation-delay: 0.6s;" })}
  ${textLines(816, 188, wrap(achievements[0].note, 44), { size: 12, fill: C.muted, lineHeight: 16, cls: "slide", style: "animation-delay: 0.7s;" })}
  ${drawLine(816, 222, 1112, 222, C.bone, L.hair, 0.8)}
  ${textLines(816, 262, wrap(achievements[1].label, 26), { size: 22, weight: 600, lineHeight: 27, cls: "slide", style: "animation-delay: 0.9s;" })}
  ${text(816, 316, achievements[1].value, { size: 20, fill: C.bone, cls: "slide", style: "animation-delay: 1.0s;" })}
  ${text(816, 338, achievements[1].note, { size: 12, fill: C.muted, cls: "slide", style: "animation-delay: 1.1s;" })}
  ${drawLine(816, 364, 1112, 364, C.bone, L.hair, 1.2)}
  ${text(816, 402, achievements[2].value, { size: 24, weight: 600, cls: "slide", style: "animation-delay: 1.3s;" })}
  ${text(816, 426, achievements[2].note, { size: 12, fill: C.muted, cls: "slide", style: "animation-delay: 1.4s;" })}
</g>
`;
  return svgDoc({
    height,
    title: "Credentials and record",
    desc: "Five certifications: Intro to Programming Using Python, Python Programming, Power BI, Data Analytics with Tableau, and Data Analytics Job Simulation. CGPA 8.2 out of 10 in B.Tech CSE Data Science, 2026. Letter of Recommendation from GeeksforGeeks. Four analytics projects.",
    body,
  });
}

function connectSheet() {
  const height = 340;
  const roles = openTo
    .map((role, index) => {
      const col = index < 3 ? 760 : 960;
      const y = 140 + (index % 3) * 38;
      const delay = 0.5 + index * 0.08;
      return text(col, y, role, { size: 16, fill: C.bone, cls: "slide", style: `animation-delay: ${delay}s;` });
    })
    .join("\n");
  const body = `
<g class="rise">
  ${text(64, 118, "Let's turn your data", { size: 46, weight: 700 })}
  ${text(64, 166, "into decisions.", { size: 46, weight: 700 })}
</g>
<g class="rise d1">
  ${textLines(64, 216, wrap("Open to Data Analyst, BI Analyst, Reporting, MIS, and Business Analyst roles.", 72), { size: 18, fill: C.muted, lineHeight: 26 })}
</g>
<g class="rise d2">
  ${micro(760, 104, "Open to", { spacing: 1 })}
  ${roles}
</g>
${drawLine(64, 264, 1136, 264, C.bone, L.structural, 0.8)}
<g class="rise d3">
  ${text(64, 304, "Hyderabad, India", { size: 14, fill: C.bone, cls: "slide", style: "animation-delay: 1.0s;" })}
  ${text(392, 304, profile.email, { size: 14, fill: C.muted, cls: "slide", style: "animation-delay: 1.1s;" })}
  ${text(720, 304, "linkedin.com/in/pavanmallesh4466", { size: 14, fill: C.muted, cls: "slide", style: "animation-delay: 1.2s;" })}
  ${text(1136, 304, "github.com/pavan4466", { size: 14, fill: C.muted, anchor: "end", cls: "slide", style: "animation-delay: 1.3s;" })}
</g>
`;
  return svgDoc({
    height,
    title: "Connect with Pavan Mallesh Vinjamuri",
    desc: "Open to Data Analyst, BI Analyst, Reporting Analyst, MIS Analyst, Business Analyst roles and analytics internships. Hyderabad, India. Email pavanvinjamuri17@gmail.com. LinkedIn pavanmallesh4466. GitHub pavan4466.",
    body,
  });
}

function footer() {
  const height = 240;
  const body = `
${rule(64, 40, 1136, L.structural)}
<g class="rise">
  ${text(64, 112, "VINJAMURI PAVAN MALLESH", { size: 44, weight: 700, spacing: -1.2 })}
  ${text(64, 152, profile.tagline, { size: 22, fill: C.muted })}
</g>
${micro(1136, 76, "Hyderabad, India", { anchor: "end", spacing: 1 })}
${micro(1136, 98, "2026", { anchor: "end", spacing: 1 })}
${rule(64, 190, 1136, L.hair)}
${micro(64, 216, `Profile blueprint / ${String(titleSheets.length).padStart(2, "0")} sections / SVG + live GitHub data`, { spacing: 0.8 })}
${micro(1136, 216, "End of set", { anchor: "end", spacing: 0.8 })}
`;
  return svgDoc({
    height,
    title: "Pavan Mallesh Vinjamuri — end of profile blueprint",
    desc: "Vinjamuri Pavan Mallesh, data analyst, Hyderabad, 2026. Raw data in, clear decisions out. End of profile blueprint.",
    body,
  });
}

function contactChip(label) {
  const width = 200;
  const height = 56;
  const body = `
<rect width="${width}" height="${height}" fill="${C.panel}"/>
<rect x="0" y="0" width="3" height="${height}" fill="${C.accent}"/>
<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" fill="none" stroke="${C.bone}" stroke-opacity="${L.hair}"/>
${text(22, 34, label, { size: 14, weight: 600, spacing: 1.4 })}
<path d="M170 40 L182 28 M174 28 L182 28 L182 36" fill="none" stroke="${C.accent}" stroke-width="1.4"/>
`;
  return svgDoc({
    width,
    height,
    title: `${label} — Pavan Mallesh Vinjamuri`,
    desc: `Contact link: ${label}.`,
    body,
  });
}

function write(name, content) {
  fs.writeFileSync(path.join(ASSETS, name), content, "utf8");
  console.log(`wrote assets/${name} (${Buffer.byteLength(content)} bytes)`);
}

fs.mkdirSync(ASSETS, { recursive: true });
write("hero.svg", hero());
for (const item of titleSheets) write(item.file, titleSheet(item));
write("about.svg", about());
write("field-log.svg", fieldLog());
for (const project of projects) write(`project-${project.number}-${project.key}.svg`, projectSheet(project));
write("toolkit.svg", toolkitSheet());
write("build-log.svg", buildLog());
write("credentials.svg", credentialsSheet());
write("connect.svg", connectSheet());
write("footer.svg", footer());
for (const label of ["Email", "LinkedIn", "GitHub", "Portfolio"]) {
  write(`contact-${label.toLowerCase()}.svg`, contactChip(label));
}
console.log("profile sheets built");
