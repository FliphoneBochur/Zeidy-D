#!/usr/bin/env node

"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const QRCode = require("qrcode");

const ROOT_DIR = __dirname;
const ROUTES_FILE = path.join(ROOT_DIR, "routes.json");
const FILES_DIR = path.join(ROOT_DIR, "Files");
const DOMAIN = "https://zeidyd.com";
const IMAGE_SIZE = 1000;

function outputPathFor(contentPath, baseFilename) {
  const outputDirectory = path.resolve(FILES_DIR, contentPath);
  const relativeDirectory = path.relative(FILES_DIR, outputDirectory);

  if (
    relativeDirectory.startsWith(`..${path.sep}`) ||
    relativeDirectory === ".." ||
    path.isAbsolute(relativeDirectory)
  ) {
    throw new Error(`contentPath escapes the Files directory: ${contentPath}`);
  }

  const filename = baseFilename || path.basename(contentPath);
  return path.join(outputDirectory, `${filename}.png`);
}

async function main() {
  const routesDocument = JSON.parse(await fs.readFile(ROUTES_FILE, "utf8"));
  const routes = routesDocument.byRoute;

  if (!routes || typeof routes !== "object" || Array.isArray(routes)) {
    throw new Error('routes.json must contain a "byRoute" object');
  }

  const entries = Object.entries(routes);
  let generated = 0;

  for (const [route, routeDetails] of entries) {
    if (!routeDetails?.contentPath) {
      throw new Error(`Route ${route} has no contentPath`);
    }

    const url = new URL(route, DOMAIN).href;
    const outputPath = outputPathFor(
      routeDetails.contentPath,
      routeDetails.baseFilename
    );

    await fs.access(path.dirname(outputPath));
    await QRCode.toFile(outputPath, url, {
      type: "png",
      width: IMAGE_SIZE,
      margin: 0.05,
      errorCorrectionLevel: "H",
    });

    generated += 1;
    console.log(`[${generated}/${entries.length}] ${url} -> ${outputPath}`);
  }

  console.log(`Generated ${generated} QR codes at ${IMAGE_SIZE}x${IMAGE_SIZE}px.`);
}

main().catch((error) => {
  console.error(`QR code generation failed: ${error.message}`);
  process.exitCode = 1;
});
