#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = __dirname;
const FILES_DIR = path.join(ROOT_DIR, "Files");
const ROUTES_FILE = path.join(ROOT_DIR, "routes.json");
const FRONT_MATTER_ROUTES = ["/rabbi-oelbaum-haskama/", "/about-the-name/"];

function usage() {
  console.log(`Usage: node choose-route-titles.js [options]

Prompt through route/source-title conflicts and write selected titles to routes.json.

Options:
  --dry-run       List conflicts without prompting or writing.
  --all           Include routes that already have an explicit title.
  --route <route> Review one route. Can be repeated.
  --help          Show this help text.`);
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    includeExistingTitles: false,
    routes: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--all") {
      options.includeExistingTitles = true;
    } else if (arg === "--route") {
      options.routes.push(argv[++i] || "");
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
    maxBuffer: 1024 * 1024 * 50,
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

function normalizeTitle(value) {
  return value
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[\\#*_`]/g, "")
    .replace(/[/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function titleFromBaseFilename(baseFilename) {
  return baseFilename.replace(/\s+/g, " ").trim();
}

function firstPlainTextLine(docxPath) {
  const plain = run("pandoc", [docxPath, "-t", "plain"]);
  return plain
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) || "";
}

function bookRouteOrder(byRoute) {
  const allRoutes = Object.keys(byRoute);

  return [
    ...FRONT_MATTER_ROUTES,
    ...allRoutes.filter(
      (route) =>
        !FRONT_MATTER_ROUTES.includes(route) &&
        route !== "/bloopers/" &&
        byRoute[route]?.baseFilename
    ),
  ];
}

function candidateForRoute(route, details) {
  const baseTitle = titleFromBaseFilename(details.baseFilename);
  const chosenTitle = details.title
    ? details.title.replace(/\s+/g, " ").trim()
    : baseTitle;
  const docxPath = path.join(FILES_DIR, details.contentPath, `${details.baseFilename}.docx`);

  return {
    route,
    details,
    baseTitle,
    chosenTitle,
    sourceTitle: firstPlainTextLine(docxPath),
  };
}

function hasConflict(candidate) {
  const chosen = normalizeTitle(candidate.chosenTitle);
  const base = normalizeTitle(candidate.baseTitle);
  const source = normalizeTitle(candidate.sourceTitle);

  return source !== chosen && source !== base;
}

async function promptForTitle(rl, candidate, index, total) {
  console.log(`\n[${index}/${total}] ${candidate.route}`);
  console.log(`  1. Current: ${candidate.chosenTitle}`);
  console.log(`  2. Source:  ${candidate.sourceTitle}`);
  console.log("  3. Custom title");
  console.log("  4. Skip");
  console.log("  q. Quit and save previous choices");

  while (true) {
    const answer = (await rl.question("Choose title [1/2/3/4/q]: ")).trim();

    if (answer === "" || answer === "1") {
      return candidate.chosenTitle;
    }

    if (answer === "2") {
      return candidate.sourceTitle;
    }

    if (answer === "3") {
      const custom = (await rl.question("Custom title: ")).trim();
      if (custom) {
        return custom;
      }
      console.log("Custom title cannot be blank.");
    } else if (answer === "4" || answer.toLowerCase() === "s") {
      return null;
    } else if (answer.toLowerCase() === "q") {
      return "QUIT";
    } else {
      console.log("Please choose 1, 2, 3, 4, or q.");
    }
  }
}

async function writeRoutes(routesDocument) {
  await fs.writeFile(
    ROUTES_FILE,
    `${JSON.stringify(routesDocument, null, 2)}\n`,
    "utf8"
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const routesDocument = JSON.parse(await fs.readFile(ROUTES_FILE, "utf8"));
  const byRoute = routesDocument.byRoute;

  if (!byRoute || typeof byRoute !== "object" || Array.isArray(byRoute)) {
    throw new Error('routes.json must contain a "byRoute" object');
  }

  const routeOrder =
    options.routes.length > 0 ? options.routes : bookRouteOrder(byRoute);
  const candidates = [];

  for (const route of routeOrder) {
    const details = byRoute[route];

    if (!details) {
      throw new Error(`Route not found in routes.json: ${route}`);
    }

    if (!details.baseFilename) {
      continue;
    }

    if (details.title && !options.includeExistingTitles) {
      continue;
    }

    const candidate = candidateForRoute(route, details);
    if (hasConflict(candidate)) {
      candidates.push(candidate);
    }
  }

  if (options.dryRun) {
    console.log(`Found ${candidates.length} title conflict${candidates.length === 1 ? "" : "s"}.`);
    for (const candidate of candidates) {
      console.log(`\n${candidate.route}`);
      console.log(`  Current: ${candidate.chosenTitle}`);
      console.log(`  Source:  ${candidate.sourceTitle}`);
    }
    return;
  }

  if (candidates.length === 0) {
    console.log("No title conflicts found.");
    return;
  }

  const rl = readline.createInterface({ input, output });
  let changed = 0;

  try {
    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      const choice = await promptForTitle(rl, candidate, i + 1, candidates.length);

      if (choice === "QUIT") {
        break;
      }

      if (!choice) {
        continue;
      }

      candidate.details.title = choice;
      changed += 1;
      console.log(`  Saved title: ${choice}`);
    }
  } finally {
    rl.close();
  }

  if (changed > 0) {
    await writeRoutes(routesDocument);
  }

  console.log(`\nUpdated ${changed} route title${changed === 1 ? "" : "s"}.`);
}

main().catch((error) => {
  console.error(`choose-route-titles failed: ${error.message}`);
  process.exitCode = 1;
});
