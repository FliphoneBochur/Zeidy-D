#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = __dirname;
const FILES_DIR = path.join(ROOT_DIR, "Files");
const REPORT_FILE = path.join(ROOT_DIR, "bidi-risk-report.md");
const HEBREW = "[\\u0590-\\u05FF\\uFB1D-\\uFB4F]";
const HEBREW_RUN = `${HEBREW}+(?:\\s+${HEBREW}+)*`;

const RISK_PATTERNS = [
  {
    label: "number + Hebrew + sentence punctuation + Hebrew",
    re: new RegExp(`\\b\\d[\\d,]*\\s+${HEBREW_RUN}[.!?]\\s+${HEBREW_RUN}`, "u"),
  },
  {
    label: "Hebrew + sentence punctuation + Hebrew",
    re: new RegExp(`${HEBREW_RUN}[.!?]\\s+${HEBREW_RUN}`, "u"),
  },
  {
    label: "Hebrew + colon/semicolon + Hebrew",
    re: new RegExp(`${HEBREW_RUN}[:;]\\s+${HEBREW_RUN}`, "u"),
  },
  {
    label: "Latin text + Hebrew phrase + Latin punctuation",
    re: new RegExp(`[A-Za-z][^\\n.?!]{0,80}${HEBREW_RUN}[,.;:!?]`, "u"),
  },
];

function usage() {
  console.log(`Usage: node scan-bidi-risks.js [options]

Scan .docx files for mixed Hebrew/English passages that are prone to bidi
rendering surprises in the typeset PDF. This does not edit any files.

Options:
  --report <file>  Report path. Default: bidi-risk-report.md
  --help           Show this help text.`);
}

function parseArgs(argv) {
  const options = { report: REPORT_FILE };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--report") {
      options.report = path.resolve(ROOT_DIR, argv[++i] || "");
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 100,
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(`${command} ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`);
  }

  return result.stdout;
}

async function findDocxFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith("~$")) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findDocxFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".docx")) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function paragraphsFromPlainText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function excerpt(paragraph, matchIndex, matchLength) {
  const start = Math.max(0, matchIndex - 90);
  const end = Math.min(paragraph.length, matchIndex + matchLength + 90);
  return `${start > 0 ? "..." : ""}${paragraph.slice(start, end)}${end < paragraph.length ? "..." : ""}`;
}

function findRisks(filePath, text) {
  const paragraphs = paragraphsFromPlainText(text);
  const risks = [];

  paragraphs.forEach((paragraph, index) => {
    for (const pattern of RISK_PATTERNS) {
      const match = pattern.re.exec(paragraph);
      if (match) {
        risks.push({
          filePath,
          paragraph: index + 1,
          label: pattern.label,
          context: excerpt(paragraph, match.index, match[0].length),
        });
        break;
      }
    }
  });

  return risks;
}

function markdownForRisks(risks, scannedCount) {
  const lines = [
    "# Bidi Risk Report",
    "",
    "This is a review-only scan for mixed Hebrew/English patterns that can render in a surprising visual order in the PDF.",
    "",
    `Documents scanned: ${scannedCount}`,
    `Risk locations: ${risks.length}`,
    "",
  ];

  for (const risk of risks) {
    lines.push(`- \`${path.relative(ROOT_DIR, risk.filePath)}\``);
    lines.push(`  - paragraph ${risk.paragraph}: ${risk.label}`);
    lines.push(`  - ${risk.context}`);
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = await findDocxFiles(FILES_DIR);
  const risks = [];

  for (const file of files) {
    const text = run("pandoc", [file, "-t", "plain"]);
    risks.push(...findRisks(file, text));
  }

  await fs.writeFile(options.report, markdownForRisks(risks, files.length), "utf8");
  console.log(`Scanned ${files.length} documents.`);
  console.log(`Found ${risks.length} bidi-risk location${risks.length === 1 ? "" : "s"}.`);
  console.log(`Wrote ${path.relative(ROOT_DIR, options.report)}.`);
}

main().catch((error) => {
  console.error(`scan-bidi-risks failed: ${error.message}`);
  process.exitCode = 1;
});
