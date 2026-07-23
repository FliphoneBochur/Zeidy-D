#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = __dirname;
const REVIEW_FILE = path.join(ROOT_DIR, "spelling-review.json");
const WORD_DOCUMENT = "word/document.xml";
const TEXT_NODE_RE = /<w:t\b([^>]*)>([\s\S]*?)<\/w:t>/g;

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

function replacementRegex(word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Za-z])(${escaped})(?=$|[^A-Za-z])`, "g");
}

function replaceInDocumentXml(xml, correction) {
  const re = replacementRegex(correction.word);
  let replacements = 0;

  const updatedXml = xml.replace(TEXT_NODE_RE, (full, attrs, rawText) => {
    const text = decodeXmlText(rawText);
    const updatedText = text.replace(re, (match, prefix) => {
      replacements += 1;
      return `${prefix}${correction.correction}`;
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

async function applyToDocx(docxPath, correction) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "docx-spelling-"));
  const outputPath = `${tempDir}.docx`;

  try {
    run("unzip", ["-q", docxPath, "-d", tempDir]);

    const xmlPath = path.join(tempDir, WORD_DOCUMENT);
    const xml = await fs.readFile(xmlPath, "utf8");
    const { updatedXml, replacements } = replaceInDocumentXml(xml, correction);

    if (replacements === 0) {
      return 0;
    }

    await fs.writeFile(xmlPath, updatedXml, "utf8");
    run("zip", ["-qr", outputPath, "."], { cwd: tempDir });
    await fs.copyFile(outputPath, docxPath);

    return replacements;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(outputPath, { force: true });
  }
}

async function main() {
  const review = JSON.parse(await fs.readFile(REVIEW_FILE, "utf8"));
  const fixes = Object.values(review.decisions || {}).filter(
    (decision) => decision.status === "fix" && decision.correction
  );

  if (fixes.length === 0) {
    console.log("No reviewed spelling fixes found.");
    return;
  }

  let total = 0;

  for (const fix of fixes) {
    const files = new Set((fix.examples || []).map((example) => example.filePath));

    for (const relativePath of files) {
      const docxPath = path.join(ROOT_DIR, relativePath);
      const replacements = await applyToDocx(docxPath, fix);
      total += replacements;
      console.log(
        `${relativePath}: ${fix.word} -> ${fix.correction} (${replacements})`
      );
    }
  }

  console.log(`Applied ${total} replacement${total === 1 ? "" : "s"}.`);
}

main().catch((error) => {
  console.error(`apply-reviewed-spelling failed: ${error.message}`);
  process.exitCode = 1;
});
