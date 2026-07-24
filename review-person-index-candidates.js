#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const ROOT_DIR = __dirname;
const CANDIDATES_FILE = path.join(ROOT_DIR, "person-index-candidates.json");
const REVIEW_FILE = path.join(ROOT_DIR, "person-index-review.json");
const HEBREW_RUN_RE = /[\u0590-\u05FF]+(?:[\s"'׳״:.,;!?()[\]{}־-]+[\u0590-\u05FF]+)*/gu;
const HEBREW_COMBINING_MARK_RE = /[\u0591-\u05C7]/u;
const MIRRORED_TERMINAL_CHARS = new Map([
  ["(", ")"],
  [")", "("],
  ["[", "]"],
  ["]", "["],
  ["{", "}"],
  ["}", "{"],
]);

function usage() {
  console.log(`Usage: node review-person-index-candidates.js [options]

Prompt through person-index candidates and record review decisions.

When adding a candidate as an alias to an existing person, press Tab at the
search prompt to complete or list matching person names/aliases.

Options:
  --candidates <file>     Candidate JSON. Default: person-index-candidates.json
  --review-file <file>    Output review JSON. Default: person-index-review.json
  --candidate <text>      Review one candidate by exact text/key.
  --include-reviewed      Include candidates already reviewed.
  --limit <n>             Review at most n candidates this run.
  --reset                 Start over instead of resuming prior decisions.
  --help                  Show this help text.`);
}

function parseArgs(argv) {
  const options = {
    candidatesFile: CANDIDATES_FILE,
    reviewFile: REVIEW_FILE,
    candidate: null,
    includeReviewed: false,
    limit: null,
    reset: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--candidates") {
      options.candidatesFile = path.resolve(argv[++i] || "");
    } else if (arg === "--review-file") {
      options.reviewFile = path.resolve(argv[++i] || "");
    } else if (arg === "--candidate") {
      options.candidate = normalizeKey(argv[++i] || "");
    } else if (arg === "--include-reviewed") {
      options.includeReviewed = true;
    } else if (arg === "--limit") {
      options.limit = Number.parseInt(argv[++i] || "", 10);
    } else if (arg === "--reset") {
      options.reset = true;
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

function normalizeKey(value) {
  return value
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function fileLink(filePath) {
  return path.isAbsolute(filePath) ? path.relative(ROOT_DIR, filePath) : filePath;
}

function splitHebrewClusters(value) {
  const clusters = [];

  for (const char of Array.from(value)) {
    if (HEBREW_COMBINING_MARK_RE.test(char) && clusters.length > 0) {
      clusters[clusters.length - 1] += char;
    } else {
      clusters.push(char);
    }
  }

  return clusters;
}

function reverseHebrewRunForTerminal(value) {
  return splitHebrewClusters(value)
    .reverse()
    .map((cluster) => MIRRORED_TERMINAL_CHARS.get(cluster) || cluster)
    .join("");
}

function terminalText(value) {
  return String(value).replace(HEBREW_RUN_RE, reverseHebrewRunForTerminal);
}

async function loadCandidates(candidatesFile) {
  const data = JSON.parse(await fs.readFile(candidatesFile, "utf8"));
  if (!Array.isArray(data.candidates)) {
    throw new Error(`${path.relative(ROOT_DIR, candidatesFile)} must contain a candidates array`);
  }

  return data.candidates;
}

async function loadReview(reviewFile, reset) {
  if (reset) {
    return emptyReview();
  }

  try {
    const review = JSON.parse(await fs.readFile(reviewFile, "utf8"));
    if (review.version !== 2 || !review.people || !review.decisions) {
      return emptyReview();
    }
    return review;
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    return emptyReview();
  }
}

async function saveReview(reviewFile, review) {
  review.version = 2;
  review.updatedAt = new Date().toISOString();
  await fs.writeFile(reviewFile, `${JSON.stringify(review, null, 2)}\n`, "utf8");
}

function emptyReview() {
  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    people: {},
    decisions: {},
  };
}

function personIdFromDisplayName(displayName) {
  return normalizeKey(displayName)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "person";
}

function uniquePersonId(review, displayName) {
  const base = personIdFromDisplayName(displayName);
  let id = base;
  let suffix = 2;

  while (review.people[id]) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  return id;
}

function normalizedDisplayName(value) {
  return normalizeKey(value).replace(/^r['’]\s+/, "rabbi ");
}

function findPersonByDisplayName(review, displayName) {
  const target = normalizedDisplayName(displayName);
  return Object.entries(review.people).find(([_id, person]) =>
    normalizedDisplayName(person.displayName) === target
  );
}

function findPersonByDisplayNameOrAlias(review, value) {
  const target = normalizedDisplayName(value);
  return Object.entries(review.people || {}).find(([_id, person]) =>
    normalizedDisplayName(person.displayName) === target ||
    (person.aliases || []).some((alias) => normalizedDisplayName(alias) === target)
  );
}

function addAlias(person, alias) {
  const value = (alias || "").trim();
  if (!value) {
    return;
  }

  person.aliases ||= [];
  if (!person.aliases.some((existing) => normalizeKey(existing) === normalizeKey(value))) {
    person.aliases.push(value);
  }
}

function ensurePerson(review, displayName) {
  review.people ||= {};

  const existing = findPersonByDisplayName(review, displayName);
  if (existing) {
    return existing[0];
  }

  const personId = uniquePersonId(review, displayName);
  review.people[personId] = {
    displayName,
    aliases: [displayName],
    createdAt: new Date().toISOString(),
  };

  return personId;
}

function existingDecision(review, candidate) {
  return review.decisions?.[candidate.key] || review.decisions?.[normalizeKey(candidate.value)] || null;
}

function personForDecision(review, decision) {
  if (!decision?.personId) {
    return null;
  }

  return review.people?.[decision.personId] || null;
}

function decisionsForPerson(review, personId) {
  return Object.values(review.decisions || {}).filter(
    (decision) => decision.status === "keep" && decision.personId === personId
  );
}

function removeAlias(person, alias) {
  if (!person?.aliases) {
    return;
  }

  const aliasKey = normalizeKey(alias);
  const displayKey = normalizeKey(person.displayName);
  person.aliases = person.aliases.filter(
    (existing) => normalizeKey(existing) !== aliasKey || normalizeKey(existing) === displayKey
  );
}

function prunePersonIfUnused(review, personId) {
  const person = review.people?.[personId];
  if (!person) {
    return;
  }

  if (decisionsForPerson(review, personId).length === 0) {
    delete review.people[personId];
  }
}

function pruneUnusedPeople(review) {
  for (const personId of Object.keys(review.people || {})) {
    prunePersonIfUnused(review, personId);
  }
}

function detachPriorDecision(review, candidate) {
  const priorDecision = existingDecision(review, candidate);
  if (!priorDecision?.personId) {
    return;
  }

  const person = review.people?.[priorDecision.personId];
  removeAlias(person, candidate.value);
  delete review.decisions[candidate.key];
  prunePersonIfUnused(review, priorDecision.personId);
}

function defaultDisplayName(candidate) {
  if (candidate.language === "english") {
    return candidate.value;
  }

  return "";
}

async function promptForDisplayName(rl, candidate) {
  const fallback = defaultDisplayName(candidate);
  const prompt = fallback
    ? terminalText(`Index display name [${fallback}]: `)
    : "English index display name: ";

  while (true) {
    const answer = (await rl.question(prompt)).trim();
    const displayName = answer || fallback;

    if (displayName) {
      return displayName;
    }

    console.log("Display name cannot be blank for kept Hebrew candidates.");
  }
}

function sortedPeople(review) {
  return Object.entries(review.people || {})
    .map(([id, person]) => ({ id, ...person }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function matchingPeople(review, query) {
  const normalized = normalizeKey(query);
  const people = sortedPeople(review);

  if (!normalized) {
    return people.slice(0, 25);
  }

  return people.filter((person) =>
    normalizeKey(person.displayName).includes(normalized) ||
    (person.aliases || []).some((alias) => normalizeKey(alias).includes(normalized))
  );
}

function completionLabelsForPeople(review) {
  const labels = [];

  for (const person of sortedPeople(review)) {
    labels.push(person.displayName);
    for (const alias of person.aliases || []) {
      if (normalizeKey(alias) !== normalizeKey(person.displayName)) {
        labels.push(alias);
      }
    }
  }

  return [...new Set(labels)].sort((a, b) => a.localeCompare(b));
}

function createCompleter(context) {
  return (line) => {
    if (!context.active || context.values.length === 0) {
      return [[], line];
    }

    const normalized = normalizeKey(line);
    const hits = context.values.filter((value) =>
      normalizeKey(value).startsWith(normalized) ||
      normalizeKey(value).includes(normalized)
    );

    return [hits.length > 0 ? hits : context.values, line];
  };
}

async function promptForExistingPerson(rl, review) {
  rl.completionContext.active = true;
  rl.completionContext.values = completionLabelsForPeople(review);

  try {
    while (true) {
      const query = (await rl.question("Existing person search/display name (Tab completes): ")).trim();
      const matches = matchingPeople(review, query);

      if (matches.length === 0) {
        console.log("No matching people found.");
        continue;
      }

      const shown = matches.slice(0, 12);
      for (let i = 0; i < shown.length; i += 1) {
        const aliases = (shown[i].aliases || [])
          .filter((alias) => normalizeKey(alias) !== normalizeKey(shown[i].displayName))
          .slice(0, 3);
        console.log(terminalText(`  ${i + 1}. ${shown[i].displayName}${aliases.length ? ` (${aliases.join("; ")})` : ""}`));
      }

      const answer = (await rl.question("Choose person number, or blank to search again: ")).trim();
      if (!answer) {
        continue;
      }

      const index = Number.parseInt(answer, 10);
      if (Number.isInteger(index) && index >= 1 && index <= shown.length) {
        return shown[index - 1].id;
      }

      console.log("Please choose one of the shown numbers.");
    }
  } finally {
    rl.completionContext.active = false;
    rl.completionContext.values = [];
  }
}

async function promptDecision(rl, review, candidate, index, total, priorDecision) {
  console.log(terminalText(`\n[${index}/${total}] ${candidate.value}`));
  console.log(`  ${candidate.count}x, ${candidate.files.length} file${candidate.files.length === 1 ? "" : "s"}, ${candidate.language}, ${candidate.sources.join(", ")}`);

  if (priorDecision) {
    const person = personForDecision(review, priorDecision);
    console.log(terminalText(`  prior: ${priorDecision.status}${person ? ` -> ${person.displayName}` : ""}`));
  }

  for (const example of candidate.examples || []) {
    console.log(`  - ${fileLink(example.filePath)}`);
    console.log(terminalText(`    ${example.context}`));
  }

  console.log("\nChoices:");
  console.log("  1. keep as new person");
  console.log("  2. add as alias to existing person");
  console.log("  3. false positive / ignore");
  console.log("  4. skip for now");
  console.log("  q. quit");

  while (true) {
    const answer = (await rl.question("Choose [1/2/3/4/q]: ")).trim().toLowerCase();

    if (answer === "1" || answer === "k") {
      const displayName = await promptForDisplayName(rl, candidate);
      const personId = ensurePerson(review, displayName);
      addAlias(review.people[personId], candidate.value);
      return {
        status: "keep",
        personId,
      };
    }

    if (answer === "2" || answer === "m") {
      if (Object.keys(review.people || {}).length === 0) {
        console.log("No people exist yet. Choose 1 to create the first one.");
        continue;
      }

      const personId = await promptForExistingPerson(rl, review);
      addAlias(review.people[personId], candidate.value);
      return {
        status: "keep",
        personId,
      };
    }

    if (answer === "3" || answer === "i") {
      return {
        status: "ignore",
        personId: null,
      };
    }

    if (answer === "4" || answer === "s") {
      return null;
    }

    if (answer === "q") {
      return "QUIT";
    }

    console.log("Please choose 1, 2, 3, 4, or q.");
  }
}

function reviewRecord(candidate, decision) {
  return {
    candidate: candidate.value,
    key: candidate.key,
    language: candidate.language,
    status: decision.status,
    personId: decision.personId || null,
    sources: candidate.sources,
    count: candidate.count,
    files: candidate.files,
    examples: (candidate.examples || []).map((example) => ({
      filePath: fileLink(example.filePath),
      source: example.source,
      context: example.context,
    })),
    reviewedAt: new Date().toISOString(),
  };
}

function autoDecisionForCandidate(review, candidate) {
  const existing = findPersonByDisplayNameOrAlias(review, candidate.value);
  if (!existing) {
    return null;
  }

  const [personId, person] = existing;
  addAlias(person, candidate.value);
  return {
    status: "keep",
    personId,
    auto: "display-name-match",
  };
}

function prepareCandidates(candidates, review, options) {
  let selected = candidates;

  if (options.candidate) {
    selected = selected.filter(
      (candidate) =>
        candidate.key === options.candidate ||
        normalizeKey(candidate.value) === options.candidate
    );
  }

  if (!options.includeReviewed) {
    selected = selected.filter((candidate) => !existingDecision(review, candidate));
  }

  if (options.limit !== null) {
    selected = selected.slice(0, options.limit);
  }

  return selected;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const candidates = await loadCandidates(options.candidatesFile);
  const review = await loadReview(options.reviewFile, options.reset);
  review.people ||= {};
  review.decisions ||= {};

  const selected = prepareCandidates(candidates, review, options);

  if (selected.length === 0) {
    console.log("No person-index candidates to review.");
    return;
  }

  const completionContext = {
    active: false,
    values: [],
  };
  const rl = readline.createInterface({
    input,
    output,
    completer: createCompleter(completionContext),
  });
  rl.completionContext = completionContext;
  let reviewed = 0;

  try {
    for (let i = 0; i < selected.length; i += 1) {
      const candidate = selected[i];
      const priorDecision = existingDecision(review, candidate);
      const decision = priorDecision
        ? await promptDecision(rl, review, candidate, i + 1, selected.length, priorDecision)
        : autoDecisionForCandidate(review, candidate) ||
          await promptDecision(rl, review, candidate, i + 1, selected.length, priorDecision);

      if (decision === "QUIT") {
        break;
      }

      if (!decision) {
        continue;
      }

      detachPriorDecision(review, candidate);
      review.decisions[candidate.key] = reviewRecord(candidate, decision);
      pruneUnusedPeople(review);
      reviewed += 1;
      await saveReview(options.reviewFile, review);
      const person = personForDecision(review, decision);
      const automatic = decision.auto ? " [auto]" : "";
      console.log(terminalText(`Saved${automatic}: ${candidate.value} -> ${decision.status}${person ? ` (${person.displayName})` : ""}`));
    }
  } finally {
    rl.close();
  }

  await saveReview(options.reviewFile, review);
  console.log(`\nRecorded ${reviewed} decision${reviewed === 1 ? "" : "s"} in ${path.relative(ROOT_DIR, options.reviewFile)}.`);
}

main().catch((error) => {
  console.error(`review-person-index-candidates failed: ${error.message}`);
  process.exitCode = 1;
});
