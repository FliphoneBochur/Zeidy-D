#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT_DIR = __dirname;
const REVIEW_FILE = path.join(ROOT_DIR, "person-index-review.json");
const OUTPUT_FILE = path.join(ROOT_DIR, "person-index-people.txt");

function usage() {
  console.log(`Usage: node export-person-index-people.js [options]

Write a plain-text list of selected person-index people.

Options:
  --review-file <file>  Review JSON. Default: person-index-review.json
  --output <file>       Output text file. Default: person-index-people.txt
  --no-aliases          Only print display names.
  --help                Show this help text.`);
}

function parseArgs(argv) {
  const options = {
    reviewFile: REVIEW_FILE,
    output: OUTPUT_FILE,
    aliases: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--review-file") {
      options.reviewFile = path.resolve(argv[++i] || "");
    } else if (arg === "--output") {
      options.output = path.resolve(argv[++i] || "");
    } else if (arg === "--no-aliases") {
      options.aliases = false;
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function normalizeKey(value) {
  return value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function uniqueAliases(person) {
  const displayKey = normalizeKey(person.displayName);
  return [...new Set(person.aliases || [])]
    .filter((alias) => normalizeKey(alias) !== displayKey)
    .sort((a, b) => a.localeCompare(b));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const review = JSON.parse(await fs.readFile(options.reviewFile, "utf8"));
  const people = Object.values(review.people || {})
    .filter((person) => person.displayName)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  const lines = [];

  for (const person of people) {
    const aliases = options.aliases ? uniqueAliases(person) : [];
    if (aliases.length > 0) {
      lines.push(`${person.displayName} (${aliases.join(", ")})`);
    } else {
      lines.push(person.displayName);
    }
  }

  await fs.writeFile(options.output, `${lines.join("\n")}\n`, "utf8");
  console.log(`Wrote ${path.relative(ROOT_DIR, options.output)} (${people.length} people)`);
}

main().catch((error) => {
  console.error(`export-person-index-people failed: ${error.message}`);
  process.exitCode = 1;
});
