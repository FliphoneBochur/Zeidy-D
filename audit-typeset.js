#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = __dirname;
const OUTPUT_DIR = path.join(ROOT_DIR, "Files/08 - Misc/Final Sefer");
const DEFAULT_PDF = path.join(OUTPUT_DIR, "Final Sefer.pdf");
const DEFAULT_TYP = path.join(OUTPUT_DIR, "Final Sefer.typ");
const DEFAULT_REPORT = path.join(ROOT_DIR, "typeset-audit.md");
const DEFAULT_RENDER_DIR = path.join(ROOT_DIR, "typeset-audit-pages");
const HEBREW = "\\u0590-\\u05FF\\uFB1D-\\uFB4F";
const DIRECTION_MARKS_RE = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
const PDF_HEBREW_MARKS_RE = /[‫‬⁦⁧⁩]/g;

const PDF_PATTERNS = [
  {
    severity: "high",
    label: "double opening parenthesis before source/reference",
    re: /\(\s*\(\s*(?:\d|[\u0590-\u05FF\uFB1D-\uFB4F])/u,
  },
  {
    severity: "high",
    label: "double closing parenthesis after source/reference",
    re: /(?:\d|[\u0590-\u05FF\uFB1D-\uFB4F])\s*\)\s*\)/u,
  },
  {
    severity: "high",
    label: "malformed nested Hebrew source parenthesis",
    re: new RegExp(`\\([${HEBREW}]+\\s+\\([${HEBREW}]+\\s*:\\s*[${HEBREW}]+\\s*:`, "u"),
  },
  {
    severity: "high",
    label: "leading punctuation before Hebrew",
    re: new RegExp(`(^|[\\s(\\[])\\s*[,;:.]\\s*[${HEBREW}]`, "u"),
  },
  {
    severity: "medium",
    label: "space before sentence punctuation",
    re: /[A-Za-z0-9]\s+[,.;:!?](?!\d)/u,
  },
  {
    severity: "medium",
    label: "broken thousands separator",
    re: /\b\d{1,3},\s+\d{3}\b/u,
  },
  {
    severity: "medium",
    label: "Hebrew and English glued together",
    normalizer: "boundary",
    re: new RegExp(`(?:[A-Za-z][${HEBREW}]|[${HEBREW}][A-Za-z])`, "u"),
  },
  {
    severity: "medium",
    label: "dash glued to Hebrew before English",
    re: new RegExp(`[${HEBREW}]-\\s+[A-Za-z]`, "u"),
  },
];

const TYP_PATTERNS = [
  {
    severity: "high",
    label: "raw escaped opening parenthesis before numeric source",
    re: /\(\\\(\d+:\d+:/u,
  },
  {
    severity: "high",
    label: "double numeric source parenthesis",
    re: /\(\(\d+:\d+:/u,
  },
  {
    severity: "high",
    label: "double close after numeric source",
    re: /\d+:\d+\)\)/u,
  },
  {
    severity: "high",
    label: "malformed nested Hebrew source parenthesis",
    re: new RegExp(`\\([${HEBREW}]+\\s+\\([${HEBREW}]+\\s*:\\s*[${HEBREW}]+\\s*:`, "u"),
  },
  {
    severity: "medium",
    label: "space before punctuation in Typst source",
    re: new RegExp(`[A-Za-z0-9${HEBREW}]\\s+[,.;:!?](?!\\d)`, "u"),
  },
  {
    severity: "medium",
    label: "space on both sides of colon in Typst source",
    re: /\S\s+:\s+\S/u,
  },
  {
    severity: "medium",
    label: "missing space after colon before Hebrew in Typst source",
    normalizer: "ignore-parenthesized-sources",
    re: new RegExp(`:[${HEBREW}]`, "u"),
  },
  {
    severity: "medium",
    label: "broken thousands separator in Typst source",
    re: /\b\d{1,3},\s+\d{3}\b/u,
  },
  {
    severity: "medium",
    label: "Hebrew and English glued together in Typst source",
    normalizer: "boundary",
    re: new RegExp(`(?:[A-Za-z][${HEBREW}]|[${HEBREW}][A-Za-z])`, "u"),
  },
];

function usage() {
  console.log(`Usage: node audit-typeset.js [options]

Scan a built typeset PDF and Typst source for likely visual/punctuation errors.
This is review-only and does not edit files.

Options:
  --pdf <file>          PDF to scan. Default: Files/08 - Misc/Final Sefer/Final Sefer.pdf
  --typ <file>          Typst file to scan. Default: Files/08 - Misc/Final Sefer/Final Sefer.typ
  --report <file>       Markdown report path. Default: typeset-audit.md
  --max-per-pattern <n> Maximum findings per pattern. Default: 50
  --render-pages        Render PDF pages with findings to PNGs for visual review.
  --render-dir <dir>    Rendered page image folder. Default: typeset-audit-pages
  --no-pdf              Skip PDF visual-text scan.
  --no-typ              Skip Typst source scan.
  --help                Show this help text.`);
}

function parseArgs(argv) {
  const options = {
    pdf: DEFAULT_PDF,
    typ: DEFAULT_TYP,
    report: DEFAULT_REPORT,
    maxPerPattern: 50,
    scanPdf: true,
    scanTyp: true,
    renderPages: false,
    renderDir: DEFAULT_RENDER_DIR,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--pdf") {
      options.pdf = path.resolve(ROOT_DIR, argv[++i] || "");
    } else if (arg === "--typ") {
      options.typ = path.resolve(ROOT_DIR, argv[++i] || "");
    } else if (arg === "--report") {
      options.report = path.resolve(ROOT_DIR, argv[++i] || "");
    } else if (arg === "--max-per-pattern") {
      options.maxPerPattern = Number(argv[++i] || "0");
      if (!Number.isInteger(options.maxPerPattern) || options.maxPerPattern < 1) {
        throw new Error("--max-per-pattern must be a positive integer");
      }
    } else if (arg === "--render-pages") {
      options.renderPages = true;
    } else if (arg === "--render-dir") {
      options.renderDir = path.resolve(ROOT_DIR, argv[++i] || "");
    } else if (arg === "--no-pdf") {
      options.scanPdf = false;
    } else if (arg === "--no-typ") {
      options.scanTyp = false;
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.scanPdf && !options.scanTyp) {
    throw new Error("Nothing to scan: remove --no-pdf or --no-typ");
  }
  if (options.renderPages && !options.scanPdf) {
    throw new Error("--render-pages requires the PDF scan");
  }

  return options;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 200,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(`${command} ${args.join(" ")} failed${detail ? `:\n${detail}` : ""}`);
  }

  return result.stdout;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizedForScan(value) {
  return value.replace(DIRECTION_MARKS_RE, " ").replace(PDF_HEBREW_MARKS_RE, " ");
}

function compactForScan(value) {
  return value.replace(DIRECTION_MARKS_RE, "").replace(PDF_HEBREW_MARKS_RE, "");
}

function maskParenthesizedSources(value) {
  return value.replace(/\([^()\n]*:[^()\n]*\)/gu, (match) => " ".repeat(match.length));
}

function isIndexPageListLine(value) {
  const line = normalizedForScan(value).trim();
  return (
    /\.{5,}\s*\d{1,3}(?:,\s+\d{1,3})*/.test(line) ||
    /^\d{1,3}(?:,\s+\d{1,3}){1,},?$/.test(line)
  );
}

function repairPdfExtractedTrailingPunctuationArtifacts(value) {
  return value
    .replace(
      new RegExp(
        `([\\u2066\\u2067])([,;:.])([\\u202A-\\u202E])?([\\s\\u00A0\\u202F]*\\u2069)([${HEBREW}](?:[${HEBREW}\\s\\u00A0\\u202F]+[${HEBREW}])?)([\\u202A-\\u202E])(?=[A-Za-z])`,
        "gu"
      ),
      (_match, isolate, punctuation, pdfStart = "", beforeText, hebrewText, pdfEnd) =>
        `${isolate}${pdfStart}${beforeText}${hebrewText}${pdfEnd}${punctuation} `
    )
    .replace(
      new RegExp(
        `([\\u2066\\u2067])([,;:.])([\\u202A-\\u202E])([${HEBREW}](?:[${HEBREW}\\s\\u00A0\\u202F]+[${HEBREW}])?)([\\u202A-\\u202E])`,
        "gu"
      ),
      (_match, isolate, punctuation, pdfStart, hebrewText, pdfEnd) =>
        `${isolate}${pdfStart}${hebrewText}${pdfEnd}${punctuation}`
    )
    .replace(
      new RegExp(`([,;:.])([\\u202A-\\u202E\\u2066-\\u2069]+)([${HEBREW}])`, "gu"),
      (_match, punctuation, marks, hebrewLetter) => `${marks}${hebrewLetter}${punctuation}`
    );
}

function scanTextForPattern(value, pattern, source) {
  const scanValue = source === "PDF visual text"
    ? repairPdfExtractedTrailingPunctuationArtifacts(value)
    : value;
  if (pattern.normalizer === "boundary") {
    return normalizedForScan(scanValue);
  }

  const compactValue = compactForScan(scanValue);
  if (pattern.normalizer === "ignore-parenthesized-sources") {
    return maskParenthesizedSources(compactValue);
  }

  return compactValue;
}

function shouldSkipLineForPattern(value, pattern, location = {}) {
  if (pattern.label === "space before sentence punctuation" && /(?:\s\.){3,}/.test(value)) {
    return true;
  }

  if (
    pattern.label === "broken thousands separator" &&
    location.source === "PDF visual text" &&
    (location.title === "Index" || isIndexPageListLine(location.title || "") || isIndexPageListLine(value))
  ) {
    return true;
  }

  if (
    pattern.label === "broken thousands separator in Typst source" &&
    location.source === "Typst source" &&
    /#index-row\(/.test(value)
  ) {
    return true;
  }

  return false;
}

function excerptFromLine(line, index, length) {
  const start = Math.max(0, index - 80);
  const end = Math.min(line.length, index + length + 80);
  return `${start > 0 ? "..." : ""}${line.slice(start, end).trim()}${end < line.length ? "..." : ""}`;
}

function pageTitle(pageText) {
  const lines = pageText
    .split("\n")
    .map((line) => normalizedForScan(line).trim())
    .filter(Boolean);
  const withoutPageNumber = lines.filter((line) => !/^\d+$/.test(line));
  return withoutPageNumber[0] || "";
}

function addFinding(findings, counters, pattern, location, originalLine, normalizedLine, match) {
  const key = `${location.source}:${pattern.label}`;
  counters.set(key, (counters.get(key) || 0) + 1);
  if (counters.get(key) > location.maxPerPattern) {
    return;
  }

  findings.push({
    severity: pattern.severity,
    label: pattern.label,
    source: location.source,
    page: location.page,
    line: location.line,
    title: location.title,
    context: excerptFromLine(originalLine, match.index, match[0].length),
    normalized: excerptFromLine(normalizedLine, match.index, match[0].length),
  });
}

function scanLines({ source, lines, patterns, maxPerPattern, page, title }, findings, counters) {
  lines.forEach((originalLine, lineIndex) => {
    for (const pattern of patterns) {
      if (shouldSkipLineForPattern(originalLine, pattern, { source, page, title })) {
        continue;
      }
      const normalizedLine = scanTextForPattern(originalLine, pattern, source);
      const match = pattern.re.exec(normalizedLine);
      if (match) {
        addFinding(
          findings,
          counters,
          pattern,
          {
            source,
            page,
            line: lineIndex + 1,
            title,
            maxPerPattern,
          },
          originalLine,
          normalizedLine,
          match
        );
      }
    }
  });
}

function scanPdfText(pdfText, options) {
  const findings = [];
  const counters = new Map();
  const pages = pdfText.split("\f");

  pages.forEach((pageText, index) => {
    const trimmed = pageText.trim();
    if (!trimmed) {
      return;
    }

    const title = pageTitle(pageText);
    scanLines(
      {
        source: "PDF visual text",
        lines: pageText.split("\n"),
        patterns: PDF_PATTERNS,
        maxPerPattern: options.maxPerPattern,
        page: index + 1,
        title,
      },
      findings,
      counters
    );
  });

  return findings;
}

function scanTypText(typText, options) {
  const findings = [];
  const counters = new Map();

  scanLines(
    {
      source: "Typst source",
      lines: typText.split("\n"),
      patterns: TYP_PATTERNS,
      maxPerPattern: options.maxPerPattern,
      page: null,
      title: "",
    },
    findings,
    counters
  );

  return findings;
}

async function prepareRenderDir(renderDir) {
  await fs.rm(renderDir, { recursive: true, force: true });
  await fs.mkdir(renderDir, { recursive: true });
}

function renderedPageFilename(page) {
  return `page-${String(page).padStart(4, "0")}.png`;
}

async function renderFindingPages(pdfPath, findings, options) {
  const pages = [...new Set(
    findings
      .filter((finding) => finding.source === "PDF visual text" && finding.page)
      .map((finding) => finding.page)
  )].sort((a, b) => a - b);

  await prepareRenderDir(options.renderDir);

  if (pages.length === 0) {
    return [];
  }

  for (const page of pages) {
    const outputPrefix = path.join(options.renderDir, `page-${String(page).padStart(4, "0")}`);
    run("pdftoppm", [
      "-png",
      "-r",
      "160",
      "-f",
      String(page),
      "-l",
      String(page),
      "-singlefile",
      pdfPath,
      outputPrefix,
    ]);
  }

  return pages;
}

function severityRank(severity) {
  return { high: 0, medium: 1, low: 2 }[severity] ?? 3;
}

function markdownForFindings(findings, options, scanned, renderedPages) {
  const highCount = findings.filter((finding) => finding.severity === "high").length;
  const mediumCount = findings.filter((finding) => finding.severity === "medium").length;
  const renderedPageSet = new Set(renderedPages);
  const sorted = [...findings].sort((a, b) => {
    return (
      severityRank(a.severity) - severityRank(b.severity) ||
      a.label.localeCompare(b.label) ||
      a.source.localeCompare(b.source) ||
      (a.page || 0) - (b.page || 0) ||
      a.line - b.line
    );
  });

  const lines = [
    "# Typeset Audit",
    "",
    "This is a review-only scan for likely visual punctuation and bidi issues in the built typeset output. It does not edit source files.",
    "",
    `PDF scanned: ${scanned.pdf ? `\`${path.relative(ROOT_DIR, options.pdf)}\`` : "no"}`,
    `Typst scanned: ${scanned.typ ? `\`${path.relative(ROOT_DIR, options.typ)}\`` : "no"}`,
    `Findings: ${findings.length} (${highCount} high, ${mediumCount} medium)`,
    `Visual pages rendered: ${renderedPages.length ? `\`${path.relative(ROOT_DIR, options.renderDir)}\`` : "no"}`,
    "",
    "The PDF scan uses extracted visual text, so it is useful for catching rendered punctuation surprises. The Typst scan catches raw source patterns before rendering.",
    "",
  ];

  if (sorted.length === 0) {
    lines.push("No suspicious patterns found.");
    return `${lines.join("\n")}\n`;
  }

  let lastGroup = "";
  for (const finding of sorted) {
    const group = `${finding.severity.toUpperCase()} - ${finding.label}`;
    if (group !== lastGroup) {
      lines.push(`## ${group}`, "");
      lastGroup = group;
    }

    const location = finding.page
      ? `page ${finding.page}${finding.title ? `, ${finding.title}` : ""}, line ${finding.line}`
      : `line ${finding.line}`;
    lines.push(`- ${finding.source}, ${location}`);
    if (renderedPageSet.has(finding.page)) {
      const imagePath = path.join(options.renderDir, renderedPageFilename(finding.page));
      lines.push(`  - visual: [${renderedPageFilename(finding.page)}](${path.relative(ROOT_DIR, imagePath)})`);
    }
    lines.push(`  - ${finding.context}`);
    if (finding.normalized !== finding.context) {
      lines.push(`  - normalized: ${finding.normalized}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const findings = [];
  const scanned = { pdf: false, typ: false };

  if (options.scanPdf) {
    if (!await fileExists(options.pdf)) {
      throw new Error(`PDF not found: ${options.pdf}`);
    }
    const pdfText = run("pdftotext", ["-layout", "-enc", "UTF-8", options.pdf, "-"]);
    findings.push(...scanPdfText(pdfText, options));
    scanned.pdf = true;
  }

  if (options.scanTyp) {
    if (!await fileExists(options.typ)) {
      throw new Error(`Typst file not found: ${options.typ}`);
    }
    const typText = await fs.readFile(options.typ, "utf8");
    findings.push(...scanTypText(typText, options));
    scanned.typ = true;
  }

  const renderedPages = options.renderPages
    ? await renderFindingPages(options.pdf, findings, options)
    : [];

  await fs.writeFile(options.report, markdownForFindings(findings, options, scanned, renderedPages), "utf8");

  const highCount = findings.filter((finding) => finding.severity === "high").length;
  const mediumCount = findings.filter((finding) => finding.severity === "medium").length;
  console.log(`Wrote ${path.relative(ROOT_DIR, options.report)}.`);
  console.log(`Findings: ${findings.length} (${highCount} high, ${mediumCount} medium).`);
  if (renderedPages.length > 0) {
    console.log(`Rendered ${renderedPages.length} page image${renderedPages.length === 1 ? "" : "s"} to ${path.relative(ROOT_DIR, options.renderDir)}.`);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`audit-typeset failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  PDF_PATTERNS,
  TYP_PATTERNS,
  compactForScan,
  normalizedForScan,
  repairPdfExtractedTrailingPunctuationArtifacts,
  shouldSkipLineForPattern,
  scanTextForPattern,
};
