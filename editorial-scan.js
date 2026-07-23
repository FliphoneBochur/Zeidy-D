#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = __dirname;
const FILES_DIR = path.join(ROOT_DIR, "Files");
const ROUTES_FILE = path.join(ROOT_DIR, "routes.json");
const DICTIONARY_FILE = "/usr/share/dict/words";
const SPELLING_NOTES_FILE = path.join(ROOT_DIR, "Correct Spelling.txt");
const REPORT_FILE = path.join(ROOT_DIR, "editorial-report.md");

const HEBREW_RE = /[\u0590-\u05FF]/u;
const WORD_RE = /[A-Za-z][A-Za-z'’.-]*[A-Za-z]|[A-Za-z]/g;
const MAX_CONTEXTS = 4;

const TORAH_TERMS = [
  "acharonim",
  "aggadah",
  "aliyah",
  "aliyos",
  "amora",
  "amoraim",
  "aveirah",
  "aveiros",
  "baal",
  "baalei",
  "baalhabatim",
  "baomer",
  "baruch",
  "beis",
  "bentch",
  "bentched",
  "bentches",
  "bezras",
  "bnei",
  "bochur",
  "chacham",
  "chachamim",
  "chassidish",
  "chassidus",
  "chazal",
  "chelek",
  "chevra",
  "chiddush",
  "chiddushim",
  "chinuch",
  "chizuk",
  "choshen",
  "chumash",
  "daf",
  "daven",
  "davened",
  "davening",
  "derasha",
  "devar",
  "divrei",
  "dvar",
  "emunah",
  "frum",
  "gedolim",
  "gemara",
  "gematria",
  "geulah",
  "goy",
  "goyim",
  "goyish",
  "hachnasas",
  "haftarah",
  "hakadosh",
  "halacha",
  "halachic",
  "hashem",
  "hashgacha",
  "haskama",
  "hishtadlus",
  "iyun",
  "kabbalah",
  "kaddish",
  "kedusha",
  "kiddush",
  "kinderlach",
  "kippur",
  "kiruv",
  "kivrei",
  "klal",
  "lashon",
  "lech",
  "maaseh",
  "machshava",
  "machzor",
  "maftir",
  "maharal",
  "malachim",
  "marah",
  "masechta",
  "matzah",
  "mechila",
  "mechitzah",
  "medrash",
  "meforshim",
  "mehalech",
  "melech",
  "menuchah",
  "midah",
  "middah",
  "midrash",
  "mincha",
  "minhag",
  "minhagim",
  "mishkan",
  "mishna",
  "mishnah",
  "mitzvah",
  "mitzvos",
  "mussaf",
  "nechama",
  "neshama",
  "nissim",
  "olam",
  "parsha",
  "parshas",
  "pasuk",
  "pesukim",
  "rebbe",
  "rebbi",
  "ribono",
  "rishonim",
  "ruchniyus",
  "sefer",
  "seforim",
  "shabbos",
  "shacharis",
  "shas",
  "shiur",
  "shlita",
  "shul",
  "simcha",
  "siyata",
  "sugya",
  "talmid",
  "talmidim",
  "tanna",
  "tannaim",
  "tefillah",
  "tefillin",
  "tehillim",
  "teshuva",
  "tikkun",
  "torah",
  "tov",
  "tzaddik",
  "tzaddikim",
  "yahrtzeit",
  "yidden",
  "yiddishkeit",
  "yiras",
  "yom",
  "yontif",
  "zchus",
  "zeidy",
];

const COMMON_ALLOWED_WORDS = [
  "accompanied",
  "a.m",
  "airline",
  "airlines",
  "ain't",
  "anymore",
  "aren't",
  "antisemitism",
  "anytime",
  "artwork",
  "awoken",
  "began",
  "bio",
  "blew",
  "box",
  "boxes",
  "breathtaking",
  "choicest",
  "clarified",
  "closest",
  "compelled",
  "conferred",
  "cookie",
  "couldn't",
  "denied",
  "didn't",
  "died",
  "dumbfounded",
  "e.g",
  "email",
  "expertise",
  "farmhand",
  "father-in-law's",
  "foresaw",
  "foreseen",
  "forgave",
  "forgiven",
  "gentlemen",
  "glorified",
  "goodbye",
  "grandchildren",
  "great-grandchildren",
  "hadn't",
  "hang",
  "handyman's",
  "harkens",
  "hasn't",
  "haven't",
  "heard",
  "heartwarming",
  "holier-than-thou",
  "holiest",
  "hummed",
  "humblest",
  "horrified",
  "identified",
  "impactful",
  "isn't",
  "jammed",
  "jutted",
  "kabbalistic",
  "lifespan",
  "ma'am",
  "mafioso",
  "maven",
  "meantime",
  "mindset",
  "midpoint",
  "midpoints",
  "multiplied",
  "multi-factorial",
  "multi-tasking",
  "newborn",
  "newfound",
  "nicest",
  "nucleic",
  "nullified",
  "o'clock",
  "occurred",
  "okay",
  "omitted",
  "outdid",
  "overcame",
  "overheard",
  "overpaid",
  "owed",
  "p.m",
  "p.s",
  "passerby",
  "personified",
  "pipsqueaks",
  "podcast",
  "pre-computer",
  "prioritized",
  "propel",
  "propels",
  "proud",
  "reaccept",
  "reemphasize",
  "repaid",
  "regretted",
  "reunderstand",
  "ripped",
  "scorecard",
  "sidebar",
  "sidekick",
  "signified",
  "simplest",
  "slammed",
  "spies",
  "tapped",
  "takeaway",
  "takeaways",
  "terrified",
  "undertaken",
  "verified",
  "wasn't",
  "wealthiest",
  "weren't",
  "woken",
  "won't",
  "wouldn't",
  "women",
  "women's",
  "worldwide",
  "worthwhile",
  "creatio",
  "haggadah",
  "nihilo",
  "p'shischa",
  "vis-a-vis",
  "vort",
];

const KNOWN_VARIANT_GROUPS = [
  ["Kippur", "Kipper"],
  ["Baomer", "Ba'omer", "Ba’omer"],
  ["Vayailech", "Vayeilech"],
  ["Matos-Maasei", "Matos/Maasei", "Matos/Massei", "Matos Massei"],
  ["Tazria-Metzora", "Tazria/Metzora"],
  ["Achrei Mos-Kedoshim", "Achrei Mos/Kedoshim"],
  ["Behar-Bechukosai", "Behar/Bechukosai"],
  ["Chukas-Balak", "Chukas/Balak"],
  ["Nitzavim-Vayailech", "Nitzavim/Vayailech", "Nitzavim/Vayeilech"],
  ["Re'eh", "Re’eh"],
  ["Ha'azinu", "Ha’azinu"],
  ["V'zos", "V’zos"],
  ["Tisha B'Av", "Tisha B’Av", "9 Av"],
  ["Tu B'Av", "Tu B’Av", "15 Av"],
  ["Mishna", "Mishnah"],
  ["Medrash", "Midrash"],
  ["Menucha", "Menuchah"],
  ["Mitzvos", "Mitzvot"],
];

function usage() {
  console.log(`Usage: node editorial-scan.js [options]

Create a review-only editorial report for .docx files.

Options:
  --output <file>  Report path. Default: editorial-report.md
  --limit <n>      Scan only the first n docs, for testing.
  --help           Show this help text.`);
}

function parseArgs(argv) {
  const options = {
    output: REPORT_FILE,
    limit: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--output") {
      options.output = path.resolve(argv[++i] || "");
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

async function loadDictionary() {
  const dictionary = new Set();
  const text = await fs.readFile(DICTIONARY_FILE, "utf8");

  for (const line of text.split(/\r?\n/)) {
    const word = normalizeWord(line);
    if (word) {
      dictionary.add(word);
    }
  }

  return dictionary;
}

async function loadAllowlist() {
  const words = new Set([
    ...TORAH_TERMS.map(normalizeWord),
    ...COMMON_ALLOWED_WORDS.map(normalizeWord),
  ]);

  try {
    const text = await fs.readFile(SPELLING_NOTES_FILE, "utf8");
    for (const line of text.split(/\r?\n/)) {
      for (const token of line.matchAll(WORD_RE)) {
        words.add(normalizeWord(token[0]));
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  try {
    const routesDocument = JSON.parse(await fs.readFile(ROUTES_FILE, "utf8"));
    for (const details of Object.values(routesDocument.byRoute || {})) {
      for (const value of [details?.baseFilename, details?.title, details?.contentPath]) {
        if (!value) {
          continue;
        }
        for (const token of value.matchAll(WORD_RE)) {
          words.add(normalizeWord(token[0]));
        }
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  return words;
}

function normalizeWord(value) {
  return value
    .replace(/[’]/g, "'")
    .replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "")
    .toLowerCase();
}

function canonicalLetters(value) {
  return normalizeWord(value).replace(/[^a-z]/g, "");
}

function isPossessiveOrContraction(word, dictionary, allowlist) {
  const normalized = normalizeWord(word);
  if (!normalized.includes("'")) {
    return false;
  }

  const base = normalized.replace(/'(s|d|ll|re|ve|m|t)$/i, "");
  return dictionary.has(base) || allowlist.has(base);
}

function isKnownWord(value, dictionary, allowlist) {
  return dictionary.has(value) || allowlist.has(value);
}

function isKnownInflection(word, dictionary, allowlist) {
  const value = word.normalized;

  if (isKnownWord(value, dictionary, allowlist)) {
    return true;
  }

  const candidates = [];

  if (value.endsWith("s") && value.length > 3) {
    candidates.push(value.slice(0, -1));
  }

  if (value.endsWith("es") && value.length > 4) {
    candidates.push(value.slice(0, -2));
  }

  if (value.endsWith("ies") && value.length > 5) {
    candidates.push(`${value.slice(0, -3)}y`);
  }

  if (value.endsWith("ed") && value.length > 4) {
    candidates.push(value.slice(0, -2));
    candidates.push(value.slice(0, -1));
    if (value.endsWith("ied")) {
      candidates.push(`${value.slice(0, -3)}y`);
    }
    if (value.length > 5 && value.at(-3) === value.at(-4)) {
      candidates.push(value.slice(0, -3));
    }
  }

  if (value.endsWith("ing") && value.length > 5) {
    candidates.push(value.slice(0, -3));
    candidates.push(`${value.slice(0, -3)}e`);
    const doubled = value.slice(0, -4);
    candidates.push(doubled);
  }

  if (value.endsWith("ly") && value.length > 4) {
    candidates.push(value.slice(0, -2));
  }

  if (value.endsWith("er") && value.length > 4) {
    candidates.push(value.slice(0, -2));
    candidates.push(`${value.slice(0, -1)}e`);
  }

  if (value.endsWith("est") && value.length > 5) {
    candidates.push(value.slice(0, -3));
    candidates.push(`${value.slice(0, -2)}e`);
  }

  return candidates.some((candidate) => isKnownWord(candidate, dictionary, allowlist));
}

function isKnownHyphenatedCompound(word, dictionary, allowlist) {
  if (!word.normalized.includes("-")) {
    return false;
  }

  const parts = word.normalized.split("-").filter(Boolean);
  if (parts.length < 2) {
    return false;
  }

  return parts.every((part) =>
    part.length <= 2 ||
    isKnownInflection({ raw: part, normalized: part }, dictionary, allowlist)
  );
}

function contextFor(text, index, length) {
  const start = Math.max(0, index - 70);
  const end = Math.min(text.length, index + length + 80);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";

  return `${prefix}${text.slice(start, end)}${suffix}`
    .replace(/\s+/g, " ")
    .trim();
}

function extractWords(text, filePath) {
  const words = [];

  for (const match of text.matchAll(WORD_RE)) {
    const raw = match[0];
    if (HEBREW_RE.test(raw)) {
      continue;
    }

    words.push({
      raw,
      normalized: normalizeWord(raw),
      letters: canonicalLetters(raw),
      filePath,
      index: match.index,
      context: contextFor(text, match.index, raw.length),
    });
  }

  return words.filter((word) => word.normalized);
}

function isProbablyAllowed(word, dictionary, allowlist) {
  if (isKnownInflection(word, dictionary, allowlist)) {
    return true;
  }

  if (isKnownHyphenatedCompound(word, dictionary, allowlist)) {
    return true;
  }

  if (isPossessiveOrContraction(word.raw, dictionary, allowlist)) {
    return true;
  }

  if (/^[A-Z][a-z]+(?:'[a-z]+)?$/.test(word.raw)) {
    return true;
  }

  if (/^[A-Z]{2,}$/.test(word.raw)) {
    return true;
  }

  if (word.normalized.length <= 2) {
    return true;
  }

  return false;
}

function collectUnknownWords(words, dictionary, allowlist) {
  const byWord = new Map();

  for (const word of words) {
    if (isProbablyAllowed(word, dictionary, allowlist)) {
      continue;
    }

    if (!byWord.has(word.normalized)) {
      byWord.set(word.normalized, {
        word: word.normalized,
        examples: [],
        count: 0,
        files: new Set(),
      });
    }

    const item = byWord.get(word.normalized);
    item.count += 1;
    item.files.add(word.filePath);
    if (item.examples.length < MAX_CONTEXTS) {
      item.examples.push(word);
    }
  }

  return [...byWord.values()].sort(
    (a, b) => a.count - b.count || a.word.localeCompare(b.word)
  );
}

function collectJoinedWords(words, dictionary, allowlist) {
  const joined = [];
  const isKnown = (value) => dictionary.has(value) || allowlist.has(value);

  for (const word of words) {
    if (isProbablyAllowed(word, dictionary, allowlist) || word.normalized.length < 8) {
      continue;
    }

    for (let i = 3; i <= word.normalized.length - 3; i += 1) {
      const left = word.normalized.slice(0, i);
      const right = word.normalized.slice(i);
      if (isKnown(left) && isKnown(right)) {
        joined.push({
          raw: word.raw,
          split: `${left} ${right}`,
          filePath: word.filePath,
          context: word.context,
        });
        break;
      }
    }
  }

  return joined;
}

function collectKnownVariants(textByFile) {
  const results = [];

  for (const group of KNOWN_VARIANT_GROUPS) {
    const seen = [];

    for (const variant of group) {
      const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(^|[^A-Za-z])(${escaped})(?=$|[^A-Za-z])`, "gi");
      const examples = [];
      let count = 0;

      for (const [filePath, text] of textByFile) {
        for (const match of text.matchAll(re)) {
          count += 1;
          if (examples.length < 2) {
            examples.push({
              filePath,
              context: contextFor(text, match.index + match[1].length, match[2].length),
            });
          }
        }
      }

      if (count > 0) {
        seen.push({ variant, count, examples });
      }
    }

    if (seen.length > 1) {
      results.push({ group, seen });
    }
  }

  return results;
}

function collectNearVariants(words) {
  const formsByLetters = new Map();

  for (const word of words) {
    if (word.letters.length < 5 || /^[A-Z][a-z]+$/.test(word.raw)) {
      continue;
    }

    if (!formsByLetters.has(word.letters)) {
      formsByLetters.set(word.letters, new Map());
    }

    const forms = formsByLetters.get(word.letters);
    if (!forms.has(word.raw)) {
      forms.set(word.raw, { raw: word.raw, count: 0, examples: [] });
    }

    const form = forms.get(word.raw);
    form.count += 1;
    if (form.examples.length < 2) {
      form.examples.push(word);
    }
  }

  return [...formsByLetters.entries()]
    .map(([letters, forms]) => ({
      letters,
      forms: [...forms.values()].sort((a, b) => b.count - a.count),
    }))
    .filter((item) => item.forms.length > 1)
    .sort((a, b) => b.forms.reduce((sum, form) => sum + form.count, 0) - a.forms.reduce((sum, form) => sum + form.count, 0))
    .slice(0, 80);
}

function markdownFileLink(filePath) {
  const relative = path.relative(ROOT_DIR, filePath);
  return `[${relative}](${filePath})`;
}

function renderUnknownWords(items) {
  const lines = [];
  const actionable = items.filter((item) => item.count <= 6).slice(0, 250);

  lines.push(`Found ${items.length} unknown word forms after dictionary and allowlist filtering.`);
  lines.push("");
  lines.push("The list below is sorted rarest-first; rare words are usually more typo-prone.");
  lines.push("");

  for (const item of actionable) {
    lines.push(`- \`${item.word}\` (${item.count}x, ${item.files.size} file${item.files.size === 1 ? "" : "s"})`);
    for (const example of item.examples) {
      lines.push(`  - ${markdownFileLink(example.filePath)}: ${example.context}`);
    }
  }

  return lines.join("\n");
}

function renderJoinedWords(items) {
  const lines = [];

  if (items.length === 0) {
    return "No likely joined English words found.";
  }

  lines.push(`Found ${items.length} possible joined-word issue${items.length === 1 ? "" : "s"}.`);
  lines.push("");

  for (const item of items.slice(0, 200)) {
    lines.push(`- \`${item.raw}\` -> maybe \`${item.split}\``);
    lines.push(`  - ${markdownFileLink(item.filePath)}: ${item.context}`);
  }

  return lines.join("\n");
}

function renderKnownVariants(items) {
  const lines = [];

  if (items.length === 0) {
    return "No known variant groups found with multiple spellings.";
  }

  for (const item of items) {
    lines.push(`- ${item.group.map((variant) => `\`${variant}\``).join(" / ")}`);
    for (const seen of item.seen) {
      lines.push(`  - \`${seen.variant}\`: ${seen.count}x`);
      for (const example of seen.examples) {
        lines.push(`    - ${markdownFileLink(example.filePath)}: ${example.context}`);
      }
    }
  }

  return lines.join("\n");
}

function renderNearVariants(items) {
  const lines = [];

  if (items.length === 0) {
    return "No capitalization/punctuation variants found.";
  }

  lines.push("These share the same letters but differ by punctuation/capitalization.");
  lines.push("");

  for (const item of items) {
    lines.push(`- \`${item.letters}\`: ${item.forms.map((form) => `\`${form.raw}\` (${form.count}x)`).join(", ")}`);
    for (const form of item.forms.slice(0, 3)) {
      const example = form.examples[0];
      if (example) {
        lines.push(`  - ${markdownFileLink(example.filePath)}: ${example.context}`);
      }
    }
  }

  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const dictionary = await loadDictionary();
  const allowlist = await loadAllowlist();
  let docxFiles = await findDocxFiles(FILES_DIR);

  if (options.limit !== null) {
    docxFiles = docxFiles.slice(0, options.limit);
  }

  const textByFile = new Map();
  const allWords = [];

  for (const filePath of docxFiles) {
    const text = run("pandoc", [filePath, "-t", "plain"]);
    textByFile.set(filePath, text);
    allWords.push(...extractWords(text, filePath));
  }

  const unknownWords = collectUnknownWords(allWords, dictionary, allowlist);
  const joinedWords = collectJoinedWords(allWords, dictionary, allowlist);
  const knownVariants = collectKnownVariants(textByFile);
  const nearVariants = collectNearVariants(allWords);

  const report = `# Editorial Report

Generated by \`npm run editorial-scan\`.

This is a review-only report. No source documents were edited.

## Summary

- Documents scanned: ${docxFiles.length}
- Word tokens scanned: ${allWords.length}
- Unknown word forms: ${unknownWords.length}
- Possible joined English words: ${joinedWords.length}
- Known spelling variant groups: ${knownVariants.length}
- Punctuation/capitalization variant groups shown: ${nearVariants.length}

## Possible Spelling Errors

${renderUnknownWords(unknownWords)}

## Possible Joined Words

${renderJoinedWords(joinedWords)}

## Known Spelling Variants

${renderKnownVariants(knownVariants)}

## Punctuation And Capitalization Variants

${renderNearVariants(nearVariants)}
`;

  await fs.writeFile(options.output, report, "utf8");
  console.log(`Wrote ${path.relative(ROOT_DIR, options.output)}`);
}

main().catch((error) => {
  console.error(`editorial-scan failed: ${error.message}`);
  process.exitCode = 1;
});
