import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";
import axe from "axe-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const reportPath = path.join(root, "aurora-axe-report.json");
const targetUrl = "http://127.0.0.1:4173/aurora-preview.html";

const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
});
const page = await browser.newPage();
await page.goto(targetUrl, { waitUntil: "networkidle" });
await page.addScriptTag({ content: axe.source });

const result = await page.evaluate(async () => {
  return await window.axe.run(document, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag22aa"],
    },
  });
});

await browser.close();

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
      target: targetUrl,
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
