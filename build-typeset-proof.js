#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = __dirname;
const FILES_DIR = path.join(ROOT_DIR, "Files");
const ROUTES_FILE = path.join(ROOT_DIR, "routes.json");
const PERSON_INDEX_REVIEW_FILE = path.join(ROOT_DIR, "person-index-review.json");
const OUTPUT_DIR = path.join(ROOT_DIR, "typeset");
const DOMAIN = "https://zeidyd.com";
const FRONT_MATTER_ROUTES = ["/rabbi-oelbaum-haskama/", "/about-the-name/"];
const NO_FOOTER_ROUTES = new Set(["/about-the-name/"]);
const LTR_ISOLATE = "\u2066";
const RTL_ISOLATE = "\u2067";
const POP_DIRECTIONAL_ISOLATE = "\u2069";
const HEBREW_LETTERS = "[\\u0590-\\u05FF\\uFB1D-\\uFB4F]";
const HEBREW_BASE_LETTERS = "[\\u05D0-\\u05EA\\uFB1D-\\uFB4F]";
const HEBREW_INTERNAL_QUOTE = "(?:\\\\[\"']|[\"'׳״])";
const HEBREW_TOKEN = `${HEBREW_LETTERS}+(?:${HEBREW_INTERNAL_QUOTE}${HEBREW_LETTERS}+)*(?:${HEBREW_INTERNAL_QUOTE})?`;
const HEBREW_REF_TOKEN = `${HEBREW_BASE_LETTERS}+(?:${HEBREW_INTERNAL_QUOTE}${HEBREW_BASE_LETTERS}+)*(?:${HEBREW_INTERNAL_QUOTE})?`;
const HEBREW_ACRONYM = `${HEBREW_LETTERS}+(?:(?:${HEBREW_INTERNAL_QUOTE}${HEBREW_LETTERS}+)+|${HEBREW_INTERNAL_QUOTE})`;
const HEBREW_STRONG_ACRONYM = `(?:${HEBREW_LETTERS}+(?:${HEBREW_INTERNAL_QUOTE}${HEBREW_LETTERS}+)+|${HEBREW_LETTERS}{2,}${HEBREW_INTERNAL_QUOTE})`;
const HEBREW_PAREN_REFERENCE = `\\((?=[^()\\n]{1,120}\\))(?=[^()\\n]{0,120}(?:${HEBREW_STRONG_ACRONYM}|:))(?:${HEBREW_TOKEN}|\\s|:|-){1,120}\\)`;
const HEBREW_TEXT_WITH_PAREN_REFERENCE_RE = new RegExp(
  `(${HEBREW_TOKEN}(?:(?:\\s+${HEBREW_TOKEN})|(?:\\s+\\\\?\\.\\.\\.)){0,160})\\s+(${HEBREW_PAREN_REFERENCE})(?=\\s*\\.)`,
  "gu"
);
const HEBREW_PAREN_REFERENCE_RE = new RegExp(HEBREW_PAREN_REFERENCE, "gu");
const HEBREW_BARE_REFERENCE_RE = new RegExp(
  `(?:${HEBREW_TOKEN}\\s+)?${HEBREW_REF_TOKEN}\\s*:\\s*${HEBREW_REF_TOKEN}(?=\\s*:)`,
  "gu"
);
const HEBREW_LOOSE_CITATION_CLOSE_RE = new RegExp(
  `(^|\\s)((?:${HEBREW_TOKEN}\\s+)?${HEBREW_TOKEN}:${HEBREW_TOKEN})\\)\\)+(?=\\s+${HEBREW_TOKEN})`,
  "gu"
);
const HEBREW_ACRONYM_PHRASE = `(?:${HEBREW_TOKEN}(?:\\s+${HEBREW_TOKEN}){0,3}\\s+${HEBREW_STRONG_ACRONYM}|${HEBREW_STRONG_ACRONYM}(?:\\s+${HEBREW_TOKEN}){1,3})`;
const HEBREW_ACRONYM_COMMA_SEQUENCE_RE = new RegExp(
  `${HEBREW_ACRONYM_PHRASE},\\s+${HEBREW_ACRONYM_PHRASE}`,
  "gu"
);
const HEBREW_ACRONYM_CONTEXT_RE = new RegExp(
  HEBREW_ACRONYM_PHRASE,
  "gu"
);
const HEBREW_TRAILING_ACRONYM_PHRASE_RE = new RegExp(
  `${HEBREW_TOKEN}(?:\\s+${HEBREW_TOKEN}){1,3}\\s+${HEBREW_STRONG_ACRONYM}`,
  "gu"
);
const HEBREW_ACRONYM_RE = new RegExp(
  `${HEBREW_STRONG_ACRONYM}(?:\\s+${HEBREW_STRONG_ACRONYM})*`,
  "gu"
);
const HEBREW_PHRASE_RE = new RegExp(
  `${HEBREW_TOKEN}(?:\\s+${HEBREW_TOKEN})*`,
  "gu"
);
const MISPLACED_HEBREW_COMMA_RE = new RegExp(
  `,\\s*,(${HEBREW_TOKEN}(?:\\s+${HEBREW_TOKEN})*)(?=\\s+[A-Za-z])`,
  "gu"
);
const HEBREW_CITATION_COLON_RE = new RegExp(
  `(^|[^\\u0590-\\u05FF\\uFB1D-\\uFB4F])(${HEBREW_REF_TOKEN})\\s*:\\s*(${HEBREW_REF_TOKEN})(?!${HEBREW_LETTERS})`,
  "gu"
);
const MISSING_OPEN_HEBREW_CITATION_PAREN_RE = new RegExp(
  `(\\bthe\\s+${HEBREW_TOKEN}(?:\\s+${HEBREW_TOKEN})*?)\\s+((?:${HEBREW_TOKEN}\\s+)?${HEBREW_TOKEN}:${HEBREW_TOKEN})\\)\\)+\\s*:`,
  "gu"
);
const MALFORMED_ESCAPED_OPEN_HEBREW_CITATION_RE = new RegExp(
  `\\(\\\\\\(((?:${HEBREW_TOKEN}\\s+)?${HEBREW_TOKEN}:${HEBREW_TOKEN}):\\s*(?=${HEBREW_LETTERS})`,
  "gu"
);
const MALFORMED_ESCAPED_OPEN_NUMERIC_CITATION_RE = new RegExp(
  `\\((\\d+:\\d+)\\\\\\(:\\s*(?=${HEBREW_LETTERS})`,
  "gu"
);
const HEBREW_TO_ENGLISH_DASH_RE = new RegExp(
  `(${HEBREW_TOKEN}(?:\\s+${HEBREW_TOKEN})*)\\s*-\\s*(?=[A-Za-z])`,
  "gu"
);

function usage() {
  console.log(`Usage: node build-typeset-proof.js [options]

Build a Typst proof or full-book PDF from .docx source files.

Options:
  --all             Include every route from routes.json.
  --limit <n>       Number of routes to include. Default: 5
  --route <route>   Include one route. Can be repeated.
  --size <size>     Page size: 5x8 or 6x9. Default: 6x9
  --output <name>   Output basename inside typeset/. Default: proof
  --person-index    Append the reviewed person index.
  --no-person-index Do not append the reviewed person index.
  --help            Show this help text.`);
}

function parseArgs(argv) {
  const options = {
    limit: 5,
    all: false,
    routes: [],
    size: "6x9",
    output: "proof",
    personIndex: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--limit") {
      options.limit = Number.parseInt(argv[++i] || "", 10);
    } else if (arg === "--all") {
      options.all = true;
    } else if (arg === "--route") {
      options.routes.push(argv[++i] || "");
    } else if (arg === "--size") {
      options.size = argv[++i] || "";
    } else if (arg === "--output") {
      options.output = argv[++i] || "";
    } else if (arg === "--person-index") {
      options.personIndex = true;
    } else if (arg === "--no-person-index") {
      options.personIndex = false;
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isInteger(options.limit) || options.limit < 1) {
    throw new Error("--limit must be a positive integer");
  }

  if (!["5x8", "6x9"].includes(options.size)) {
    throw new Error("--size must be 5x8 or 6x9");
  }

  if (!/^[A-Za-z0-9._-]+$/.test(options.output)) {
    throw new Error("--output must be a simple filename without spaces");
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
    throw new Error(`${command} ${args.join(" ")} failed${detail ? `:\n${detail}` : ""}`);
  }

  return result.stdout;
}

function typstString(value) {
  return JSON.stringify(value);
}

function typstLabel(value) {
  return `label(${typstString(value)})`;
}

function titleFromBaseFilename(baseFilename) {
  return baseFilename.replace(/\s+/g, " ").trim();
}

function normalizeIndexKey(value) {
  return value
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/״/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function sortIndexDisplayName(value) {
  return normalizeIndexKey(value).replace(/^((r|rabbi|rav|dr)\.?\s+|r['’]\s+)/, "");
}

function uniqueValues(values) {
  const seen = new Set();
  const unique = [];

  for (const value of values) {
    const trimmed = String(value || "").replace(/\s+/g, " ").trim();
    const key = normalizeIndexKey(trimmed);

    if (!trimmed || seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(trimmed);
  }

  return unique;
}

async function loadPersonIndex() {
  let review;

  try {
    review = JSON.parse(await fs.readFile(PERSON_INDEX_REVIEW_FILE, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }

  if (review.version !== 2 || !review.people || typeof review.people !== "object") {
    return [];
  }

  return Object.entries(review.people)
    .map(([id, person]) => ({
      id,
      displayName: String(person.displayName || "").trim(),
      aliases: uniqueValues([person.displayName, ...(person.aliases || [])]),
    }))
    .filter((person) => person.displayName && person.aliases.length > 0)
    .sort((a, b) => sortIndexDisplayName(a.displayName).localeCompare(sortIndexDisplayName(b.displayName)));
}

function escapeRegexChar(char) {
  return char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function aliasRegexSource(alias) {
  return Array.from(alias).map((char) => {
    if (/\s/.test(char)) {
      return "\\s+";
    }

    if (char === "'" || char === "’" || char === "‘") {
      return "['’‘]";
    }

    if (char === '"' || char === "״" || char === "“" || char === "”") {
      return '["״“”]';
    }

    return escapeRegexChar(char);
  }).join("");
}

function personAliasRegex(person) {
  const aliasSources = person.aliases
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(aliasRegexSource);

  if (aliasSources.length === 0) {
    return null;
  }

  const boundaryChars = "A-Za-z0-9\\u0590-\\u05FF\\uFB1D-\\uFB4F";
  return new RegExp(`(?<![${boundaryChars}])(?:${aliasSources.join("|")})(?![${boundaryChars}])`, "gu");
}

function createPersonIndexState(people) {
  return {
    people,
    mentions: new Map(people.map((person) => [person.id, []])),
    nextMarker: 1,
  };
}

function tagPersonIndexMentions(typstContent, indexState) {
  if (!indexState || indexState.people.length === 0) {
    return typstContent;
  }

  let tagged = typstContent;

  for (const person of indexState.people) {
    const re = personAliasRegex(person);
    if (!re) {
      continue;
    }

    tagged = tagged.replace(re, (match) => {
      const marker = `person-index-${person.id}-${indexState.nextMarker}`;
      indexState.nextMarker += 1;
      indexState.mentions.get(person.id).push(marker);
      return `${match}#metadata(none) <${marker}>`;
    });
  }

  return tagged;
}

function normalizeTitle(value) {
  return value
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/\bkipper\b/g, "kippur")
    .replace(/\bKipper\b/g, "Kippur")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[\\#*_`]/g, "")
    .replace(/[/-]/g, " ")
    .replace(/\s*\(\d+\)\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function stripDuplicateTitle(typstContent, titles) {
  const lines = typstContent.replace(/\r\n/g, "\n").split("\n");
  const firstContentIndex = lines.findIndex((line) => line.trim() !== "");
  const titleSet = new Set(titles.filter(Boolean).map(normalizeTitle));

  if (
    firstContentIndex >= 0 &&
    titleSet.has(normalizeTitle(lines[firstContentIndex]))
  ) {
    lines.splice(firstContentIndex, 1);
    while (lines[0] === "") {
      lines.shift();
    }
  }

  return lines.join("\n").trim();
}

function normalizeMisplacedHebrewCommas(typstContent) {
  return typstContent.replace(MISPLACED_HEBREW_COMMA_RE, (_match, hebrewPhrase) => {
    return `, ${hebrewPhrase},`;
  });
}

function normalizePunctuationSpacing(typstContent) {
  return typstContent
    .replace(/\u2014/g, "-")
    .replace(MALFORMED_ESCAPED_OPEN_HEBREW_CITATION_RE, "($1): ")
    .replace(MALFORMED_ESCAPED_OPEN_NUMERIC_CITATION_RE, "($1): ")
    .replace(/\s+([,;:])/g, "$1")
    .replace(/([,;:])\s*/g, "$1 ")
    .replace(/,\s*,\s*/g, ", ")
    .replace(/(\d+):\s+(\d+)/g, "$1:$2")
    .replace(new RegExp(`(\\(\\d+:\\d+\\))(?=${HEBREW_LETTERS})`, "gu"), "$1 ")
    .replace(HEBREW_CITATION_COLON_RE, "$1$2:$3")
    .replace(HEBREW_LOOSE_CITATION_CLOSE_RE, "$1($2)")
    .replace(MISSING_OPEN_HEBREW_CITATION_PAREN_RE, "$1 ($2):")
    .replace(HEBREW_TO_ENGLISH_DASH_RE, "$1 - ");
}

function isolateHebrewRuns(typstContent) {
  const protectedSequences = [];
  const protect = (value) => {
    const marker = `\uE000${protectedSequences.length}\uE001`;
    protectedSequences.push(value);
    return marker;
  };

  const textWithReferenceSafeContent = typstContent.replace(
    HEBREW_TEXT_WITH_PAREN_REFERENCE_RE,
    (_match, hebrewText, reference) =>
      protect(`${RTL_ISOLATE}${hebrewText} ${LTR_ISOLATE}${reference}${POP_DIRECTIONAL_ISOLATE}${POP_DIRECTIONAL_ISOLATE}`)
  );

  const referenceSafeContent = textWithReferenceSafeContent.replace(HEBREW_PAREN_REFERENCE_RE, (match) => {
    return protect(`${LTR_ISOLATE}${match}${POP_DIRECTIONAL_ISOLATE}`);
  });

  const bareReferenceSafeContent = referenceSafeContent.replace(HEBREW_BARE_REFERENCE_RE, (match) => {
    return protect(`${LTR_ISOLATE}${match}${POP_DIRECTIONAL_ISOLATE}`);
  });

  const acronymCommaSequenceSafeContent = bareReferenceSafeContent.replace(HEBREW_ACRONYM_COMMA_SEQUENCE_RE, (match) => {
    return protect(`${LTR_ISOLATE}${match}${POP_DIRECTIONAL_ISOLATE}`);
  });

  const trailingAcronymPhraseSafeContent = acronymCommaSequenceSafeContent.replace(HEBREW_TRAILING_ACRONYM_PHRASE_RE, (match) => {
    return protect(`${LTR_ISOLATE}${match}${POP_DIRECTIONAL_ISOLATE}`);
  });

  const acronymContextSafeContent = trailingAcronymPhraseSafeContent.replace(HEBREW_ACRONYM_CONTEXT_RE, (match) => {
    return protect(`${LTR_ISOLATE}${match}${POP_DIRECTIONAL_ISOLATE}`);
  });

  const acronymSafeContent = acronymContextSafeContent.replace(HEBREW_ACRONYM_RE, (match) => {
    return protect(`${LTR_ISOLATE}${match}${POP_DIRECTIONAL_ISOLATE}`);
  });

  const isolatedContent = acronymSafeContent.replace(HEBREW_PHRASE_RE, (match) => {
    return `${RTL_ISOLATE}${match}${POP_DIRECTIONAL_ISOLATE}`;
  });

  return isolatedContent.replace(/\uE000(\d+)\uE001/g, (_match, index) => {
    return protectedSequences[Number(index)];
  });
}

function applyTextRules(typstContent) {
  return isolateHebrewRuns(
    normalizeMisplacedHebrewCommas(normalizePunctuationSpacing(typstContent))
  );
}

function pageSettings(size) {
  if (size === "5x8") {
    return {
      width: "5in",
      height: "8in",
      inside: "0.68in",
      outside: "0.55in",
      top: "0.58in",
      bottom: "0.74in",
      fontSize: "11pt",
      leading: "0.58em",
      qrSize: "0.42in",
    };
  }

  return {
    width: "6in",
    height: "9in",
    inside: "0.78in",
    outside: "0.62in",
    top: "0.68in",
    bottom: "0.82in",
    fontSize: "11pt",
    leading: "0.6em",
    qrSize: "0.48in",
  };
}

async function loadEntries(options) {
  const routesDocument = JSON.parse(await fs.readFile(ROUTES_FILE, "utf8"));
  const byRoute = routesDocument.byRoute;

  if (!byRoute || typeof byRoute !== "object" || Array.isArray(byRoute)) {
    throw new Error('routes.json must contain a "byRoute" object');
  }

  const allRoutes = Object.keys(byRoute);
  const bookRoutes = [
    ...FRONT_MATTER_ROUTES,
    ...allRoutes.filter(
      (route) =>
        !FRONT_MATTER_ROUTES.includes(route) &&
        route !== "/bloopers/" &&
        byRoute[route]?.baseFilename
    ),
  ];
  let selectedRoutes =
    options.routes.length > 0
      ? options.routes
      : options.all
        ? bookRoutes
        : allRoutes.slice(0, options.limit);

  return selectedRoutes.map((route) => {
    const details = byRoute[route];
    if (!details) {
      throw new Error(`Route not found in routes.json: ${route}`);
    }

    const baseTitle = titleFromBaseFilename(details.baseFilename);
    const title = details.title
      ? details.title.replace(/\s+/g, " ").trim()
      : baseTitle;
    const directory = path.join(FILES_DIR, details.contentPath);

    return {
      route,
      url: new URL(route, DOMAIN).href,
      title,
      sourceTitles: [title, baseTitle],
      docxPath: path.join(directory, `${details.baseFilename}.docx`),
      qrPath: path.join(directory, `${details.baseFilename}.png`),
      hasFooter: !NO_FOOTER_ROUTES.has(route),
    };
  });
}

async function ensureEntryFiles(entries) {
  for (const entry of entries) {
    await fs.access(entry.docxPath);
    if (entry.hasFooter) {
      await fs.access(entry.qrPath);
    }
  }
}

function convertDocxToTypst(entry, indexState = null) {
  const typst = run("pandoc", [entry.docxPath, "-t", "typst"]);
  const body = stripDuplicateTitle(typst, entry.sourceTitles);
  const indexedBody = indexState ? tagPersonIndexMentions(body, indexState) : body;
  return applyTextRules(indexedBody);
}

function formatDuration(startedAt) {
  const elapsedMs = Date.now() - startedAt;
  return `${(elapsedMs / 1000).toFixed(1)}s`;
}

function renderPersonIndex(indexState) {
  if (!indexState) {
    return "";
  }

  const rows = indexState.people
    .map((person) => ({
      person,
      markers: indexState.mentions.get(person.id) || [],
    }))
    .filter((entry) => entry.markers.length > 0);

  if (rows.length === 0) {
    return "";
  }

  const parts = [
    `#pagebreak()
#set page(footer: page-number-footer())
= Index

#set par(first-line-indent: 0em, justify: false)

#let index-pages(labels) = context {
  let pages = ()
  for marker in labels {
    let page = counter(page).at(marker).first()
    if not pages.contains(page) {
      pages.push(page)
    }
  }
  pages.map(str).join(", ")
}

#let index-row(name, labels) = block(below: 2pt)[
  #grid(
    columns: (1fr, auto),
    gutter: 0.14in,
    [#name],
    [#index-pages(labels)],
  )
]
`,
  ];

  for (const { person, markers } of rows) {
    const labels = markers.map(typstLabel).join(", ");
    const tuple = markers.length === 1 ? `(${labels},)` : `(${labels})`;
    parts.push(`#index-row(${typstString(person.displayName)}, ${tuple})\n`);
  }

  return parts.join("\n");
}

function renderTypstDocument(entries, options, indexState = null) {
  const settings = pageSettings(options.size);
  const parts = [];
  const startedAt = Date.now();

  parts.push(`#set document(title: ${typstString(`Zeidy-D ${options.output}`)})
#set page(
  width: ${settings.width},
  height: ${settings.height},
  margin: (
    inside: ${settings.inside},
    outside: ${settings.outside},
    top: ${settings.top},
    bottom: ${settings.bottom},
  ),
  numbering: "1",
)
#set text(
  font: "Times New Roman",
  size: ${settings.fontSize},
  lang: "en",
  dir: auto,
  hyphenate: false,
)
#set par(
  first-line-indent: 0em,
  justify: true,
  leading: ${settings.leading},
)

#let article-footer(url, qr, show-number: true) = context {
  let number = if show-number {
    text(size: 7.2pt, fill: rgb("#444444"))[
      #counter(page).display()
    ]
  } else {
    []
  }
  let link-text = text(size: 7.2pt, fill: rgb("#222222"))[
    #link(url)[#url]
  ]
  let qr-image = image(qr, width: ${settings.qrSize})
  let left-link-block = box[
    #grid(
      columns: (auto, auto),
      gutter: 0.06in,
      align: bottom,
      qr-image,
      link-text,
    )
  ]
  let right-link-block = box[
    #grid(
      columns: (auto, auto),
      gutter: 0.06in,
      align: bottom,
      link-text,
      qr-image,
    )
  ]

  if calc.odd(here().page()) {
    grid(
      columns: (auto, 1fr, auto),
      align: bottom,
      left-link-block,
      [],
      number,
    )
  } else {
    grid(
      columns: (auto, 1fr, auto),
      align: bottom,
      number,
      [],
      right-link-block,
    )
  }
}

#let page-number-footer() = context {
  let number = text(size: 7.2pt, fill: rgb("#444444"))[
    #counter(page).display()
  ]

  if calc.odd(here().page()) {
    grid(
      columns: (1fr, auto),
      align: bottom,
      [],
      number,
    )
  } else {
    grid(
      columns: (auto, 1fr),
      align: bottom,
      number,
      [],
    )
  }
}

#show heading.where(level: 1): it => {
  set align(center)
  set text(font: "Times New Roman", size: 11pt, weight: "regular")
  block(above: 0pt, below: 16pt)[#it.body]
}

#show par: it => {
  it
}
`);

  console.error(`Converting ${entries.length} article${entries.length === 1 ? "" : "s"} from docx...`);

  let insertedTableOfContents = false;

  entries.forEach((entry, index) => {
    console.error(`[${index + 1}/${entries.length}] ${entry.title}`);
    const isFrontMatter = FRONT_MATTER_ROUTES.includes(entry.route);
    const body = convertDocxToTypst(entry, isFrontMatter ? null : indexState);
    const qrRelativePath = path.relative(OUTPUT_DIR, entry.qrPath).split(path.sep).join("/");
    const shouldInsertTableOfContents =
      options.all && !insertedTableOfContents && !isFrontMatter;

    if (shouldInsertTableOfContents) {
      if (index > 0) {
        parts.push("#pagebreak()\n");
      }

      parts.push(`#set page(footer: none)
#outline(
  title: [Contents],
  target: heading.where(level: 1),
)
#pagebreak()
#counter(page).update(1)
`);
      insertedTableOfContents = true;
    } else if (index > 0) {
      parts.push("#pagebreak()\n");
    }

    const footer = entry.hasFooter
      ? `article-footer(${typstString(entry.url)}, ${typstString(qrRelativePath)}, show-number: ${isFrontMatter ? "false" : "true"})`
      : "none";
    const heading = isFrontMatter
      ? `#heading(level: 1, outlined: false)[${entry.title}]`
      : `= ${entry.title}`;

    parts.push(`#set page(footer: ${footer})
${heading}

${body}
`);
  });

  const indexContent = renderPersonIndex(indexState);
  if (indexContent) {
    parts.push(indexContent);
  }

  console.error(`Finished docx conversion in ${formatDuration(startedAt)}.`);
  return parts.join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const entries = await loadEntries(options);
  const shouldBuildPersonIndex = options.personIndex ?? options.all;
  const personIndexPeople = shouldBuildPersonIndex ? await loadPersonIndex() : [];
  const indexState = shouldBuildPersonIndex
    ? createPersonIndexState(personIndexPeople)
    : null;

  await ensureEntryFiles(entries);
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const typstPath = path.join(OUTPUT_DIR, `${options.output}.typ`);
  const pdfPath = path.join(OUTPUT_DIR, `${options.output}.pdf`);
  const typstDocument = renderTypstDocument(entries, options, indexState);

  await fs.writeFile(typstPath, typstDocument, "utf8");
  const compileStartedAt = Date.now();
  console.error(`Compiling PDF with Typst...`);
  run("typst", ["compile", "--root", ROOT_DIR, typstPath, pdfPath]);
  console.error(`Finished Typst compile in ${formatDuration(compileStartedAt)}.`);

  console.log(`Built ${path.relative(ROOT_DIR, typstPath)}`);
  console.log(`Built ${path.relative(ROOT_DIR, pdfPath)}`);
  console.log(`Included ${entries.length} article${entries.length === 1 ? "" : "s"} at ${options.size}.`);
  if (shouldBuildPersonIndex) {
    const indexedPeople = Array.from(indexState.mentions.values()).filter((markers) => markers.length > 0).length;
    console.log(`Indexed ${indexedPeople} person${indexedPeople === 1 ? "" : "s"}.`);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`build-typeset-proof failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  applyTextRules,
  isolateHebrewRuns,
  normalizeMisplacedHebrewCommas,
  normalizePunctuationSpacing,
  tagPersonIndexMentions,
  stripDuplicateTitle,
};
