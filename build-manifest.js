#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const FILES_DIR = "./Files";
const MANIFEST_FILE = "./manifest.json";

// Helper function to prompt user for confirmation
function promptUser(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function buildManifest() {
  console.log("🔍 Scanning Files directory...");

  if (!fs.existsSync(FILES_DIR)) {
    console.error("❌ Files directory not found!");
    process.exit(1);
  }

  const manifest = {};
  let totalEntries = 0;

  async function scanDirectory(dirPath, relativePath = "", depth = 0) {
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
        } else if (pdfFiles.length > 1) {
          // Multiple PDFs - exit with error
          console.error(
            `\n❌ Multiple PDF files found in ${relativePath}/${entry}:`
          );
          pdfFiles.forEach((pdf) => console.error(`   - ${pdf}`));
          console.error(
            "Please ensure each directory has exactly one PDF file."
          );
          process.exit(1);
        } else if (pdfFiles.length === 1) {
          const pdfFile = pdfFiles[0];

          // Handle MP3 renaming to match PDF
          if (mp3Files.length > 1) {
            // Multiple MP3s - exit with error
            console.error(
              `\n❌ Multiple MP3 files found in ${relativePath}/${entry}:`
            );
            mp3Files.forEach((mp3) => console.error(`   - ${mp3}`));
            console.error(
              "Please ensure each directory has at most one MP3 file."
            );
            process.exit(1);
          } else if (mp3Files.length === 1) {
            const mp3File = mp3Files[0];
            const expectedMp3Name = pdfFile.replace(".pdf", ".mp3");

            if (mp3File !== expectedMp3Name) {
              // Prompt user before renaming
              console.log(
                `\n📝 Found MP3 that needs renaming in ${relativePath}/${entry}:`
              );
              console.log(`   Current: ${mp3File}`);
              console.log(`   Expected: ${expectedMp3Name}`);

              const response = await promptUser(
                "Rename this MP3 file? (y/n/q): "
              );

              if (response === "q" || response === "quit") {
                console.log("❌ Build cancelled by user.");
                process.exit(0);
              } else if (response === "y" || response === "yes") {
                // Rename MP3 to match PDF
                const oldMp3Path = path.join(entryPath, mp3File);
                const newMp3Path = path.join(entryPath, expectedMp3Name);

                try {
                  fs.renameSync(oldMp3Path, newMp3Path);
                  console.log(`   ✅ Renamed successfully!`);
                } catch (error) {
                  console.error(`   ❌ Failed to rename: ${error.message}`);
                  process.exit(1);
                }
              } else {
                console.log(`   ⏭️  Skipped renaming.`);
                warnings.push("MP3 file not renamed");
                status = "⚠️";
              }
            }
          }
          // No warning if no MP3 files - that's optional

          // Single PDF file - store its name directly
          result[entry] = pdfFile;
        }

        totalEntries++;

        const warningText =
          warnings.length > 0 ? ` (${warnings.join(", ")})` : "";
        console.log(`${indent}${icon} ${status} ${entry}${warningText}`);
      } else {
        // This is a branch node, scan deeper
        console.log(`${indent}${icon} Processing: ${entry}`);
        result[entry] = await scanDirectory(
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
  Object.assign(manifest, await scanDirectory(FILES_DIR));

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
  (async () => {
    try {
      await buildManifest();
    } catch (error) {
      console.error("❌ Error building manifest:", error.message);
      process.exit(1);
    }
  })();
}

module.exports = { buildManifest };
