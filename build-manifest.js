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
        const allFiles = fs.readdirSync(entryPath);
        const pdfFiles = allFiles.filter((file) =>
          file.toLowerCase().endsWith(".pdf")
        );
        const mp3Files = allFiles.filter((file) =>
          file.toLowerCase().endsWith(".mp3")
        );

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
          const pdfFile = pdfFiles[0];

          // Handle MP3 renaming to match PDF
          if (mp3Files.length === 1) {
            const mp3File = mp3Files[0];
            const expectedMp3Name = pdfFile.replace(".pdf", ".mp3");

            if (mp3File !== expectedMp3Name) {
              // Rename MP3 to match PDF
              const oldMp3Path = path.join(entryPath, mp3File);
              const newMp3Path = path.join(entryPath, expectedMp3Name);

              try {
                fs.renameSync(oldMp3Path, newMp3Path);
                console.log(
                  `      📝 Renamed MP3: "${mp3File}" → "${expectedMp3Name}"`
                );
              } catch (error) {
                warnings.push(`failed to rename MP3: ${error.message}`);
                status = "⚠️";
              }
            }
          } else if (mp3Files.length > 1) {
            warnings.push(
              `multiple MP3 files (${mp3Files.length}), manual rename needed`
            );
            status = "⚠️";
          }
          // No warning if no MP3 files - that's optional

          // Single PDF file - store its name directly
          result[entry] = pdfFile;
        } else {
          // Multiple PDFs - use the first one and warn
          warnings.push(`multiple PDFs (${pdfFiles.length}), using first`);
          status = "⚠️";
          result[entry] = pdfFiles[0];

          // Don't try to rename MP3s if multiple PDFs
          if (mp3Files.length > 0) {
            warnings.push("MP3 renaming skipped due to multiple PDFs");
          }
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
