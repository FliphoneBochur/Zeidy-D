#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = __dirname;
const FILES_DIR = path.join(ROOT_DIR, "Files");
const WORD_DOCUMENT = "word/document.xml";
const TEXT_NODE_RE = /<w:t\b([^>]*)>([\s\S]*?)<\/w:t>/g;

function usage() {
  console.log(`Usage: node replace-docx-text.js --from <text> --to <text> [options]

Dry-run by default. Use --apply to edit matching .docx files.

Options:
  --from <text>  Text to replace.
  --to <text>    Replacement text.
  --apply        Edit .docx files in place.
  --word         Match only whole English words.
  --help         Show this help text.`);
}

function parseArgs(argv) {
  const options = {
    from: "",
    to: "",
    apply: false,
    word: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--from") {
      options.from = argv[++i] || "";
    } else if (arg === "--to") {
      options.to = argv[++i] || "";
    } else if (arg === "--apply") {
      options.apply = true;
    } else if (arg === "--word") {
      options.word = true;
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.from) {
    throw new Error("--from is required");
  }

  if (!options.to) {
    throw new Error("--to is required");
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

function replacementRegex(options) {
  const escaped = options.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!options.word) {
    return new RegExp(escaped, "g");
  }

  return new RegExp(`(^|[^A-Za-z])(${escaped})(?=$|[^A-Za-z])`, "g");
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

function replaceInDocumentXml(xml, options) {
  const re = replacementRegex(options);
  let replacements = 0;

  const updatedXml = xml.replace(TEXT_NODE_RE, (full, attrs, rawText) => {
    const text = decodeXmlText(rawText);
    const updatedText = text.replace(re, (...args) => {
      replacements += 1;

      if (!options.word) {
        return options.to;
      }

      return `${args[1]}${options.to}`;
    });

    if (updatedText === text) {
      return full;
    }

    const updatedAttrs = textNeedsPreserve(updatedText)
      ? preserveWhitespace(attrs)
      : attrs;

    return `<w:t${updatedAttrs}>${encodeXmlText(updatedText)}</w:t>`;
  });

  return { updatedXml, replacements };
}

async function inspectDocx(docxPath, options) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "docx-replace-"));
  const outputPath = `${tempDir}.docx`;

  try {
    run("unzip", ["-q", docxPath, "-d", tempDir]);

    const xmlPath = path.join(tempDir, WORD_DOCUMENT);
    const xml = await fs.readFile(xmlPath, "utf8");
    const { updatedXml, replacements } = replaceInDocumentXml(xml, options);

    if (options.apply && replacements > 0) {
      await fs.writeFile(xmlPath, updatedXml, "utf8");
      run("zip", ["-qr", outputPath, "."], { cwd: tempDir });
      await fs.copyFile(outputPath, docxPath);
    }

    return replacements;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(outputPath, { force: true });
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = await findDocxFiles(FILES_DIR);
  let total = 0;
  let fileCount = 0;

  for (const file of files) {
    const replacements = await inspectDocx(file, options);

    if (replacements > 0) {
      total += replacements;
      fileCount += 1;
      console.log(`${path.relative(ROOT_DIR, file)}: ${replacements}`);
    }
  }

  console.log(
    `${options.apply ? "Applied" : "Would apply"} ${total} replacement${total === 1 ? "" : "s"} in ${fileCount} file${fileCount === 1 ? "" : "s"}.`
  );
}

main().catch((error) => {
  console.error(`replace-docx-text failed: ${error.message}`);
  process.exitCode = 1;
});
