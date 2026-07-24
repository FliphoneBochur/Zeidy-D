#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = __dirname;
const FILES_DIR = path.join(ROOT_DIR, "Files");
const REPORT_FILE = path.join(ROOT_DIR, "person-index-candidates.md");
const JSON_FILE = path.join(ROOT_DIR, "person-index-candidates.json");
const REVIEW_FILE = path.join(ROOT_DIR, "person-index-review.json");
const MAX_EXAMPLES = 5;

const HEBREW = "\u0590-\u05FF";
const HEBREW_TOKEN = `[${HEBREW}]+`;
const HEBREW_ACRONYM_RE = new RegExp(
  `${HEBREW_TOKEN}(?:["'׳״][${HEBREW}]*)+`,
  "gu"
);
const HEBREW_TITLE_RE = new RegExp(
  `(?:רב|רבי|ר'|ר׳|מרן|הגאון|הרה"ק|הרה״ק|החפץ חיים|הגר"א|הגר״א)\\s+${HEBREW_TOKEN}(?:\\s+${HEBREW_TOKEN}){0,4}`,
  "gu"
);
const HEBREW_PHRASE_RE = new RegExp(
  `${HEBREW_TOKEN}(?:\\s+${HEBREW_TOKEN}){1,5}`,
  "gu"
);
const HEBREW_SEFER_CONTEXT_RE = new RegExp(
  String.raw`(?:\b(?:sefer|book|called|named|quotes?|cites?|from|in|according to|brings(?:\s+down)?)\b(?:\s+the)?|(?:The|the)\s+|ספר\s+)(${HEBREW_TOKEN}(?:\s+${HEBREW_TOKEN}){1,5})`,
  "gu"
);
const ENGLISH_SEFER_CONTEXT_RE = new RegExp(
  String.raw`\b(?:sefer|book|called|named)\s+([A-Za-z][A-Za-z'’.-]+(?:\s+[A-Za-z][A-Za-z'’.-]+){1,5})`,
  "gu"
);
const HEBREW_SEFER_TITLE_STARTS = new Set([
  "אהבת",
  "אוצר",
  "אור",
  "אורות",
  "אזנים",
  "אוזנים",
  "באר",
  "בית",
  "דעת",
  "דברי",
  "חיים",
  "חידושי",
  "כלי",
  "משך",
  "מנחת",
  "מעינה",
  "נתיבות",
  "ספר",
  "פלאות",
  "פנינים",
  "קול",
  "שערי",
  "שפת",
  "שם",
  "שמחת",
  "תורה",
]);
const HEBREW_SEFER_TITLE_HINTS = new Set([
  ...HEBREW_SEFER_TITLE_STARTS,
  "בהם",
  "גבוה",
  "הבהיר",
  "הלוי",
  "הקדוש",
  "התורה",
  "זוהר",
  "חן",
  "לתורה",
  "משלחן",
  "משמואל",
  "עינים",
  "ערוך",
]);
const COMMON_HEBREW_SEFER_FALSE_POSITIVES = new Set([
  "אהבה הקדוש ברוך הוא",
  "אהבת ה׳",
  "אהבת חינם",
  "אהבת ישראל",
  "אוצר חביב",
  "אור אייניקלעך",
  "אור הגנוז",
  "אור כשדים",
  "אור כשדים מדרש",
  "אור לגוים",
  "אור שהיה בעת יציאת מצרים",
  "אלף בית",
  "בית אביך",
  "בית גנוזה",
  "בית גנזיו",
  "בית דין",
  "בית דין של מעלה",
  "בית החיים",
  "בית הכנסת",
  "בית המקדש",
  "בית המקדש במהרה בימינו אמן",
  "בית המקדש של מטה",
  "בית המקדש של מעלה",
  "בית הסהר מקום אשר אסירי המלך",
  "בית הסורים",
  "בית השלישי",
  "בית מדרש",
  "בית מדרש טוב",
  "בית מקדש של מעלה",
  "בית נאמן בישראל",
  "בית ראשון",
  "בית שמש",
  "בית שני",
  "בנין בית המקדש",
  "בת קול",
  "דברי חז״ל",
  "דברי מוסר",
  "דברי תורה",
  "דברים משנה תורה",
  "דעת ה׳",
  "דעת יחיד",
  "דעת רבים",
  "הקדוש ברוך הוא",
]);
const ENGLISH_SEFER_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "by",
  "for",
  "from",
  "in",
  "of",
  "on",
  "that",
  "the",
  "this",
  "to",
  "with",
]);
const ENGLISH_WORD = String.raw`\p{Lu}[\p{L}]+(?:['’][\p{L}]+)?`;
const ENGLISH_INITIAL = String.raw`\p{Lu}\.?`;
const ENGLISH_NAME_PART = `(?:${ENGLISH_WORD}|${ENGLISH_INITIAL})`;
const ENGLISH_NAME_CONNECTOR = String.raw`(?:ben|bar|de|del|van|von|of|the)`;
const ENGLISH_NAME_SEQUENCE = `${ENGLISH_NAME_PART}(?:\\s+(?:${ENGLISH_NAME_CONNECTOR}|${ENGLISH_NAME_PART})){0,5}`;
const HONORIFIC_RE = new RegExp(
  String.raw`\b(?:R['’]?|Rabbi|Rav|Reb|Mr\.?|Mrs\.?|Dr\.?)\s+${ENGLISH_NAME_SEQUENCE}`,
  "gu"
);
const CAPITAL_SEQUENCE_RE = new RegExp(
  String.raw`\b${ENGLISH_NAME_SEQUENCE}\b`,
  "gu"
);

const LEADING_TRAILING_PUNCTUATION_RE = /^[\s.,;:!?()[\]{}"“”‘’'`]+|[\s.,;:!?()[\]{}"“”‘’'`]+$/g;
const COMMON_CAPITAL_FALSE_POSITIVES = new Set([
  "A",
  "An",
  "And",
  "As",
  "At",
  "Before",
  "But",
  "By",
  "During",
  "Every",
  "First",
  "For",
  "Furthermore",
  "He",
  "However",
  "I",
  "If",
  "In",
  "It",
  "Let",
  "Now",
  "Of",
  "On",
  "One",
  "Our",
  "So",
  "That",
  "The",
  "Then",
  "There",
  "Therefore",
  "These",
  "They",
  "This",
  "To",
  "We",
  "What",
  "When",
  "Where",
  "Why",
  "With",
  "You",
]);

function usage() {
  console.log(`Usage: node scan-person-index-candidates.js [options]

Create a broad candidate report for a future person-name index.

Options:
  --output <file>       Markdown report path. Default: person-index-candidates.md
  --json <file>         JSON candidate path. Default: person-index-candidates.json
  --review-file <file>  Review decisions to honor. Default: person-index-review.json
  --limit <n>           Scan only first n docs, for testing.
  --help                Show this help text.`);
}

function parseArgs(argv) {
  const options = {
    output: REPORT_FILE,
    json: JSON_FILE,
    reviewFile: REVIEW_FILE,
    limit: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--output") {
      options.output = path.resolve(argv[++i] || "");
    } else if (arg === "--json") {
      options.json = path.resolve(argv[++i] || "");
    } else if (arg === "--review-file") {
      options.reviewFile = path.resolve(argv[++i] || "");
    } else if (arg === "--limit") {
      options.limit = Number.parseInt(argv[++i] || "", 10);
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.limit !== null && (!Number.isInteger(options.limit) || options.limit < 1)) {
    throw new Error("--limit must be a positive integer");
  }

  return options;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 100,
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

async function findDocxFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findDocxFiles(fullPath)));
    } else if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith(".docx") &&
      !entry.name.startsWith("~$")
    ) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function normalizeCandidate(value) {
  return value
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .replace(LEADING_TRAILING_PUNCTUATION_RE, "")
    .trim();
}

function normalizeSeferCandidate(value) {
  return normalizeCandidate(value)
    .replace(/^(?:ספר|the sefer|sefer)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function candidateKey(value) {
  return normalizeCandidate(value).toLowerCase();
}

function contextFor(text, index, length) {
  const start = Math.max(0, index - 80);
  const end = Math.min(text.length, index + length + 90);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";

  return `${prefix}${text.slice(start, end)}${suffix}`
    .replace(/\s+/g, " ")
    .trim();
}

function candidateLanguage(value) {
  return /[\u0590-\u05FF]/u.test(value) ? "hebrew" : "english";
}

function isWeakEnglishCandidate(value, source) {
  if (source !== "capitalized") {
    return false;
  }

  const words = value.split(/\s+/);
  return words.length === 1 && COMMON_CAPITAL_FALSE_POSITIVES.has(value);
}

function addCandidate(candidates, rawValue, source, filePath, text, index) {
  const value = source.includes("sefer")
    ? normalizeSeferCandidate(rawValue)
    : normalizeCandidate(rawValue);
  if (!value || isWeakEnglishCandidate(value, source)) {
    return;
  }

  const key = candidateKey(value);
  if (!key) {
    return;
  }

  if (!candidates.has(key)) {
    candidates.set(key, {
      key,
      value,
      language: candidateLanguage(value),
      sources: new Set(),
      count: 0,
      files: new Set(),
      examples: [],
    });
  }

  const item = candidates.get(key);
  item.count += 1;
  item.sources.add(source);
  item.files.add(filePath);

  if (item.examples.length < MAX_EXAMPLES) {
    item.examples.push({
      filePath,
      source,
      context: contextFor(text, index, rawValue.length),
    });
  }
}

function hebrewTokens(value) {
  return normalizeCandidate(value).split(/\s+/).filter(Boolean);
}

function isLikelyHebrewSeferTitle(value, contextDriven = false) {
  const normalized = normalizeSeferCandidate(value);
  if (COMMON_HEBREW_SEFER_FALSE_POSITIVES.has(normalized)) {
    return false;
  }

  const tokens = hebrewTokens(normalized);
  if (tokens.length < 2 || tokens.length > 6) {
    return false;
  }

  if (tokens[0] === "ספר") {
    tokens.shift();
  }

  if (tokens.length < 2) {
    return false;
  }

  if (HEBREW_SEFER_TITLE_STARTS.has(tokens[0])) {
    return true;
  }

  const hintCount = tokens.filter((token) => HEBREW_SEFER_TITLE_HINTS.has(token)).length;
  return contextDriven ? hintCount >= 1 : hintCount >= 2;
}

function isLikelyEnglishSeferTitle(value) {
  const words = normalizeCandidate(value).split(/\s+/);
  if (words.length < 2) {
    return false;
  }

  return words.some((word) => !ENGLISH_SEFER_STOP_WORDS.has(word.toLowerCase()));
}

function collectCandidatesFromText(candidates, text, filePath) {
  for (const match of text.matchAll(HONORIFIC_RE)) {
    addCandidate(candidates, match[0], "english-honorific", filePath, text, match.index);
  }

  for (const match of text.matchAll(CAPITAL_SEQUENCE_RE)) {
    addCandidate(candidates, match[0], "capitalized", filePath, text, match.index);
  }

  for (const match of text.matchAll(HEBREW_ACRONYM_RE)) {
    addCandidate(candidates, match[0], "hebrew-acronym", filePath, text, match.index);
  }

  for (const match of text.matchAll(HEBREW_TITLE_RE)) {
    addCandidate(candidates, match[0], "hebrew-title", filePath, text, match.index);
  }

  for (const match of text.matchAll(HEBREW_SEFER_CONTEXT_RE)) {
    if (isLikelyHebrewSeferTitle(match[1], true)) {
      addCandidate(candidates, match[1], "hebrew-sefer-title", filePath, text, match.index);
    }
  }

  for (const match of text.matchAll(HEBREW_PHRASE_RE)) {
    if (isLikelyHebrewSeferTitle(match[0], false)) {
      addCandidate(candidates, match[0], "hebrew-sefer-title", filePath, text, match.index);
    }
  }

  for (const match of text.matchAll(ENGLISH_SEFER_CONTEXT_RE)) {
    if (isLikelyEnglishSeferTitle(match[1])) {
      addCandidate(candidates, match[1], "english-sefer-title", filePath, text, match.index);
    }
  }
}

async function loadIgnoredKeys(reviewFile) {
  try {
    const review = JSON.parse(await fs.readFile(reviewFile, "utf8"));
    const ignored = new Set();
    const decisions = review.decisions || {};

    for (const [key, decision] of Object.entries(decisions)) {
      if (["ignore", "false-positive", "false_positive"].includes(decision?.status)) {
        ignored.add(candidateKey(decision.value || decision.candidate || key));
        ignored.add(candidateKey(key));
      }
    }

    for (const value of review.ignored || []) {
      ignored.add(candidateKey(value));
    }

    return ignored;
  } catch (error) {
    if (error.code === "ENOENT") {
      return new Set();
    }

    throw error;
  }
}

function markdownFileLink(filePath) {
  const relative = path.relative(ROOT_DIR, filePath);
  return `[${relative}](${filePath})`;
}

function serializableCandidate(item) {
  return {
    key: item.key,
    value: item.value,
    language: item.language,
    sources: [...item.sources].sort(),
    count: item.count,
    files: [...item.files].sort().map((filePath) => path.relative(ROOT_DIR, filePath)),
    examples: item.examples.map((example) => ({
      filePath: path.relative(ROOT_DIR, example.filePath),
      source: example.source,
      context: example.context,
    })),
  };
}

function renderReport(candidates, details) {
  const lines = [];

  lines.push("# Person Index Candidate Report");
  lines.push("");
  lines.push("Generated by `npm run scan-person-index-candidates`.");
  lines.push("");
  lines.push("This is a review-only report. No source documents were edited.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Documents scanned: ${details.documentCount}`);
  lines.push(`- Candidates shown: ${candidates.length}`);
  lines.push(`- Ignored candidates hidden: ${details.ignoredCount}`);
  lines.push("");
  lines.push("## Candidates");
  lines.push("");

  for (const item of candidates) {
    lines.push(`- \`${item.value}\``);
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const ignoredKeys = await loadIgnoredKeys(options.reviewFile);
  let docxFiles = await findDocxFiles(FILES_DIR);

  if (options.limit !== null) {
    docxFiles = docxFiles.slice(0, options.limit);
  }

  const candidatesByKey = new Map();

  for (const filePath of docxFiles) {
    const text = run("pandoc", [filePath, "-t", "plain"]);
    collectCandidatesFromText(candidatesByKey, text, filePath);
  }

  const allCandidates = [...candidatesByKey.values()]
    .map(serializableCandidate)
    .sort((a, b) => a.language.localeCompare(b.language) || a.value.localeCompare(b.value));
  const candidates = allCandidates.filter((item) => !ignoredKeys.has(item.key));
  const report = renderReport(candidates, {
    documentCount: docxFiles.length,
    ignoredCount: allCandidates.length - candidates.length,
  });

  await fs.writeFile(options.output, report, "utf8");
  await fs.writeFile(options.json, `${JSON.stringify({
    version: 1,
    generatedAt: new Date().toISOString(),
    documentsScanned: docxFiles.length,
    reviewFile: path.relative(ROOT_DIR, options.reviewFile),
    candidates,
  }, null, 2)}\n`, "utf8");

  console.log(`Wrote ${path.relative(ROOT_DIR, options.output)}`);
  console.log(`Wrote ${path.relative(ROOT_DIR, options.json)}`);
  console.log(`Found ${candidates.length} candidate${candidates.length === 1 ? "" : "s"} after hiding ${allCandidates.length - candidates.length} ignored candidate${allCandidates.length - candidates.length === 1 ? "" : "s"}.`);
}

main().catch((error) => {
  console.error(`scan-person-index-candidates failed: ${error.message}`);
  process.exitCode = 1;
});
