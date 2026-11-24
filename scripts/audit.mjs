import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const area = process.argv[2] || "all"; // public | student | admin | all
const project = process.argv[3] || "all"; // mobile-375 | tablet-768 | desktop-1280 | all

mkdirSync("audit-output", { recursive: true });
const name = `${area}-${project}`;
const jsonFile = `audit-output/${name}.json`;
const txtFile = `audit-output/${name}.txt`;

const args = ["playwright", "test"];
if (area !== "all") args.push(area);
if (project !== "all") args.push(`--project=${project}`);
args.push("--reporter=json");

console.log(`Running: npx ${args.join(" ")}  (this can take a few minutes)`);
spawnSync("npx", args, {
  shell: true,
  stdio: "ignore",
  env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: jsonFile },
});

if (!existsSync(jsonFile)) {
  console.error(
    "No results file was produced. Run: npx playwright test --list",
  );
  process.exit(1);
}

const strip = (s) => String(s || "").replace(/\u001b\[[0-9;]*m/g, "");
const ascii = (s) => s.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");

function tidy(msg) {
  const lines = strip(msg)
    .split("\n")
    .filter((l) => {
      if (/^\s*at\s/.test(l)) return false; // stack frames
      if (/^\s*>?\s*\d+\s*\|/.test(l)) return false; // code frames
      if (/^\s*\|\s*\^/.test(l)) return false;
      if (/^\s*$/.test(l)) return false;
      return true;
    });
  return lines.join("\n").slice(0, 1800);
}

const report = JSON.parse(readFileSync(jsonFile, "utf8"));
const tests = [];
(function walk(suite, trail) {
  const t =
    suite.title && !/\.(spec|test)\.[jt]s$/.test(suite.title)
      ? [...trail, suite.title]
      : trail;
  for (const s of suite.specs || [])
    for (const test of s.tests || [])
      tests.push({
        file: s.file,
        line: s.line,
        project: test.projectName,
        title: [...t, s.title].join(" > "),
        status: test.status,
        errors: (test.results || []).at(-1)?.errors || [],
      });
  for (const c of suite.suites || []) walk(c, t);
})({ suites: report.suites || [], title: "" }, []);

const label = {
  expected: "PASS",
  unexpected: "FAIL",
  skipped: "SKIP",
  flaky: "FLAKY",
};
const count = (s) => tests.filter((t) => t.status === s).length;

const out = [];
out.push(
  `AUDIT ${area} / ${project}  ${new Date().toISOString().slice(0, 16)}`,
);
out.push(
  `TOTAL ${tests.length} | PASS ${count("expected")} | FAIL ${count("unexpected")} | SKIP ${count("skipped")} | FLAKY ${count("flaky")}`,
);

if ((report.errors || []).length) {
  out.push("", "=== LOAD ERRORS (tests could not run) ===");
  for (const e of report.errors) out.push(tidy(e.message));
}

out.push("", "=== ALL TESTS ===");
for (const t of tests)
  out.push(
    `${label[t.status] || t.status}  [${t.project}] ${t.file}:${t.line} > ${t.title}`,
  );

const failed = tests.filter(
  (t) => t.status === "unexpected" || t.status === "flaky",
);
out.push("", `=== FAILURES (${failed.length}) ===`);
failed.forEach((t, i) => {
  out.push("", `[${i + 1}] [${t.project}] ${t.file}:${t.line} > ${t.title}`);
  t.errors.forEach((e) => out.push(tidy(e.message)));
});

out.push("", "=== END OF REPORT ===");
const text = ascii(out.join("\n"));

writeFileSync(txtFile, text);
spawnSync("clip", { input: text, shell: true });
console.log(`\nDone. ${tests.length} tests, ${count("unexpected")} failed.`);
console.log(`Copied to clipboard. Also saved to ${txtFile}`);
console.log("Now paste it into the chat with Ctrl+V.");
