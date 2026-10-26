import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "preview");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

fs.mkdirSync(OUT, { recursive: true });

const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
const visual = readme.split("<details>")[0];

function pageHtml(theme) {
  return `<!doctype html>
<html lang="en" data-theme="${theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="../">
<title>Profile README preview</title>
<style>
  :root {
    --canvas: #ffffff;
    --fg: #1f2328;
    --muted: #59636e;
    --border: #d1d9e0;
    --link: #0969da;
  }
  html[data-theme="dark"] {
    --canvas: #0d1117;
    --fg: #e6edf3;
    --muted: #9198a1;
    --border: #30363d;
    --link: #4493f8;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--canvas);
    color: var(--fg);
    font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .markdown-body { max-width: 960px; margin: 0 auto; padding: 32px 32px 64px; }
  .markdown-body a { color: var(--link); text-decoration: none; }
  .markdown-body a:hover { text-decoration: underline; }
  .markdown-body img { max-width: 100%; height: auto; vertical-align: middle; }
  .markdown-body h2 {
    margin: 24px 0 16px;
    padding-bottom: .3em;
    font-size: 1.5em;
    font-weight: 600;
    line-height: 1.25;
    border-bottom: 1px solid var(--border);
  }
  .markdown-body h2 img { display: block; }
  .markdown-body p { margin: 0 0 16px; }
  .markdown-body > a { display: block; margin-bottom: 16px; }
  .markdown-body > a img { display: block; }
  .markdown-body > img { display: block; margin-bottom: 16px; }
  .markdown-body p:has(> a > img) { margin: 0 0 16px; }
  @media (max-width: 600px) {
    .markdown-body { padding: 16px 16px 48px; }
  }
</style>
</head>
<body>
<main class="markdown-body">
${visual}
</main>
</body>
</html>`;
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

const captures = [
  { name: "desktop-dark", width: 1280, height: 900, theme: "dark", scale: 1 },
  { name: "desktop-light", width: 1280, height: 900, theme: "light", scale: 1 },
  { name: "mobile-dark", width: 390, height: 844, theme: "dark", scale: 2 },
  { name: "mobile-light", width: 390, height: 844, theme: "light", scale: 2 },
];

for (const capture of captures) {
  const file = path.join(OUT, `readme-${capture.theme}.html`);
  fs.writeFileSync(file, pageHtml(capture.theme), "utf8");
  const page = await browser.newPage({
    viewport: { width: capture.width, height: capture.height },
    deviceScaleFactor: capture.scale,
  });
  page.on("console", (message) => {
    if (message.type() === "error") console.log(`console: ${message.text()}`);
  });
  page.on("requestfailed", (request) => console.log(`failed: ${request.url()}`));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(pathToFileURL(file).href, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images)
        .filter((image) => !image.complete)
        .map((image) => new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        })),
    );
    await document.fonts.ready;
  });
  await page.waitForTimeout(300);
  const broken = await page.evaluate(() =>
    Array.from(document.images)
      .filter((image) => !image.naturalWidth)
      .map((image) => image.getAttribute("src")),
  );
  if (broken.length) console.log(`${capture.name} broken images: ${broken.join(", ")}`);
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(OUT, `${capture.name}.png`), fullPage: true });
  console.log(`wrote preview/${capture.name}.png`);
  await page.close();
}

const sheets = [
  "hero.svg",
  "title-01-about.svg",
  "about.svg",
  "field-log.svg",
  "project-01-smartphone.svg",
  "project-02-movie.svg",
  "project-03-energy.svg",
  "project-04-retailpulse.svg",
  "toolkit.svg",
  "build-log.svg",
  "credentials.svg",
  "connect.svg",
  "footer.svg",
  "contact-email.svg",
  "contact-linkedin.svg",
  "contact-github.svg",
  "contact-portfolio.svg",
];

for (const sheet of sheets) {
  const file = path.join(ROOT, "assets", sheet);
  const source = fs.readFileSync(file, "utf8");
  const width = Number(source.match(/\bwidth="(\d+)"/)?.[1]);
  const height = Number(source.match(/\bheight="(\d+)"/)?.[1]);
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  await page.evaluate(() => {
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = `
      .rise, .pulse { animation: none !important; opacity: 1 !important; transform: none !important; }
      .scan { display: none !important; }
    `;
    document.documentElement.appendChild(style);
  });
  await page.waitForTimeout(150);
  const name = sheet.replace(".svg", "");
  await page.screenshot({ path: path.join(OUT, `sheet-${name}.png`) });
  console.log(`wrote preview/sheet-${name}.png (${width}x${height})`);
  await page.close();
}

const reduced = await browser.newPage({ viewport: { width: 1200, height: 560 } });
await reduced.emulateMedia({ reducedMotion: "reduce" });
await reduced.goto(pathToFileURL(path.join(ROOT, "assets", "build-log.svg")).href, { waitUntil: "load" });
await reduced.waitForTimeout(200);
const reducedState = await reduced.evaluate(() =>
  Array.from(document.querySelectorAll("text")).slice(0, 3).map((node) => ({
    text: node.textContent.slice(0, 20),
    opacity: getComputedStyle(node.parentElement).opacity,
  })),
);
console.log("reduced-motion build log:", JSON.stringify(reducedState));
await reduced.screenshot({ path: path.join(OUT, "build-log-reduced.png") });
await reduced.close();

await browser.close();
