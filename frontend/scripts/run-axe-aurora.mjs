import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";
import axe from "axe-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const previewPath = path.join(root, "public", "aurora-preview.html");
const cssPath = path.join(root, "public", "aurora-preview.css");
const reportPath = path.join(root, "aurora-axe-report.json");

const html = await fs.readFile(previewPath, "utf8");
const css = await fs.readFile(cssPath, "utf8");
const htmlWithInlineCss = html.replace("</head>", `<style>${css}</style></head>`);

const dom = new JSDOM(htmlWithInlineCss, {
  runScripts: "outside-only",
  resources: "usable",
  pretendToBeVisual: true,
  url: "http://localhost/aurora-preview.html",
});

dom.window.eval(axe.source);

const result = await dom.window.axe.run(dom.window.document, {
  runOnly: {
    type: "tag",
    values: ["wcag2a", "wcag2aa", "wcag22aa"],
  },
});

const summary = {
  passes: result.passes.length,
  violations: result.violations.length,
  incomplete: result.incomplete.length,
  inapplicable: result.inapplicable.length,
};

await fs.writeFile(
  reportPath,
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      target: "public/aurora-preview.html",
      standard: "WCAG 2.2 AA",
      summary,
      violations: result.violations,
      incomplete: result.incomplete,
    },
    null,
    2,
  ),
);

console.log(JSON.stringify(summary));
