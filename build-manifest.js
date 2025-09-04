#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const FILES_DIR = "./Files";
const MANIFEST_FILE = "./manifest.json";

function buildManifest() {
  console.log("🔍 Scanning Files directory...");

  if (!fs.existsSync(FILES_DIR)) {
    console.error("❌ Files directory not found!");
    process.exit(1);
  }

  const manifest = {};
  let totalEntries = 0;

  function scanDirectory(dirPath, relativePath = "", depth = 0) {
    const entries = fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .sort();

    const result = {};
    const indent = "  ".repeat(depth);
    const icon = depth === 0 ? "📚" : depth === 1 ? "📖" : "📄";

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry);
      const currentRelativePath = relativePath
        ? `${relativePath}/${entry}`
        : entry;

      // Check if this directory contains content (PDF files or meta.json)
      const hasContent = checkForContent(entryPath);

      if (hasContent) {
        // This is a leaf node with actual content
        const metaJsonPath = path.join(entryPath, "meta.json");
        const pdfFiles = fs
          .readdirSync(entryPath)
          .filter((file) => file.toLowerCase().endsWith(".pdf"));

        let status = "✅";
        const warnings = [];

        if (!fs.existsSync(metaJsonPath)) {
          warnings.push("missing meta.json");
          status = "⚠️";
        }

        if (pdfFiles.length === 0) {
          warnings.push("no PDF files");
          status = "⚠️";
          result[entry] = null;
        } else if (pdfFiles.length === 1) {
          // Single PDF file - store its name directly
          result[entry] = pdfFiles[0];
        } else {
          // Multiple PDFs - use the first one and warn
          warnings.push(`multiple PDFs (${pdfFiles.length}), using first`);
          status = "⚠️";
          result[entry] = pdfFiles[0];
        }

        totalEntries++;

        const warningText =
          warnings.length > 0 ? ` (${warnings.join(", ")})` : "";
        console.log(`${indent}${icon} ${status} ${entry}${warningText}`);
      } else {
        // This is a branch node, scan deeper
        console.log(`${indent}${icon} Processing: ${entry}`);
        result[entry] = scanDirectory(
          entryPath,
          currentRelativePath,
          depth + 1
        );
      }
    }

    return result;
  }

  function checkForContent(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);

      // Check if directory contains PDF files or meta.json (content indicators)
      const hasPdf = files.some((file) => file.toLowerCase().endsWith(".pdf"));
      const hasMeta = files.includes("meta.json");

      // If it has content files, it's a leaf node
      if (hasPdf || hasMeta) {
        return true;
      }

      // If it only contains directories, it's a branch node
      const hasDirectories = files.some((file) => {
        const filePath = path.join(dirPath, file);
        return fs.statSync(filePath).isDirectory();
      });

      // If it has no directories and no content, consider it empty (shouldn't happen)
      return !hasDirectories;
    } catch (error) {
      console.warn(`⚠️ Error checking directory ${dirPath}:`, error.message);
      return false;
    }
  }

  // Start scanning from the Files directory
  Object.assign(manifest, scanDirectory(FILES_DIR));

  // Write the manifest file
  const manifestJson = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(MANIFEST_FILE, manifestJson);

  console.log("\n✅ Manifest built successfully!");
  console.log(`📊 Total entries: ${totalEntries}`);
  console.log(`📄 Manifest saved to: ${MANIFEST_FILE}`);

  return manifest;
}

// Allow running as a script or importing as a module
if (require.main === module) {
  try {
    buildManifest();
  } catch (error) {
    console.error("❌ Error building manifest:", error.message);
    process.exit(1);
  }
}

module.exports = { buildManifest };
