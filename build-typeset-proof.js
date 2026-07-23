#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = __dirname;
const FILES_DIR = path.join(ROOT_DIR, "Files");
const ROUTES_FILE = path.join(ROOT_DIR, "routes.json");
const OUTPUT_DIR = path.join(ROOT_DIR, "typeset");
const DOMAIN = "https://zeidyd.com";
const FRONT_MATTER_ROUTES = ["/rabbi-oelbaum-haskama/", "/about-the-name/"];
const NO_FOOTER_ROUTES = new Set(["/about-the-name/"]);
const LTR_ISOLATE = "\u2066";
const RTL_ISOLATE = "\u2067";
const POP_DIRECTIONAL_ISOLATE = "\u2069";
const HEBREW_LETTERS = "[\\u0590-\\u05FF\\uFB1D-\\uFB4F]";
const HEBREW_INTERNAL_QUOTE = "(?:\\\\[\"']|[\"'׳״])";
const HEBREW_TOKEN = `${HEBREW_LETTERS}+(?:${HEBREW_INTERNAL_QUOTE}${HEBREW_LETTERS}+)*(?:${HEBREW_INTERNAL_QUOTE})?`;
const HEBREW_ACRONYM = `${HEBREW_LETTERS}+(?:(?:${HEBREW_INTERNAL_QUOTE}${HEBREW_LETTERS}+)+|${HEBREW_INTERNAL_QUOTE})`;
const HEBREW_ACRONYM_RE = new RegExp(
  `${HEBREW_ACRONYM}(?:\\s+${HEBREW_ACRONYM})*`,
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

function usage() {
  console.log(`Usage: node build-typeset-proof.js [options]

Build a Typst proof or full-book PDF from .docx source files.

Options:
  --all             Include every route from routes.json.
  --limit <n>       Number of routes to include. Default: 5
  --route <route>   Include one route. Can be repeated.
  --size <size>     Page size: 5x8 or 6x9. Default: 6x9
  --output <name>   Output basename inside typeset/. Default: proof
  --help            Show this help text.`);
}

function parseArgs(argv) {
  const options = {
    limit: 5,
    all: false,
    routes: [],
    size: "6x9",
    output: "proof",
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

function titleFromBaseFilename(baseFilename) {
  return baseFilename.replace(/\s+/g, " ").trim();
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

function isolateHebrewRuns(typstContent) {
  const acronyms = [];
  const acronymSafeContent = typstContent.replace(HEBREW_ACRONYM_RE, (match) => {
    const marker = `\uE000${acronyms.length}\uE001`;
    acronyms.push(match);
    return marker;
  });

  const isolatedContent = acronymSafeContent.replace(HEBREW_PHRASE_RE, (match) => {
    return `${RTL_ISOLATE}${match}${POP_DIRECTIONAL_ISOLATE}`;
  });

  return isolatedContent.replace(/\uE000(\d+)\uE001/g, (_match, index) => {
    return `${LTR_ISOLATE}${acronyms[Number(index)]}${POP_DIRECTIONAL_ISOLATE}`;
  });
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

function convertDocxToTypst(entry) {
  const typst = run("pandoc", [entry.docxPath, "-t", "typst"]);
  return isolateHebrewRuns(
    normalizeMisplacedHebrewCommas(stripDuplicateTitle(typst, entry.sourceTitles))
  );
}

function renderTypstDocument(entries, options) {
  const settings = pageSettings(options.size);
  const parts = [];

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
)
#set par(
  first-line-indent: 1.1em,
  justify: true,
  leading: ${settings.leading},
)

#let article-footer(url, qr) = context {
  let number = text(size: 7.2pt, fill: rgb("#444444"))[
    #counter(page).display()
  ]
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

#show heading.where(level: 1): it => {
  set align(center)
  set text(font: "Times New Roman", size: 11pt, weight: "regular")
  block(above: 0pt, below: 16pt)[#it.body]
}

#show par: it => {
  it
}
`);

  entries.forEach((entry, index) => {
    const body = convertDocxToTypst(entry);
    const qrRelativePath = path.relative(OUTPUT_DIR, entry.qrPath).split(path.sep).join("/");

    if (index > 0) {
      parts.push("#pagebreak()\n");
    }

    const footer = entry.hasFooter
      ? `article-footer(${typstString(entry.url)}, ${typstString(qrRelativePath)})`
      : "none";

    parts.push(`#set page(footer: ${footer})
= ${entry.title}

${body}
`);
  });

  return parts.join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const entries = await loadEntries(options);

  await ensureEntryFiles(entries);
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const typstPath = path.join(OUTPUT_DIR, `${options.output}.typ`);
  const pdfPath = path.join(OUTPUT_DIR, `${options.output}.pdf`);
  const typstDocument = renderTypstDocument(entries, options);

  await fs.writeFile(typstPath, typstDocument, "utf8");
  run("typst", ["compile", "--root", ROOT_DIR, typstPath, pdfPath]);

  console.log(`Built ${path.relative(ROOT_DIR, typstPath)}`);
  console.log(`Built ${path.relative(ROOT_DIR, pdfPath)}`);
  console.log(`Included ${entries.length} article${entries.length === 1 ? "" : "s"} at ${options.size}.`);
}

main().catch((error) => {
  console.error(`build-typeset-proof failed: ${error.message}`);
  process.exitCode = 1;
});
