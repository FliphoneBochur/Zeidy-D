#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = __dirname;
const REVIEW_FILE = path.join(ROOT_DIR, "spelling-review.json");

function usage() {
  console.log(`Usage: node review-spelling-candidates.js [options]

Prompt through spelling candidates and record review decisions.

Options:
  --review-file <file>  Output JSON file. Default: spelling-review.json
  --reset               Start over instead of resuming prior review decisions.
  --word <word>         Review only one candidate word.
  --help                Show this help text.`);
}

function parseArgs(argv) {
  const options = {
    reviewFile: REVIEW_FILE,
    reset: false,
    word: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--review-file") {
      options.reviewFile = path.resolve(argv[++i] || "");
    } else if (arg === "--reset") {
      options.reset = true;
    } else if (arg === "--word") {
      options.word = (argv[++i] || "").trim().toLowerCase();
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
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

function extractPossibleSpellingWords(report) {
  const start = report.indexOf("## Possible Spelling Errors");
  const end = report.indexOf("## Possible Joined Words");

  if (start < 0 || end < 0 || end <= start) {
    throw new Error("editorial-report.md does not contain the expected spelling section");
  }

  const section = report.slice(start, end);
  const words = [];
  const entryRe =
    /^- `([^`]+)` \((\d+)x, (\d+) file(?:s)?\)\n((?:  - .+\n)*)/gm;
  const exampleRe = /^  - \[.+?\]\((.+?)\): (.+)$/gm;

  for (const match of section.matchAll(entryRe)) {
    const examples = [];
    const exampleBlock = match[4] || "";

    for (const exampleMatch of exampleBlock.matchAll(exampleRe)) {
      examples.push({
        filePath: exampleMatch[1],
        context: exampleMatch[2],
      });
    }

    words.push({
      word: match[1],
      count: Number.parseInt(match[2], 10),
      files: Number.parseInt(match[3], 10),
      examples,
    });
  }

  return words;
}

async function loadCandidates() {
  const reportPath = path.join(ROOT_DIR, "editorial-report.md");
  let report;

  try {
    report = await fs.readFile(reportPath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    run("npm", ["run", "editorial-scan"]);
    report = await fs.readFile(reportPath, "utf8");
  }

  return extractPossibleSpellingWords(report);
}

function fileLink(filePath) {
  return path.isAbsolute(filePath) ? path.relative(ROOT_DIR, filePath) : filePath;
}

async function loadReview(reviewFile, reset) {
  if (reset) {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      decisions: {},
    };
  }

  try {
    return JSON.parse(await fs.readFile(reviewFile, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      decisions: {},
    };
  }
}

async function saveReview(reviewFile, review) {
  review.updatedAt = new Date().toISOString();
  await fs.writeFile(reviewFile, `${JSON.stringify(review, null, 2)}\n`, "utf8");
}

async function promptDecision(rl, candidate, examples, index, total) {
  console.log(`\n[${index}/${total}] ${candidate.word} (${candidate.count}x, ${candidate.files} file${candidate.files === 1 ? "" : "s"})`);

  for (const example of examples) {
    console.log(`  - ${fileLink(example.filePath)}`);
    console.log(`    ${example.context}`);
  }

  console.log("\nChoices:");
  console.log("  1. correct / allow");
  console.log("  2. typo: enter correction");
  console.log("  3. unsure / revisit");
  console.log("  4. skip for now");
  console.log("  q. quit");

  while (true) {
    const answer = (await rl.question("Choose [1/2/3/4/q]: ")).trim();

    if (answer === "1") {
      return {
        status: "allow",
        correction: null,
      };
    }

    if (answer === "2") {
      const correction = (await rl.question("Correction: ")).trim();
      if (correction) {
        return {
          status: "fix",
          correction,
        };
      }
      console.log("Correction cannot be blank.");
    } else if (answer === "3") {
      const note = (await rl.question("Optional note: ")).trim();
      return {
        status: "unsure",
        correction: null,
        note: note || null,
      };
    } else if (answer === "4" || answer.toLowerCase() === "s") {
      return null;
    } else if (answer.toLowerCase() === "q") {
      return "QUIT";
    } else {
      console.log("Please choose 1, 2, 3, 4, or q.");
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const review = await loadReview(options.reviewFile, options.reset);
  let candidates = await loadCandidates();

  if (options.word) {
    candidates = candidates.filter((candidate) => candidate.word.toLowerCase() === options.word);
  } else {
    candidates = candidates.filter((candidate) => !review.decisions[candidate.word]);
  }

  if (candidates.length === 0) {
    console.log("No spelling candidates to review.");
    return;
  }

  const rl = readline.createInterface({ input, output });
  let reviewed = 0;

  try {
    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      const examples = candidate.examples;
      const decision = await promptDecision(rl, candidate, examples, i + 1, candidates.length);

      if (decision === "QUIT") {
        break;
      }

      if (!decision) {
        continue;
      }

      review.decisions[candidate.word] = {
        word: candidate.word,
        status: decision.status,
        correction: decision.correction || null,
        note: decision.note || null,
        count: candidate.count,
        files: candidate.files,
        examples: examples.map((example) => ({
          filePath: fileLink(example.filePath),
          context: example.context,
        })),
        reviewedAt: new Date().toISOString(),
      };

      reviewed += 1;
      await saveReview(options.reviewFile, review);
      console.log(`Saved: ${candidate.word} -> ${decision.status}${decision.correction ? ` (${decision.correction})` : ""}`);
    }
  } finally {
    rl.close();
  }

  await saveReview(options.reviewFile, review);
  console.log(`\nRecorded ${reviewed} decision${reviewed === 1 ? "" : "s"} in ${path.relative(ROOT_DIR, options.reviewFile)}.`);
}

main().catch((error) => {
  console.error(`review-spelling-candidates failed: ${error.message}`);
  process.exitCode = 1;
});
