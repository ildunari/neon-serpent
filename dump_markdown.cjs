#!/usr/bin/env node
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || 'src');

// --- Configuration ---
// Add directory names or specific file names to exclude entirely
const excludeNames = ['.DS_Store', 'assets'];
// Add file extensions to exclude
const excludeExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.mp4', '.woff', '.woff2'];
// Mapping for syntax highlighting
const ext2lang = { '.js':'js', '.jsx':'jsx', '.ts':'ts', '.tsx':'tsx',
                   '.css':'css', '.html':'html', '.json':'json', '.md':'md' };
// --- End Configuration ---

(function dump(dir) {
  try {
    const entries = fs.readdirSync(dir,{withFileTypes:true});
    for (const d of entries) {
      // Check exclusion by name
      if (excludeNames.includes(d.name)) {
        continue; // Skip this entry
      }

      const full = path.join(dir,d.name);

      if (d.isDirectory()) {
        dump(full); // Recurse into subdirectories
      } else if (d.isFile()) {
        const ext = path.extname(full).toLowerCase();
        // Check exclusion by extension
        if (excludeExtensions.includes(ext)) {
          continue; // Skip this file type
        }

        const lang = ext2lang[ext] || '';
        try {
          const body = fs.readFileSync(full,'utf8').replace(/```/g,'``\u200B`');
          // Output the formatted markdown
          console.log(`\n### ${path.relative(process.cwd(),full)}\n\n\`\`\`${lang}\n${body}\n\`\`\``);
        } catch (readErr) {
          // Log errors reading files but continue
          console.error(`// Error reading file ${full}: ${readErr.message}`);
        }
      }
      // Silently skip other entry types (symlinks, etc.)
    }
  } catch (readDirErr) {
    // Log errors reading directories but continue where possible
    console.error(`// Error reading directory ${dir}: ${readDirErr.message}`);
  }
})(root);
