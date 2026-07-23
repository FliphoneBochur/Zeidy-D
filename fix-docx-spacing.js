#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = __dirname;
const DEFAULT_FILES_DIR = path.join(ROOT_DIR, "Files");
const WORD_DOCUMENT = "word/document.xml";
const TEXT_NODE_RE = /<w:t\b([^>]*)>([\s\S]*?)<\/w:t>/g;
const PARAGRAPH_RE = /<w:p\b[\s\S]*?<\/w:p>/g;
const ADJACENT_SCRIPT_RE =
  /([A-Za-z])([\u0590-\u05FF])|([\u0590-\u05FF])([A-Za-z])/gu;

function usage() {
  console.log(`Usage: node fix-docx-spacing.js [--apply] [--root <dir>] [--file <docx>]

Finds adjacent Hebrew/English text in .docx files, such as "forמעשים".

Options:
  --apply       Rewrite affected .docx files. Default is dry run.
  --root <dir>  Directory to scan recursively. Default: Files
  --file <docx> Check one .docx file instead of scanning a directory.
  --help        Show this help text.`);
}

function parseArgs(argv) {
  const options = {
    apply: false,
    root: DEFAULT_FILES_DIR,
    file: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--apply") {
      options.apply = true;
    } else if (arg === "--root") {
      options.root = path.resolve(argv[++i] || "");
    } else if (arg === "--file") {
      options.file = path.resolve(argv[++i] || "");
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
    maxBuffer: 1024 * 1024 * 50,
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

function decodeXmlText(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function encodeXmlText(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function preserveWhitespace(attrs) {
  if (/\bxml:space\s*=/.test(attrs)) {
    return attrs.replace(/\bxml:space\s*=\s*"[^"]*"/, 'xml:space="preserve"');
  }

  return `${attrs} xml:space="preserve"`;
}

function textNeedsPreserve(value) {
  return /^\s|\s$/.test(value);
}

function compact(value) {
  return value.replace(/\s+/g, " ").trim();
}

function contextFor(text, index) {
  const start = Math.max(0, index - 45);
  const end = Math.min(text.length, index + 55);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";
  return compact(`${prefix}${text.slice(start, end)}${suffix}`);
}

function findIssuesInParagraph(paragraph, paragraphNumber) {
  const text = Array.from(paragraph.matchAll(TEXT_NODE_RE), (match) =>
    decodeXmlText(match[2])
  ).join("");
  const issues = [];

  for (const match of text.matchAll(ADJACENT_SCRIPT_RE)) {
    issues.push({
      paragraphNumber,
      pair: match[0],
      context: contextFor(text, match.index),
    });
  }

  return issues;
}

function fixInsideTextNode(value) {
  return value.replace(ADJACENT_SCRIPT_RE, (_match, latinA, hebrewA, hebrewB, latinB) => {
    if (latinA && hebrewA) {
      return `${latinA} ${hebrewA}`;
    }

    return `${hebrewB} ${latinB}`;
  });
}

function isLatin(value) {
  return /[A-Za-z]/.test(value);
}

function isHebrew(value) {
  return /[\u0590-\u05FF]/u.test(value);
}

function lastChar(value) {
  return Array.from(value).at(-1) || "";
}

function firstChar(value) {
  return Array.from(value)[0] || "";
}

function needsBoundarySpace(left, right) {
  const a = lastChar(left);
  const b = firstChar(right);

  return (isLatin(a) && isHebrew(b)) || (isHebrew(a) && isLatin(b));
}

function fixParagraph(paragraph) {
  const textNodes = [];

  paragraph.replace(TEXT_NODE_RE, (full, attrs, rawText) => {
    textNodes.push({
      full,
      attrs,
      text: fixInsideTextNode(decodeXmlText(rawText)),
    });
    return full;
  });

  for (let i = 0; i < textNodes.length - 1; i += 1) {
    if (needsBoundarySpace(textNodes[i].text, textNodes[i + 1].text)) {
      textNodes[i].text += " ";
    }
  }

  let nodeIndex = 0;
  return paragraph.replace(TEXT_NODE_RE, () => {
    const node = textNodes[nodeIndex++];
    const attrs = textNeedsPreserve(node.text)
      ? preserveWhitespace(node.attrs)
      : node.attrs;

    return `<w:t${attrs}>${encodeXmlText(node.text)}</w:t>`;
  });
}

function inspectDocumentXml(xml) {
  const issues = [];
  let paragraphNumber = 0;

  for (const match of xml.matchAll(PARAGRAPH_RE)) {
    paragraphNumber += 1;
    issues.push(...findIssuesInParagraph(match[0], paragraphNumber));
  }

  return issues;
}

function fixDocumentXml(xml) {
  return xml.replace(PARAGRAPH_RE, (paragraph) => fixParagraph(paragraph));
}

function readDocumentXml(docxPath) {
  return run("unzip", ["-p", docxPath, WORD_DOCUMENT]);
}

async function applyFix(docxPath) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "docx-spacing-"));
  const outputPath = `${tempDir}.docx`;

  try {
    run("unzip", ["-q", docxPath, "-d", tempDir]);

    const xmlPath = path.join(tempDir, WORD_DOCUMENT);
    const xml = await fs.readFile(xmlPath, "utf8");
    const fixedXml = fixDocumentXml(xml);

    if (fixedXml === xml) {
      return false;
    }

    await fs.writeFile(xmlPath, fixedXml, "utf8");
    run("zip", ["-qr", outputPath, "."], { cwd: tempDir });
    await fs.copyFile(outputPath, docxPath);
    return true;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(outputPath, { force: true });
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const docxFiles = options.file
    ? [options.file]
    : await findDocxFiles(options.root);

  let totalIssues = 0;
  let affectedFiles = 0;
  let changedFiles = 0;

  for (const docxPath of docxFiles) {
    const xml = readDocumentXml(docxPath);
    const issues = inspectDocumentXml(xml);

    if (issues.length === 0) {
      continue;
    }

    affectedFiles += 1;
    totalIssues += issues.length;

    console.log(`\n${path.relative(ROOT_DIR, docxPath)} (${issues.length})`);
    for (const issue of issues) {
      console.log(
        `  paragraph ${issue.paragraphNumber}: ${issue.pair} -> ${issue.context}`
      );
    }

    if (options.apply && (await applyFix(docxPath))) {
      changedFiles += 1;
    }
  }

  const mode = options.apply ? "Applied" : "Dry run";
  console.log(
    `\n${mode}: ${totalIssues} issue${totalIssues === 1 ? "" : "s"} in ${affectedFiles} file${affectedFiles === 1 ? "" : "s"}.`
  );

  if (options.apply) {
    console.log(`Changed ${changedFiles} file${changedFiles === 1 ? "" : "s"}.`);
  } else if (totalIssues > 0) {
    console.log("Run with --apply to insert the missing spaces.");
  }
}

main().catch((error) => {
  console.error(`fix-docx-spacing failed: ${error.message}`);
  process.exitCode = 1;
});
